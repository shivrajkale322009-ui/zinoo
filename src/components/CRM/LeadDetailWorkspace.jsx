import React, { useState, useMemo } from 'react';
import { updateNoteWithDate } from '../../utils/noteDateShortcut';
import NoteText from './NoteText';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  UserCheck,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Share2,
  ChevronRight,
  Edit2,
  Plus,
  HelpCircle,
  Send,
  Eye,
  Check
} from 'lucide-react';
import {
  LEAD_STAGES,
  LEAD_TEMPERATURES,
  CLOSED_LOST_REASONS,
  formatLeadBudget,
  createActivityRecord,
  createClosedLostUpdate,
  isToday,
  isOverdue,
  PREFERRED_AREAS,
  PURCHASE_PURPOSES,
  PURCHASE_TIMELINES,
  LOAN_OPTIONS,
  normalizeIndianPhone
} from '../../utils/crmLeadModel';
import { formatIndianCurrency } from '../../utils/formatIndian';
import { getProjectShareData } from '../../utils/projectShare';
import { getProjectPublicUrl } from '../../utils/projectPublicUrl';
import SiteVisitModal from './SiteVisitModal';
import FollowUpModal from './FollowUpModal';

export default function LeadDetailWorkspace({
  lead,
  projects = [],
  agents = [],
  currentUser = null,
  onBack,
  onUpdateLead
}) {
  const [activeTab, setActiveTab] = useState('requirements'); // 'requirements', 'projects', 'visits', 'followups', 'timeline', 'notes'
  const [isEditingRequirements, setIsEditingRequirements] = useState(false);
  const [reqDraft, setReqDraft] = useState({
    budgetMin: lead?.budgetMin || '',
    budgetMax: lead?.budgetMax || '',
    preferredLocations: lead?.preferredLocations || ['Chakan'],
    plotSize: lead?.plotSize || '',
    purchasePurpose: lead?.purchasePurpose || 'Investment',
    purchaseTimeline: lead?.purchaseTimeline || 'Within 1 Month',
    loanRequired: lead?.loanRequired || 'Maybe',
    notes: lead?.notes?.[0]?.text || ''
  });

  // Modal states
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isCompletingFollowUp, setIsCompletingFollowUp] = useState(false);

  // Closed Lost & Closed Won transition modals
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState(CLOSED_LOST_REASONS[0]);
  const [lostNotes, setLostNotes] = useState('');

  const [isWonModalOpen, setIsWonModalOpen] = useState(false);
  const [wonData, setWonData] = useState({
    purchasedProjectId: '',
    purchasedProjectName: '',
    finalDealValue: lead?.budgetMin || 1500000,
    closingDate: new Date().toISOString().slice(0, 10),
    sellerName: '',
    commissionPercent: 2,
    commissionStatus: 'Pending'
  });

  // Project attach picker
  const [selectedProjectIdToAttach, setSelectedProjectIdToAttach] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  if (!lead) return null;

  const currentStageObj = LEAD_STAGES.find((s) => s.key === lead.stage) || LEAD_STAGES[0];
  const currentTempObj = LEAD_TEMPERATURES.find((t) => t.key === lead.temperature) || LEAD_TEMPERATURES[1];

  // Projects already attached
  const attachedProjects = Array.isArray(lead.recommendedProjects) ? lead.recommendedProjects : [];
  const attachedProjectIds = new Set(attachedProjects.map((p) => p.projectId));

  // Projects available to attach
  const availableProjectsToAttach = projects.filter((p) => {
    const id = p.id || p.projectId;
    return !attachedProjectIds.has(id);
  });

  // Clean WhatsApp and Phone URLs
  const phoneDigits = lead.phone ? String(lead.phone).replace(/\D/g, '') : '';
  const waDigits = lead.whatsapp ? String(lead.whatsapp).replace(/\D/g, '') : phoneDigits;
  const whatsappUrl = waDigits ? `https://wa.me/${waDigits.startsWith('91') ? waDigits : `91${waDigits}`}` : '';
  const callUrl = lead.phone ? `tel:${lead.phone}` : '';

  // Handle stage change
  const handleStageSelect = (newStage) => {
    if (newStage === lead.stage) return;
    if (newStage === 'Closed Lost') {
      setIsLostModalOpen(true);
      return;
    }
    if (newStage === 'Closed Won') {
      setIsWonModalOpen(true);
      return;
    }

    const activity = createActivityRecord({
      type: 'stage_changed',
      title: 'Stage Changed',
      description: `Stage moved from "${lead.stage || 'New'}" to "${newStage}".`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      stage: newStage,
      activities: [activity, ...(lead.activities || [])]
    });
  };

  const [lostSaving, setLostSaving] = useState(false);
  const [lostError, setLostError] = useState('');
  const handleConfirmClosedLost = async () => {
    if (lostSaving) return;
    setLostSaving(true);
    setLostError('');
    try {
      const saved = await onUpdateLead(lead.id, createClosedLostUpdate(lead, lostReason, lostNotes, currentUser));
      if (saved === false) throw new Error('Could not save. Please try again.');
      setIsLostModalOpen(false);
    } catch (error) { setLostError(error.message); }
    finally { setLostSaving(false); }
  };

  const handleConfirmClosedWon = () => {
    const dealVal = Number(wonData.finalDealValue) || 0;
    const commPct = Number(wonData.commissionPercent) || 0;
    const expectedCommission = Math.round(dealVal * (commPct / 100));

    const proj = projects.find((p) => (p.id || p.projectId) === wonData.purchasedProjectId);
    const projName = proj ? (proj.name || proj.projectName) : (wonData.purchasedProjectName || 'Selected Project');

    const activity = createActivityRecord({
      type: 'deal_closed_won',
      title: 'Deal Closed Won! 🎉',
      description: `Purchased ${projName} for ${formatIndianCurrency(dealVal)}. Expected commission: ${formatIndianCurrency(expectedCommission)}.`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      stage: 'Closed Won',
      temperature: 'Hot',
      dealDetails: {
        purchasedProjectId: wonData.purchasedProjectId,
        purchasedProjectName: projName,
        finalDealValue: dealVal,
        closingDate: wonData.closingDate,
        sellerName: wonData.sellerName,
        commissionPercent: commPct,
        expectedCommission,
        commissionStatus: wonData.commissionStatus
      },
      activities: [activity, ...(lead.activities || [])]
    });

    setIsWonModalOpen(false);
  };

  // Temperature update
  const handleTemperatureChange = (newTemp) => {
    if (newTemp === lead.temperature) return;
    const activity = createActivityRecord({
      type: 'temperature_changed',
      title: 'Temperature Changed',
      description: `Updated temperature to ${newTemp}.`,
      user: currentUser
    });
    onUpdateLead(lead.id, {
      temperature: newTemp,
      activities: [activity, ...(lead.activities || [])]
    });
  };

  // Agent reassignment
  const handleAgentChange = (newAgentId) => {
    if (newAgentId === lead.assignedUserId) return;
    const agent = agents.find((a) => (a.id || a.uid) === newAgentId);
    const agentName = agent ? (agent.displayName || agent.name || agent.email) : 'Unassigned';

    const activity = createActivityRecord({
      type: 'agent_reassigned',
      title: 'Lead Reassigned',
      description: `Assigned agent changed to ${agentName}.`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      assignedUserId: newAgentId || null,
      assignedUserName: agentName,
      activities: [activity, ...(lead.activities || [])]
    });
  };

  // Save requirements inline edit
  const handleSaveRequirements = () => {
    const activity = createActivityRecord({
      type: 'requirement_updated',
      title: 'Requirements Updated',
      description: `Updated budget (${formatLeadBudget(reqDraft.budgetMin, reqDraft.budgetMax)}) and preferred areas (${reqDraft.preferredLocations.join(', ')}).`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      budgetMin: reqDraft.budgetMin ? Number(reqDraft.budgetMin) : null,
      budgetMax: reqDraft.budgetMax ? Number(reqDraft.budgetMax) : null,
      preferredLocations: reqDraft.preferredLocations,
      plotSize: reqDraft.plotSize.trim(),
      purchasePurpose: reqDraft.purchasePurpose,
      purchaseTimeline: reqDraft.purchaseTimeline,
      loanRequired: reqDraft.loanRequired,
      activities: [activity, ...(lead.activities || [])]
    });

    setIsEditingRequirements(false);
  };

  // Add internal note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `note_${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
      createdByName: currentUser?.displayName || currentUser?.name || 'Admin'
    };

    const activity = createActivityRecord({
      type: 'note_added',
      title: 'Internal Note Added',
      description: newNoteText.trim().slice(0, 100) + (newNoteText.length > 100 ? '...' : ''),
      user: currentUser
    });

    onUpdateLead(lead.id, {
      notes: [newNote, ...(lead.notes || [])],
      activities: [activity, ...(lead.activities || [])]
    });

    setNewNoteText('');
  };

  // Attach project to lead
  const handleAttachProject = () => {
    if (!selectedProjectIdToAttach) return;
    const proj = projects.find((p) => (p.id || p.projectId) === selectedProjectIdToAttach);
    if (!proj) return;

    const newAttached = {
      projectId: selectedProjectIdToAttach,
      projectName: proj.name || proj.projectName || 'Property',
      location: proj.locality || proj.city || 'Chakan',
      startingPrice: proj.startingPrice || proj.priceFrom || 0,
      plotSize: proj.plotAreaMinSqFt ? `${proj.plotAreaMinSqFt} sq ft` : 'Custom size',
      status: proj.status || 'active',
      sharedAt: new Date().toISOString(),
      reaction: 'pending'
    };

    const activity = createActivityRecord({
      type: 'project_recommended',
      title: 'Project Recommended',
      description: `Attached project: ${newAttached.projectName} (${newAttached.location}).`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      recommendedProjects: [...attachedProjects, newAttached],
      stage: lead.stage === 'New' || lead.stage === 'Contacted' ? 'Projects Suggested' : lead.stage,
      activities: [activity, ...(lead.activities || [])]
    });

    setSelectedProjectIdToAttach('');
  };

  // Share project via WhatsApp
  const handleShareProjectWhatsApp = (projItem) => {
    const proj = projects.find((p) => (p.id || p.projectId) === projItem.projectId) || projItem;
    const url = getProjectPublicUrl(proj);
    const { text } = getProjectShareData(proj, url);
    const greeting = `Hello ${lead.name},\n\nSharing this plot project recommended for your requirement:\n\n`;
    const fullMessage = encodeURIComponent(greeting + text);
    const targetWa = waDigits ? (waDigits.startsWith('91') ? waDigits : `91${waDigits}`) : '';

    if (targetWa) {
      window.open(`https://wa.me/${targetWa}?text=${fullMessage}`, '_blank');
    }

    const activity = createActivityRecord({
      type: 'project_shared_whatsapp',
      title: 'Project Shared on WhatsApp',
      description: `Shared ${projItem.projectName} with buyer on WhatsApp.`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      activities: [activity, ...(lead.activities || [])]
    });
  };

  // Update project reaction
  const handleProjectReaction = (projectId, reaction) => {
    const updated = attachedProjects.map((item) =>
      item.projectId === projectId ? { ...item, reaction } : item
    );

    const activity = createActivityRecord({
      type: 'project_reaction_updated',
      title: 'Project Reaction Recorded',
      description: `Marked "${reaction}" for project.`,
      user: currentUser
    });

    onUpdateLead(lead.id, {
      recommendedProjects: updated,
      activities: [activity, ...(lead.activities || [])]
    });
  };

  // Save visit from modal
  const handleSaveVisit = ({ visit, followUp }) => {
    const existingVisits = Array.isArray(lead.siteVisits) ? lead.siteVisits : [];
    const isEdit = existingVisits.some((v) => v.id === visit.id);
    const updatedVisits = isEdit
      ? existingVisits.map((v) => (v.id === visit.id ? visit : v))
      : [visit, ...existingVisits];

    const updates = {
      siteVisits: updatedVisits
    };

    if (visit.status === 'Completed') {
      updates.stage = lead.stage === 'Visit Scheduled' ? 'Visit Completed' : lead.stage;
    } else if (visit.status === 'Scheduled' && lead.stage !== 'Negotiation' && lead.stage !== 'Closed Won') {
      updates.stage = 'Visit Scheduled';
    }

    const activity = createActivityRecord({
      type: visit.status === 'Completed' ? 'visit_completed' : 'visit_scheduled',
      title: visit.status === 'Completed' ? 'Site Visit Completed' : 'Site Visit Scheduled',
      description: `${visit.projectName} on ${visit.date} at ${visit.time}. Status: ${visit.status}.`,
      user: currentUser
    });

    updates.activities = [activity, ...(lead.activities || [])];

    if (followUp) {
      const existingFollowUps = Array.isArray(lead.followUps) ? lead.followUps : [];
      const newFollowUpRecord = {
        id: `fu_${Date.now()}`,
        date: followUp.date,
        time: followUp.time,
        reason: followUp.reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      updates.nextFollowUpAt = `${followUp.date}T${followUp.time}:00`;
      updates.nextFollowUpReason = followUp.reason;
      updates.followUps = [newFollowUpRecord, ...existingFollowUps];
    }

    onUpdateLead(lead.id, updates);
  };

  // Save follow-up from modal
  const handleSaveFollowUp = ({ completedResult, nextFollowUp }) => {
    const existingFollowUps = Array.isArray(lead.followUps) ? lead.followUps : [];
    const updates = {};
    const activities = [...(lead.activities || [])];

    if (completedResult) {
      // Mark current follow-up completed
      const completedList = existingFollowUps.map((item, idx) => {
        if (idx === 0 && item.status === 'Pending') {
          return {
            ...item,
            status: 'Completed',
            outcome: completedResult.result,
            notes: completedResult.notes,
            completedAt: completedResult.completedAt,
            completedBy: completedResult.completedBy
          };
        }
        return item;
      });

      updates.followUps = completedList;

      activities.unshift(
        createActivityRecord({
          type: 'followup_completed',
          title: 'Follow-up Completed',
          description: `Result: ${completedResult.result}. ${completedResult.notes ? `Notes: ${completedResult.notes}` : ''}`,
          user: currentUser
        })
      );
    }

    if (nextFollowUp) {
      const newRecord = {
        id: `fu_${Date.now()}`,
        date: nextFollowUp.date,
        time: nextFollowUp.time,
        reason: nextFollowUp.reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      updates.nextFollowUpAt = `${nextFollowUp.date}T${nextFollowUp.time}:00`;
      updates.nextFollowUpReason = nextFollowUp.reason;
      updates.followUps = [newRecord, ...(updates.followUps || existingFollowUps)];

      activities.unshift(
        createActivityRecord({
          type: 'followup_scheduled',
          title: 'Follow-up Scheduled',
          description: `Next follow-up on ${nextFollowUp.date} at ${nextFollowUp.time}. Goal: "${nextFollowUp.reason}".`,
          user: currentUser
        })
      );
    } else if (completedResult) {
      updates.nextFollowUpAt = null;
      updates.nextFollowUpReason = '';
    }

    updates.activities = activities;
    onUpdateLead(lead.id, updates);
  };

  return (
    <div className="crm-detail-shell">
      {/* Top Header Card */}
      <div className="crm-detail-header-card">
        <div className="crm-detail-top-nav">
          <button type="button" className="crm-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Leads Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Lead Temperature Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>TEMP:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {LEAD_TEMPERATURES.map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    className={`crm-temp-badge ${lead.temperature === t.key ? 'active' : ''}`}
                    style={{
                      border: `1px solid ${lead.temperature === t.key ? t.text : '#cbd5e1'}`,
                      background: lead.temperature === t.key ? t.bg : '#ffffff',
                      color: t.text,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleTemperatureChange(t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned Agent Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>AGENT:</span>
              <select
                style={{
                  height: 30,
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  padding: '0 6px'
                }}
                value={lead.assignedUserId || ''}
                onChange={(e) => handleAgentChange(e.target.value)}
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id || agent.uid} value={agent.id || agent.uid}>
                    {agent.displayName || agent.name || agent.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Customer Identity & Quick Contact */}
        <div className="crm-customer-summary">
          <div className="crm-customer-identity">
            <div className="crm-customer-avatar">
              {lead.name ? lead.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="crm-customer-info">
              <h2>
                {lead.name && !/^unnamed(?:\s+lead)?$/i.test(lead.name.trim()) ? lead.name : 'Sir/Madam'}
                <span
                  className="crm-badge"
                  style={{
                    backgroundColor: currentStageObj.bg,
                    borderColor: currentStageObj.border,
                    color: currentStageObj.text,
                    fontSize: 12
                  }}
                >
                  {lead.stage || 'New'}
                </span>
              </h2>
              <div className="crm-customer-contacts">
                <span>📱 {lead.phone}</span>
                {lead.source && <span className="crm-source-tag">Source: {lead.source}</span>}
                <span>Created {new Date(lead.createdAt || lead.date || Date.now()).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="crm-header-controls">
            {callUrl && (
              <a href={callUrl} className="crm-btn crm-btn-secondary" style={{ height: 36 }}>
                <Phone size={15} color="#2563eb" /> Call
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="crm-btn crm-btn-secondary"
                style={{ height: 36, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
              >
                <MessageCircle size={15} color="#15803d" /> WhatsApp
              </a>
            )}
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              style={{ height: 36 }}
              onClick={() => {
                setIsCompletingFollowUp(false);
                setIsFollowUpModalOpen(true);
              }}
            >
              <Calendar size={15} /> Schedule Follow-up
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              style={{ height: 36 }}
              onClick={() => {
                setEditingVisit(null);
                setIsVisitModalOpen(true);
              }}
            >
              <Building size={15} /> Schedule Site Visit
            </button>
          </div>
        </div>

        {/* Stage Stepper */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
            Lead Pipeline Stage (Click to move stage):
          </div>
          <div className="crm-stage-stepper">
            {LEAD_STAGES.map((st, idx) => {
              const isCurrent = st.key === lead.stage;
              return (
                <button
                  type="button"
                  key={st.key}
                  className={`crm-step-item ${isCurrent ? 'current' : ''}`}
                  onClick={() => handleStageSelect(st.key)}
                >
                  <span>{idx + 1}.</span> {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Won Deal Banner if Closed Won */}
      {lead.stage === 'Closed Won' && lead.dealDetails && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 15, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} /> Deal Closed Won 🎉
              </strong>
              <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>
                Purchased <strong>{lead.dealDetails.purchasedProjectName}</strong> for{' '}
                <strong>{formatIndianCurrency(lead.dealDetails.finalDealValue)}</strong> on{' '}
                {lead.dealDetails.closingDate}.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#4b7a58' }}>
                Commission ({lead.dealDetails.commissionPercent}%):
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>
                {formatIndianCurrency(lead.dealDetails.expectedCommission)}
                <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 500, padding: '2px 6px', background: '#dcfce7', borderRadius: 4 }}>
                  {lead.dealDetails.commissionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lost Deal Banner if Closed Lost */}
      {lead.stage === 'Closed Lost' && lead.dealDetails && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: 18 }}>
          <strong style={{ fontSize: 14, color: '#be123c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={18} /> Lead Closed Lost
          </strong>
          <div style={{ fontSize: 13, color: '#9f1239', marginTop: 4 }}>
            Reason: <strong>{lead.dealDetails.lostReason}</strong>
            {lead.dealDetails.lostNotes && <span> — {lead.dealDetails.lostNotes}</span>}
          </div>
        </div>
      )}

      {/* Workspace Tabs Navigation */}
      <div className="crm-tab-nav">
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          <FileText size={16} /> Buyer Requirements
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Building size={16} /> Recommended Projects
          <span className="crm-tab-count">{attachedProjects.length}</span>
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          <Calendar size={16} /> Site Visits
          <span className="crm-tab-count">{(lead.siteVisits || []).length}</span>
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === 'followups' ? 'active' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          <Clock size={16} /> Follow-ups
          <span className="crm-tab-count">{(lead.followUps || []).length}</span>
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={16} /> Activity History
          <span className="crm-tab-count">{(lead.activities || []).length}</span>
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <MessageCircle size={16} /> Internal Notes
          <span className="crm-tab-count">{(lead.notes || []).length}</span>
        </button>
      </div>

      {/* Main Tab Panels Grid */}
      <div className="crm-detail-grid">
        {/* Left Column: Active Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TAB 1: REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="crm-card">
              <div className="crm-card-header">
                <h3 className="crm-card-title">
                  <FileText size={18} color="#2563eb" /> Buyer Requirements & Preferences
                </h3>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary"
                  style={{ height: 32, fontSize: 12 }}
                  onClick={() => setIsEditingRequirements(!isEditingRequirements)}
                >
                  <Edit2 size={13} /> {isEditingRequirements ? 'Cancel' : 'Edit Requirements'}
                </button>
              </div>

              {!isEditingRequirements ? (
                <div className="crm-req-grid">
                  <div className="crm-req-item">
                    <span className="crm-req-label">Budget Range</span>
                    <span className="crm-req-value">
                      {formatLeadBudget(lead.budgetMin, lead.budgetMax)}
                    </span>
                  </div>

                  <div className="crm-req-item">
                    <span className="crm-req-label">Preferred Areas</span>
                    <span className="crm-req-value">
                      {Array.isArray(lead.preferredLocations) && lead.preferredLocations.length > 0
                        ? lead.preferredLocations.join(', ')
                        : 'Any area around Chakan'}
                    </span>
                  </div>

                  <div className="crm-req-item">
                    <span className="crm-req-label">Plot Size</span>
                    <span className="crm-req-value">{lead.plotSize || 'Not specified'}</span>
                  </div>

                  <div className="crm-req-item">
                    <span className="crm-req-label">Purchase Purpose</span>
                    <span className="crm-req-value">{lead.purchasePurpose || 'Investment'}</span>
                  </div>

                  <div className="crm-req-item">
                    <span className="crm-req-label">Timeline</span>
                    <span className="crm-req-value">{lead.purchaseTimeline || 'Within 1 Month'}</span>
                  </div>

                  <div className="crm-req-item">
                    <span className="crm-req-label">Loan Required?</span>
                    <span className="crm-req-value">{lead.loanRequired || 'Maybe'}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="crm-form-row">
                    <div className="crm-form-field">
                      <label>Budget Minimum (₹)</label>
                      <input
                        type="number"
                        step="50000"
                        value={reqDraft.budgetMin}
                        onChange={(e) => setReqDraft((p) => ({ ...p, budgetMin: e.target.value }))}
                      />
                    </div>
                    <div className="crm-form-field">
                      <label>Budget Maximum (₹)</label>
                      <input
                        type="number"
                        step="50000"
                        value={reqDraft.budgetMax}
                        onChange={(e) => setReqDraft((p) => ({ ...p, budgetMax: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="crm-form-field">
                    <label>Preferred Areas</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {PREFERRED_AREAS.map((area) => {
                        const isSel = reqDraft.preferredLocations.includes(area);
                        return (
                          <button
                            type="button"
                            key={area}
                            className={`crm-chip ${isSel ? 'active' : ''}`}
                            onClick={() => {
                              setReqDraft((p) => {
                                const exists = p.preferredLocations.includes(area);
                                return {
                                  ...p,
                                  preferredLocations: exists
                                    ? p.preferredLocations.filter((a) => a !== area)
                                    : [...p.preferredLocations, area]
                                };
                              });
                            }}
                          >
                            <MapPin size={12} /> {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="crm-form-row">
                    <div className="crm-form-field">
                      <label>Plot Size Requirement</label>
                      <input
                        type="text"
                        placeholder="e.g. 1500 sq ft"
                        value={reqDraft.plotSize}
                        onChange={(e) => setReqDraft((p) => ({ ...p, plotSize: e.target.value }))}
                      />
                    </div>
                    <div className="crm-form-field">
                      <label>Purchase Purpose</label>
                      <select
                        value={reqDraft.purchasePurpose}
                        onChange={(e) => setReqDraft((p) => ({ ...p, purchasePurpose: e.target.value }))}
                      >
                        {PURCHASE_PURPOSES.map((purp) => (
                          <option key={purp} value={purp}>{purp}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="crm-form-row">
                    <div className="crm-form-field">
                      <label>Timeline</label>
                      <select
                        value={reqDraft.purchaseTimeline}
                        onChange={(e) => setReqDraft((p) => ({ ...p, purchaseTimeline: e.target.value }))}
                      >
                        {PURCHASE_TIMELINES.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="crm-form-field">
                      <label>Loan Required</label>
                      <select
                        value={reqDraft.loanRequired}
                        onChange={(e) => setReqDraft((p) => ({ ...p, loanRequired: e.target.value }))}
                      >
                        {LOAN_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      className="crm-btn crm-btn-secondary"
                      onClick={() => setIsEditingRequirements(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="crm-btn crm-btn-primary"
                      onClick={handleSaveRequirements}
                    >
                      Save Requirement Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECOMMENDED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="crm-card">
              <div className="crm-card-header">
                <div>
                  <h3 className="crm-card-title">
                    <Building size={18} color="#2563eb" /> Recommended & Shared Projects
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
                    Attach verified Zinoo projects to share brochures, gather buyer feedback, and schedule visits.
                  </p>
                </div>
              </div>

              {/* Attach project bar */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <select
                  style={{ flex: 1, height: 38, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  value={selectedProjectIdToAttach}
                  onChange={(e) => setSelectedProjectIdToAttach(e.target.value)}
                >
                  <option value="">-- Select a Zinoo project to recommend --</option>
                  {availableProjectsToAttach.map((p) => (
                    <option key={p.id || p.projectId} value={p.id || p.projectId}>
                      {p.name || p.projectName} — {p.locality || p.city || 'Chakan'} ({formatIndianCurrency(p.startingPrice || p.priceFrom)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  style={{ height: 38 }}
                  disabled={!selectedProjectIdToAttach}
                  onClick={handleAttachProject}
                >
                  <Plus size={16} /> Attach Project
                </button>
              </div>

              {/* Attached projects list */}
              {attachedProjects.length === 0 ? (
                <div className="crm-empty-state">
                  <Building size={36} />
                  <h3>No projects recommended yet</h3>
                  <p>Select a project from the catalog above to recommend it to {lead.name || 'this buyer'}.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {attachedProjects.map((p) => {
                    const originalProj = projects.find((op) => (op.id || op.projectId) === p.projectId) || p;
                    return (
                      <div key={p.projectId} className="crm-project-card">
                        <div className="crm-project-info">
                          <span className="crm-project-name">{p.projectName}</span>
                          <div className="crm-project-meta">
                            <span>📍 {p.location}</span>
                            <span>💰 From {formatIndianCurrency(p.startingPrice)}</span>
                            {p.plotSize && <span>📐 {p.plotSize}</span>}
                            <span>Shared: {new Date(p.sharedAt || Date.now()).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>

                        <div className="crm-project-actions">
                          {/* Reaction badge/selector */}
                          <select
                            style={{
                              height: 32,
                              fontSize: 12,
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: p.reaction === 'interested' ? '#f0fdf4' : p.reaction === 'not_interested' ? '#fff1f2' : '#ffffff',
                              color: p.reaction === 'interested' ? '#15803d' : p.reaction === 'not_interested' ? '#be123c' : '#334155'
                            }}
                            value={p.reaction || 'pending'}
                            onChange={(e) => handleProjectReaction(p.projectId, e.target.value)}
                          >
                            <option value="pending">Reaction: Pending</option>
                            <option value="interested">👍 Interested</option>
                            <option value="not_interested">👎 Not Interested</option>
                          </select>

                          {/* Share on WhatsApp */}
                          <button
                            type="button"
                            className="crm-btn crm-btn-secondary"
                            style={{ height: 32, fontSize: 12, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                            onClick={() => handleShareProjectWhatsApp(p)}
                            title="Send project presentation & link to buyer on WhatsApp"
                          >
                            <Share2 size={13} /> Share WhatsApp
                          </button>

                          {/* Schedule Visit */}
                          <button
                            type="button"
                            className="crm-btn crm-btn-primary"
                            style={{ height: 32, fontSize: 12 }}
                            onClick={() => {
                              setEditingVisit({
                                projectId: p.projectId,
                                projectName: p.projectName,
                                date: new Date().toISOString().slice(0, 10),
                                time: '11:00',
                                status: 'Scheduled'
                              });
                              setIsVisitModalOpen(true);
                            }}
                          >
                            <Calendar size={13} /> Schedule Visit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SITE VISITS */}
          {activeTab === 'visits' && (
            <div className="crm-card">
              <div className="crm-card-header">
                <div>
                  <h3 className="crm-card-title">
                    <Calendar size={18} color="#2563eb" /> Site Visit History & Upcoming Visits
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
                    Track on-ground property tours, customer reactions, and negotiation notes.
                  </p>
                </div>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  style={{ height: 32, fontSize: 12 }}
                  onClick={() => {
                    setEditingVisit(null);
                    setIsVisitModalOpen(true);
                  }}
                >
                  <Plus size={14} /> Schedule New Visit
                </button>
              </div>

              {(!lead.siteVisits || lead.siteVisits.length === 0) ? (
                <div className="crm-empty-state">
                  <Calendar size={36} />
                  <h3>No site visits scheduled yet</h3>
                  <p>Schedule a visit for this buyer to explore plotted projects on-ground in Chakan.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {lead.siteVisits.map((v) => {
                    const isUpcoming = v.status === 'Scheduled' || v.status === 'Confirmed';
                    return (
                      <div key={v.id} className={`crm-visit-card ${isUpcoming ? 'highlight' : ''}`}>
                        <div className="crm-visit-top">
                          <div>
                            <strong style={{ fontSize: 14, color: '#0f172a' }}>{v.projectName}</strong>
                            <div className="crm-visit-details" style={{ marginTop: 4 }}>
                              <span>📅 {v.date}</span>
                              <span>⏰ {v.time}</span>
                              <span>Host: {v.assignedAgent || 'Sales Agent'}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              className="crm-badge"
                              style={{
                                background: v.status === 'Completed' ? '#f0fdf4' : v.status === 'Scheduled' ? '#fffbeb' : '#f1f5f9',
                                color: v.status === 'Completed' ? '#15803d' : v.status === 'Scheduled' ? '#b45309' : '#334155',
                                border: `1px solid ${v.status === 'Completed' ? '#bbf7d0' : '#fde68a'}`
                              }}
                            >
                              {v.status}
                            </span>
                            <button
                              type="button"
                              className="crm-btn crm-btn-secondary"
                              style={{ height: 28, fontSize: 11 }}
                              onClick={() => {
                                setEditingVisit(v);
                                setIsVisitModalOpen(true);
                              }}
                            >
                              {v.status === 'Scheduled' ? 'Record Outcome' : 'Edit Visit'}
                            </button>
                          </div>
                        </div>

                        {v.notes && (
                          <div style={{ fontSize: 12, color: '#475569' }}>
                            <strong>Logistics:</strong> {v.notes}
                          </div>
                        )}

                        {v.feedback && (
                          <div className="crm-feedback-box">
                            <div>
                              <strong>Buyer Reaction:</strong> {v.feedback.customerReaction} (Intent: {v.feedback.interestLevel})
                            </div>
                            {v.feedback.negotiationNotes && (
                              <div>
                                <strong>Negotiation:</strong> {v.feedback.negotiationNotes}
                              </div>
                            )}
                            {v.feedback.nextAction && (
                              <div>
                                <strong>Next Action:</strong> {v.feedback.nextAction}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="crm-card">
              <div className="crm-card-header">
                <div>
                  <h3 className="crm-card-title">
                    <Clock size={18} color="#2563eb" /> Follow-up Workflow & Log
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
                    Never miss a follow-up. Complete scheduled calls and maintain an unbroken history.
                  </p>
                </div>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  style={{ height: 32, fontSize: 12 }}
                  onClick={() => {
                    setIsCompletingFollowUp(false);
                    setIsFollowUpModalOpen(true);
                  }}
                >
                  <Plus size={14} /> Schedule Follow-up
                </button>
              </div>

              {/* Current Next Follow-Up Spotlight Card */}
              {lead.nextFollowUpAt && (
                <div
                  style={{
                    background: isOverdue(lead.nextFollowUpAt) ? '#fff1f2' : isToday(lead.nextFollowUpAt) ? '#fffbeb' : '#eff6ff',
                    border: `1px solid ${isOverdue(lead.nextFollowUpAt) ? '#fecdd3' : isToday(lead.nextFollowUpAt) ? '#fde68a' : '#bfdbfe'}`,
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: isOverdue(lead.nextFollowUpAt) ? '#be123c' : isToday(lead.nextFollowUpAt) ? '#b45309' : '#1d4ed8' }}>
                      {isOverdue(lead.nextFollowUpAt) ? '⚠️ Overdue Follow-up' : isToday(lead.nextFollowUpAt) ? '📅 Follow-up Due Today' : '⏰ Upcoming Scheduled Follow-up'}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                      {new Date(lead.nextFollowUpAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at{' '}
                      {new Date(lead.nextFollowUpAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                      Goal: <em>"{lead.nextFollowUpReason || 'Routine check-in'}"</em>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="crm-btn crm-btn-primary"
                      style={{ height: 34, fontSize: 12 }}
                      onClick={() => {
                        setIsCompletingFollowUp(true);
                        setIsFollowUpModalOpen(true);
                      }}
                    >
                      <CheckCircle2 size={14} /> Complete & Log Result
                    </button>
                  </div>
                </div>
              )}

              {/* History of Follow-ups */}
              <div style={{ marginTop: 10 }}>
                <h4 style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>
                  Follow-up History Log
                </h4>
                {(!lead.followUps || lead.followUps.length === 0) ? (
                  <p style={{ fontSize: 12, color: '#64748b' }}>No past follow-up records found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {lead.followUps.map((fu) => (
                      <div
                        key={fu.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: 12,
                          background: fu.status === 'Completed' ? '#ffffff' : '#f8fafc'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                            📅 {fu.date} at {fu.time}
                          </span>
                          <span
                            className="crm-badge"
                            style={{
                              background: fu.status === 'Completed' ? '#f0fdf4' : '#f1f5f9',
                              color: fu.status === 'Completed' ? '#15803d' : '#475569',
                              fontSize: 11
                            }}
                          >
                            {fu.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                          <strong>Reason:</strong> {fu.reason}
                        </div>
                        {fu.outcome && (
                          <div style={{ fontSize: 12, color: '#15803d', marginTop: 4, background: '#f0fdf4', padding: '6px 10px', borderRadius: 4 }}>
                            <strong>Outcome:</strong> {fu.outcome} {fu.notes ? `— ${fu.notes}` : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="crm-card">
              <div className="crm-card-header">
                <h3 className="crm-card-title">
                  <Clock size={18} color="#2563eb" /> Chronological Activity Audit Trail
                </h3>
              </div>

              {(!lead.activities || lead.activities.length === 0) ? (
                <div className="crm-empty-state">
                  <Clock size={36} />
                  <h3>No recorded activity yet</h3>
                  <p>Interactions, stage shifts, and project shares will appear here chronologically.</p>
                </div>
              ) : (
                <div className="crm-timeline">
                  {lead.activities.map((act) => (
                    <div key={act.id} className="crm-timeline-item">
                      <div className="crm-timeline-dot" />
                      <div className="crm-timeline-head">
                        <span className="crm-timeline-title">{act.title || act.type}</span>
                        <span className="crm-timeline-time">
                          {new Date(act.createdAt).toLocaleString('en-GB', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="crm-timeline-desc">{act.description}</div>
                      <div className="crm-timeline-author">By: {act.createdByName || 'Admin'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="crm-card">
              <div className="crm-card-header">
                <div>
                  <h3 className="crm-card-title">
                    <MessageCircle size={18} color="#2563eb" /> Internal Team Notes
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
                    Confidential internal sales notes. Never visible to buyers or developers.
                  </p>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  placeholder="Type an internal note regarding buyer sentiment, payment plan discussion, or site visit feedback..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={!newNoteText.trim()}>
                    <Send size={14} /> Add Note
                  </button>
                </div>
              </form>

              {/* Notes list */}
              {(!lead.notes || lead.notes.length === 0) ? (
                <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                  No internal notes recorded yet.
                </p>
              ) : (
                <div className="crm-notes-list">
                  {lead.notes.map((note) => (
                    <div key={note.id} className="crm-note-bubble">
                      <div className="crm-note-meta">
                        <strong style={{ color: '#0f172a' }}>{note.createdByName || 'Admin'}</strong>
                        <span>
                          {new Date(note.createdAt).toLocaleString('en-GB', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {note.stage && <span className="crm-note-stage-tag">{note.stage}</span>}
                      <div className="crm-note-text"><NoteText>{note.text}</NoteText></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Quick Context Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Follow-up Snapshot */}
          <div className="crm-card" style={{ padding: 16 }}>
            <h4 style={{ margin: 0, fontSize: 13, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} color="#2563eb" /> Next Follow-up
            </h4>
            {lead.nextFollowUpAt ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isOverdue(lead.nextFollowUpAt) ? '#be123c' : '#0f172a' }}>
                  {new Date(lead.nextFollowUpAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at{' '}
                  {new Date(lead.nextFollowUpAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  {lead.nextFollowUpReason || 'Scheduled call'}
                </div>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary"
                  style={{ width: '100%', height: 32, fontSize: 12, marginTop: 10 }}
                  onClick={() => {
                    setIsCompletingFollowUp(true);
                    setIsFollowUpModalOpen(true);
                  }}
                >
                  <CheckCircle2 size={13} /> Complete Follow-up
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                No active follow-up scheduled.
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary"
                  style={{ width: '100%', height: 32, fontSize: 12, marginTop: 8 }}
                  onClick={() => {
                    setIsCompletingFollowUp(false);
                    setIsFollowUpModalOpen(true);
                  }}
                >
                  <Plus size={13} /> Schedule Now
                </button>
              </div>
            )}
          </div>

          {/* Quick Summary of Projects & Visits */}
          <div className="crm-card" style={{ padding: 16 }}>
            <h4 style={{ margin: 0, fontSize: 13, color: '#0f172a' }}>Workspace Snapshot</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Stage</span>
                <strong>{lead.stage || 'New'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Temperature</span>
                <strong>{currentTempObj.icon} {lead.temperature || 'Warm'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Assigned Agent</span>
                <strong>{lead.assignedUserName || 'Unassigned'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Shared Projects</span>
                <strong>{attachedProjects.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Site Visits</span>
                <strong>{(lead.siteVisits || []).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Source</span>
                <strong>{lead.source || 'Website'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site Visit Modal */}
      <SiteVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSave={handleSaveVisit}
        projects={projects}
        agents={agents}
        lead={lead}
        currentUser={currentUser}
        initialVisit={editingVisit}
      />

      {/* Follow-up Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSave={handleSaveFollowUp}
        lead={lead}
        currentUser={currentUser}
        isCompleting={isCompletingFollowUp}
      />

      {/* Closed Lost Modal */}
      {isLostModalOpen && (
        <div className="crm-modal-backdrop" onClick={() => setIsLostModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3 style={{ color: '#be123c' }}>Mark Lead as Closed Lost</h3>
              <button type="button" className="crm-icon-btn" onClick={() => setIsLostModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="crm-modal-body">
              <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                Please record why this buyer could not close a deal to keep pipeline analytics accurate:
              </p>

              <div className="crm-form-field">
                <label>Loss Reason *</label>
                <select value={lostReason} onChange={(e) => setLostReason(e.target.value)}>
                  {CLOSED_LOST_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="crm-form-field">
                <label>Additional Notes / Feedback</label>
                <textarea
                  placeholder="e.g. Bought resale plot in Kuruli instead due to budget constraint..."
                  value={lostNotes}
                  onChange={(event) => updateNoteWithDate(event, setLostNotes)}
                  disabled={lostSaving}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                      event.preventDefault();
                      if (!event.repeat && !lostSaving) handleConfirmClosedLost();
                    }
                  }}
                  rows={2}
                />
                <small>Enter to save · Shift+Enter for a new line</small>
              </div>
            </div>
            <div className="crm-modal-footer">
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setIsLostModalOpen(false)}>
                Cancel
              </button>
              {lostError && <p role="alert">{lostError}</p>}
              <button type="button" className="crm-btn crm-btn-outline-danger" disabled={lostSaving} onClick={handleConfirmClosedLost}>
                Confirm Closed Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closed Won Modal */}
      {isWonModalOpen && (
        <div className="crm-modal-backdrop" onClick={() => setIsWonModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3 style={{ color: '#15803d' }}>🎉 Mark Lead as Closed Won</h3>
              <button type="button" className="crm-icon-btn" onClick={() => setIsWonModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="crm-modal-body">
              <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                Congratulations! Record deal terms, closing date, and expected seller commission:
              </p>

              <div className="crm-form-field">
                <label>Purchased Project *</label>
                <select
                  value={wonData.purchasedProjectId}
                  onChange={(e) => setWonData((p) => ({ ...p, purchasedProjectId: e.target.value }))}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((proj) => (
                    <option key={proj.id || proj.projectId} value={proj.id || proj.projectId}>
                      {proj.name || proj.projectName} ({proj.locality || proj.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="crm-form-row">
                <div className="crm-form-field">
                  <label>Final Deal Value (₹) *</label>
                  <input
                    type="number"
                    value={wonData.finalDealValue}
                    onChange={(e) => setWonData((p) => ({ ...p, finalDealValue: e.target.value }))}
                    required
                  />
                </div>

                <div className="crm-form-field">
                  <label>Closing Date</label>
                  <input
                    type="date"
                    value={wonData.closingDate}
                    onChange={(e) => setWonData((p) => ({ ...p, closingDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="crm-form-row">
                <div className="crm-form-field">
                  <label>Commission (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={wonData.commissionPercent}
                    onChange={(e) => setWonData((p) => ({ ...p, commissionPercent: e.target.value }))}
                  />
                </div>

                <div className="crm-form-field">
                  <label>Commission Status</label>
                  <select
                    value={wonData.commissionStatus}
                    onChange={(e) => setWonData((p) => ({ ...p, commissionStatus: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, fontSize: 13, color: '#166534' }}>
                Expected Seller Commission:{' '}
                <strong>
                  {formatIndianCurrency((Number(wonData.finalDealValue) || 0) * ((Number(wonData.commissionPercent) || 0) / 100))}
                </strong>
              </div>
            </div>
            <div className="crm-modal-footer">
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setIsWonModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="crm-btn crm-btn-primary" onClick={handleConfirmClosedWon}>
                Save Won Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
