import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { getSampleDemoLeads } from '../../utils/crmLeadModel';
import LeadTable from './LeadTable';
import LeadDetailWorkspace from './LeadDetailWorkspace';
import AddLeadModal from './AddLeadModal';
import CRMMetricsModal from './CRMMetricsModal';
import '../../styles/lead-crm.css';

export default function LeadManagementWorkspace({
  leads: propsLeads = [],
  projects = [],
  user = null,
  onSuccess,
  onError,
  initialLeadId = null
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [localLeads, setLocalLeads] = useState(propsLeads);

  // Sync propsLeads whenever updated
  useEffect(() => {
    if (propsLeads && propsLeads.length > 0) {
      setLocalLeads(propsLeads);
    }
  }, [propsLeads]);

  // Read lead ID from URL if navigated directly (e.g. /admin/leads/:leadId)
  useEffect(() => {
    const parseUrlLead = () => {
      const path = window.location.pathname;
      const match = path.match(/\/admin\/leads\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        setSelectedLeadId(match[1]);
      } else if (path === '/admin/leads') {
        setSelectedLeadId(null);
      }
    };

    parseUrlLead();
    window.addEventListener('popstate', parseUrlLead);
    return () => window.removeEventListener('popstate', parseUrlLead);
  }, []);

  // Update URL on lead selection
  const handleSelectLead = useCallback((leadId) => {
    setSelectedLeadId(leadId);
    if (leadId) {
      window.history.pushState({ leadId }, '', `/admin/leads/${leadId}`);
    } else {
      window.history.pushState({}, '', '/admin/leads');
    }
  }, []);

  // Back to leads list
  const handleBackToList = useCallback(() => {
    handleSelectLead(null);
  }, [handleSelectLead]);

  // Find currently selected lead
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return localLeads.find((l) => l.id === selectedLeadId) || null;
  }, [localLeads, selectedLeadId]);

  // Sellers are property owners, not CRM assignment agents.
  const agentsList = useMemo(() => {
    const list = [];

    if (user?.uid) {
      list.unshift({
        id: user.uid,
        displayName: user.displayName || user.name || 'Admin',
        email: user.email
      });
    }

    return list;
  }, [user]);

  // Add new lead handler
  const handleCreateLead = async (leadData) => {
    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        ...leadData,
        createdBy: auth.currentUser?.uid || user?.uid || 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update local state immediately for fast feedback
      const createdRecord = { id: docRef.id, ...leadData, createdAt: new Date().toISOString() };
      setLocalLeads((prev) => [createdRecord, ...prev]);

      onSuccess?.(`Lead for ${leadData.name} created successfully.`);
      handleSelectLead(docRef.id);
    } catch (err) {
      console.error('[Zinoo CRM] Error creating lead:', err);
      onError?.(err?.message || 'Failed to create new lead in database.');
      throw err;
    }
  };

  // Update lead handler
  const handleUpdateLead = async (leadId, updates) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      setLocalLeads((prev) =>
        prev.map((item) => (item.id === leadId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
      );
      onSuccess?.('Lead updated successfully.');
      return true;
    } catch (err) {
      console.error('[Zinoo CRM] Error updating lead:', err);
      onError?.(err?.message || 'Failed to update lead.');
      return false;
    }
  };

  // Load realistic sample demo leads
  const handleLoadSampleData = async () => {
    try {
      const sampleLeads = getSampleDemoLeads();
      const batch = writeBatch(db);

      sampleLeads.forEach((sample) => {
        const leadRef = doc(collection(db, 'leads'));
        batch.set(leadRef, {
          ...sample,
          createdBy: auth.currentUser?.uid || user?.uid || 'admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      onSuccess?.('Loaded 6 realistic sample leads for Chakan region.');
    } catch (err) {
      console.error('[Zinoo CRM] Error seeding demo leads:', err);
      onError?.(err?.message || 'Failed to load sample leads.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {selectedLead ? (
        <LeadDetailWorkspace
          lead={selectedLead}
          projects={projects}
          agents={agentsList}
          currentUser={user}
          onBack={handleBackToList}
          onUpdateLead={handleUpdateLead}
        />
      ) : (
        <LeadTable
          onUpdateLead={handleUpdateLead}
          currentUser={user}
          leads={localLeads}
          agents={agentsList}
          onSelectLead={handleSelectLead}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenMetrics={() => setIsMetricsModalOpen(true)}
          onLoadSampleData={localLeads.length === 0 ? handleLoadSampleData : null}
        />
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateLead}
        existingLeads={localLeads}
        agents={agentsList}
        currentUser={user}
        onOpenExistingLead={handleSelectLead}
      />

      {/* Conversion Funnel Metrics Modal */}
      <CRMMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        leads={localLeads}
      />
    </div>
  );
}
