import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';
import { SITE_VISIT_STATUSES } from '../../utils/crmLeadModel';

export default function SiteVisitModal({
  isOpen,
  onClose,
  onSave,
  projects = [],
  agents = [],
  lead = null,
  currentUser = null,
  initialVisit = null
}) {
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    date: new Date().toISOString().slice(0, 10),
    time: '11:00',
    assignedAgent: lead?.assignedUserName || currentUser?.displayName || 'Admin',
    status: 'Scheduled',
    notes: '',
    customerReaction: 'Positive',
    interestLevel: 'High',
    negotiationNotes: '',
    nextAction: '',
    scheduleFollowUp: false,
    followUpDate: '',
    followUpTime: '11:00',
    followUpReason: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialVisit) {
      setFormData({
        projectId: initialVisit.projectId || '',
        projectName: initialVisit.projectName || '',
        date: initialVisit.date || new Date().toISOString().slice(0, 10),
        time: initialVisit.time || '11:00',
        assignedAgent: initialVisit.assignedAgent || lead?.assignedUserName || 'Admin',
        status: initialVisit.status || 'Scheduled',
        notes: initialVisit.notes || '',
        customerReaction: initialVisit.feedback?.customerReaction || 'Positive',
        interestLevel: initialVisit.feedback?.interestLevel || 'High',
        negotiationNotes: initialVisit.feedback?.negotiationNotes || '',
        nextAction: initialVisit.feedback?.nextAction || '',
        scheduleFollowUp: false,
        followUpDate: '',
        followUpTime: '11:00',
        followUpReason: ''
      });
    } else {
      // Pick first recommended project if exists, or first project in list
      const defaultProj = (lead?.recommendedProjects && lead.recommendedProjects[0]) || (projects && projects[0]) || null;
      setFormData((prev) => ({
        ...prev,
        projectId: defaultProj?.projectId || defaultProj?.id || '',
        projectName: defaultProj?.projectName || defaultProj?.name || '',
        assignedAgent: lead?.assignedUserName || currentUser?.displayName || 'Admin',
        status: 'Scheduled'
      }));
    }
  }, [initialVisit, lead, projects, currentUser]);

  if (!isOpen) return null;

  const handleProjectSelect = (e) => {
    const projId = e.target.value;
    const proj = projects.find((p) => p.id === projId || p.projectId === projId);
    setFormData((p) => ({
      ...p,
      projectId: projId,
      projectName: proj ? (proj.name || proj.projectName || 'Selected project') : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.projectId) {
      setError('Please select a project for the site visit.');
      return;
    }
    if (!formData.date) {
      setError('Please select a valid date for the visit.');
      return;
    }

    const visitRecord = {
      id: initialVisit?.id || `visit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId: formData.projectId,
      projectName: formData.projectName,
      date: formData.date,
      time: formData.time,
      assignedAgent: formData.assignedAgent,
      status: formData.status,
      notes: formData.notes.trim(),
      updatedAt: new Date().toISOString()
    };

    if (formData.status === 'Completed' || formData.negotiationNotes || formData.nextAction) {
      visitRecord.feedback = {
        customerReaction: formData.customerReaction,
        interestLevel: formData.interestLevel,
        negotiationNotes: formData.negotiationNotes.trim(),
        nextAction: formData.nextAction.trim()
      };
    }

    onSave({
      visit: visitRecord,
      followUp: formData.scheduleFollowUp && formData.followUpDate
        ? {
            date: formData.followUpDate,
            time: formData.followUpTime || '11:00',
            reason: formData.followUpReason || `Follow-up after ${formData.projectName} site visit`
          }
        : null
    });

    onClose();
  };

  return (
    <div className="crm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crm-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{initialVisit ? 'Update Site Visit' : 'Schedule Site Visit'}</h3>
          <button type="button" className="crm-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-body">
            {error && (
              <div className="crm-alert-danger" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="crm-form-field">
              <label>Project to Visit *</label>
              <select value={formData.projectId} onChange={handleProjectSelect} required>
                <option value="">-- Choose Project --</option>
                {projects.map((proj) => {
                  const id = proj.id || proj.projectId;
                  const name = proj.name || proj.projectName || 'Untitled';
                  const loc = proj.locality || proj.city || '';
                  return (
                    <option key={id} value={id}>
                      {name} {loc ? `(${loc})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="crm-form-row">
              <div className="crm-form-field">
                <label>Visit Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>

              <div className="crm-form-field">
                <label>Visit Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="crm-form-row">
              <div className="crm-form-field">
                <label>Assigned Agent / Host</label>
                <select
                  value={formData.assignedAgent}
                  onChange={(e) => setFormData((p) => ({ ...p, assignedAgent: e.target.value }))}
                >
                  <option value={lead?.assignedUserName || 'Admin'}>{lead?.assignedUserName || 'Assigned Lead Agent'}</option>
                  {agents.map((agent) => (
                    <option key={agent.id || agent.uid} value={agent.displayName || agent.name || agent.email}>
                      {agent.displayName || agent.name || agent.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="crm-form-field">
                <label>Visit Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                >
                  {SITE_VISIT_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="crm-form-field">
              <label>Logistics & Meeting Notes</label>
              <textarea
                placeholder="e.g. Meeting at sales lounge near Chakan-Shikrapur road. Client coming with family."
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Post-Visit Outcome Form (shows when Completed) */}
            {formData.status === 'Completed' && (
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <strong style={{ fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} color="#15803d" />
                  Site Visit Outcome & Customer Feedback
                </strong>

                <div className="crm-form-row">
                  <div className="crm-form-field">
                    <label>Customer Reaction</label>
                    <select
                      value={formData.customerReaction}
                      onChange={(e) => setFormData((p) => ({ ...p, customerReaction: e.target.value }))}
                    >
                      <option value="Very positive">Very positive</option>
                      <option value="Positive">Positive</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Negative">Negative / Unhappy</option>
                    </select>
                  </div>

                  <div className="crm-form-field">
                    <label>Buying Intent Level</label>
                    <select
                      value={formData.interestLevel}
                      onChange={(e) => setFormData((p) => ({ ...p, interestLevel: e.target.value }))}
                    >
                      <option value="High">🔥 High (Ready to discuss token)</option>
                      <option value="Medium">🟡 Medium (Evaluating options)</option>
                      <option value="Low">❄️ Low (Unlikely to buy)</option>
                    </select>
                  </div>
                </div>

                <div className="crm-form-field">
                  <label>Negotiation & Plot Preferences</label>
                  <textarea
                    placeholder="e.g. Client liked East-facing plot 18. Asking for ₹50,000 developer concession."
                    value={formData.negotiationNotes}
                    onChange={(e) => setFormData((p) => ({ ...p, negotiationNotes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="crm-form-field">
                  <label>Next Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Send finalized cost sheet and plot demarcation certificate"
                    value={formData.nextAction}
                    onChange={(e) => setFormData((p) => ({ ...p, nextAction: e.target.value }))}
                  />
                </div>

                <div style={{ marginTop: 4 }}>
                  <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.scheduleFollowUp}
                      onChange={(e) => setFormData((p) => ({ ...p, scheduleFollowUp: e.target.checked }))}
                    />
                    Schedule a post-visit follow-up call
                  </label>
                </div>

                {formData.scheduleFollowUp && (
                  <div className="crm-form-row" style={{ marginTop: 4 }}>
                    <div className="crm-form-field">
                      <label>Follow-up Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={formData.followUpDate}
                        onChange={(e) => setFormData((p) => ({ ...p, followUpDate: e.target.value }))}
                        required={formData.scheduleFollowUp}
                      />
                    </div>
                    <div className="crm-form-field">
                      <label>Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. Check family decision on Plot 18"
                        value={formData.followUpReason}
                        onChange={(e) => setFormData((p) => ({ ...p, followUpReason: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="crm-modal-footer">
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              {initialVisit ? 'Save Visit Changes' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
