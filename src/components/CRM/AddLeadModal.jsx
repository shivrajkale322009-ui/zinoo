import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, UserCheck, Calendar, Phone, MessageSquare, DollarSign, MapPin } from 'lucide-react';
import {
  LEAD_SOURCES,
  PREFERRED_AREAS,
  PURCHASE_PURPOSES,
  PURCHASE_TIMELINES,
  LOAN_OPTIONS,
  normalizeIndianPhone,
  getPhoneDigits,
  checkDuplicateLead,
  createActivityRecord
} from '../../utils/crmLeadModel';

export default function AddLeadModal({
  isOpen,
  onClose,
  onSubmit,
  existingLeads = [],
  agents = [],
  currentUser = null,
  onOpenExistingLead
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    sameAsMobile: true,
    source: 'Website',
    budgetMin: '',
    budgetMax: '',
    preferredLocations: ['Chakan'],
    plotSize: '',
    purchasePurpose: 'Investment',
    purchaseTimeline: 'Within 1 Month',
    loanRequired: 'Maybe',
    notes: '',
    assignedUserId: currentUser?.uid || '',
    nextFollowUpDate: '',
    nextFollowUpTime: '11:00',
    nextFollowUpReason: 'Initial requirement discussion',
    overrideDuplicate: false
  });

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check duplicate as user types phone
  const duplicateMatch = useMemo(() => {
    if (!formData.phone || formData.phone.length < 10) return null;
    return checkDuplicateLead(formData.phone, existingLeads);
  }, [formData.phone, existingLeads]);

  if (!isOpen) return null;

  const handleLocationToggle = (area) => {
    setFormData((prev) => {
      const exists = prev.preferredLocations.includes(area);
      const updated = exists
        ? prev.preferredLocations.filter((item) => item !== area)
        : [...prev.preferredLocations, area];
      return { ...prev, preferredLocations: updated.length ? updated : [area] };
    });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      phone: val,
      whatsapp: prev.sameAsMobile ? val : prev.whatsapp,
      overrideDuplicate: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanName = formData.name.trim();
    if (!cleanName) {
      setValidationError('Customer Name is required.');
      return;
    }

    const normalizedPhone = normalizeIndianPhone(formData.phone);
    if (!normalizedPhone) {
      setValidationError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    // Check duplicate
    if (duplicateMatch && !formData.overrideDuplicate) {
      setValidationError('This mobile number already belongs to an existing lead. Review duplicate warning below.');
      return;
    }

    // Validate budget
    const bMin = formData.budgetMin ? Number(formData.budgetMin) : null;
    const bMax = formData.budgetMax ? Number(formData.budgetMax) : null;
    if (bMin !== null && bMax !== null && bMin > bMax) {
      setValidationError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    // Selected agent
    const assignedAgent = agents.find((a) => a.id === formData.assignedUserId || a.uid === formData.assignedUserId);
    const assignedAgentName = assignedAgent ? (assignedAgent.displayName || assignedAgent.name || assignedAgent.email) : 'Unassigned';

    let nextFollowUpAt = null;
    if (formData.nextFollowUpDate) {
      nextFollowUpAt = `${formData.nextFollowUpDate}T${formData.nextFollowUpTime || '10:00'}:00`;
    }

    const newLeadRecord = {
      name: cleanName,
      phone: normalizedPhone,
      whatsapp: formData.sameAsMobile ? normalizedPhone : (normalizeIndianPhone(formData.whatsapp) || normalizedPhone),
      source: formData.source,
      budgetMin: bMin,
      budgetMax: bMax,
      preferredLocations: formData.preferredLocations,
      plotSize: formData.plotSize.trim(),
      purchasePurpose: formData.purchasePurpose,
      purchaseTimeline: formData.purchaseTimeline,
      loanRequired: formData.loanRequired,
      stage: 'New',
      temperature: 'Warm',
      assignedUserId: formData.assignedUserId || null,
      assignedUserName: assignedAgentName,
      nextFollowUpAt,
      nextFollowUpReason: formData.nextFollowUpReason || 'Initial discovery follow-up',
      notes: formData.notes.trim()
        ? [
            {
              id: `note_${Date.now()}`,
              text: formData.notes.trim(),
              createdAt: new Date().toISOString(),
              createdByName: currentUser?.displayName || 'Admin'
            }
          ]
        : [],
      siteVisits: [],
      recommendedProjects: [],
      followUps: nextFollowUpAt
        ? [
            {
              id: `fu_${Date.now()}`,
              date: formData.nextFollowUpDate,
              time: formData.nextFollowUpTime || '10:00',
              reason: formData.nextFollowUpReason || 'Initial discovery follow-up',
              status: 'Pending',
              createdAt: new Date().toISOString()
            }
          ]
        : [],
      activities: [
        createActivityRecord({
          type: 'lead_created',
          title: 'Lead Created',
          description: `Lead created from source: ${formData.source}.`,
          user: currentUser
        })
      ]
    };

    setIsSubmitting(true);
    try {
      await onSubmit(newLeadRecord);
      onClose();
    } catch (err) {
      setValidationError(err?.message || 'Failed to save new lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crm-modal" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Add New Buyer Lead</h3>
          <button type="button" className="crm-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-body">
            {validationError && (
              <div className="crm-alert-danger" role="alert">
                <AlertTriangle size={18} />
                <span>{validationError}</span>
              </div>
            )}

            {duplicateMatch && (
              <div className="crm-alert-warning" role="alert">
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <strong>Duplicate Lead Detected:</strong> A lead with mobile{' '}
                    <code>{formData.phone}</code> already exists as <strong>{duplicateMatch.name}</strong> (Stage: {duplicateMatch.stage || 'New'}, Assigned to: {duplicateMatch.assignedUserName || 'Unassigned'}).
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="crm-btn crm-btn-secondary"
                      style={{ height: 32, fontSize: 12 }}
                      onClick={() => {
                        onClose();
                        onOpenExistingLead?.(duplicateMatch.id);
                      }}
                    >
                      Open Existing Lead
                    </button>
                    <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.overrideDuplicate}
                        onChange={(e) => setFormData((p) => ({ ...p, overrideDuplicate: e.target.checked }))}
                      />
                      Create anyway (different buyer)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="crm-form-row">
              <div className="crm-form-field">
                <label>Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Patil"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="crm-form-field">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9822012345"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                />
              </div>
            </div>

            <div className="crm-form-row">
              <div className="crm-form-field">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>WhatsApp Number</span>
                  <label style={{ fontSize: 11, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={formData.sameAsMobile}
                      onChange={(e) => setFormData((p) => ({
                        ...p,
                        sameAsMobile: e.target.checked,
                        whatsapp: e.target.checked ? p.phone : p.whatsapp
                      }))}
                    />
                    Same as mobile
                  </label>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9822012345"
                  value={formData.sameAsMobile ? formData.phone : formData.whatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                  disabled={formData.sameAsMobile}
                />
              </div>

              <div className="crm-form-field">
                <label>Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))}
                >
                  {LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buyer Requirements */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <strong style={{ fontSize: 13, color: '#334155', display: 'block', marginBottom: 12 }}>
                Buyer Plot Requirements
              </strong>

              <div className="crm-form-row">
                <div className="crm-form-field">
                  <label>Budget Minimum (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="e.g. 1200000"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData((p) => ({ ...p, budgetMin: e.target.value }))}
                  />
                </div>

                <div className="crm-form-field">
                  <label>Budget Maximum (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="e.g. 2000000"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData((p) => ({ ...p, budgetMax: e.target.value }))}
                  />
                </div>
              </div>

              <div className="crm-form-field" style={{ marginTop: 12 }}>
                <label>Preferred Areas (Click to toggle)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {PREFERRED_AREAS.map((area) => {
                    const selected = formData.preferredLocations.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        className={`crm-chip ${selected ? 'active' : ''}`}
                        onClick={() => handleLocationToggle(area)}
                      >
                        <MapPin size={12} />
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="crm-form-row" style={{ marginTop: 12 }}>
                <div className="crm-form-field">
                  <label>Plot Size Requirement</label>
                  <input
                    type="text"
                    placeholder="e.g. 1,500 – 2,000 sq ft"
                    value={formData.plotSize}
                    onChange={(e) => setFormData((p) => ({ ...p, plotSize: e.target.value }))}
                  />
                </div>

                <div className="crm-form-field">
                  <label>Purchase Purpose</label>
                  <select
                    value={formData.purchasePurpose}
                    onChange={(e) => setFormData((p) => ({ ...p, purchasePurpose: e.target.value }))}
                  >
                    {PURCHASE_PURPOSES.map((purp) => (
                      <option key={purp} value={purp}>{purp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="crm-form-row" style={{ marginTop: 12 }}>
                <div className="crm-form-field">
                  <label>Purchase Timeline</label>
                  <select
                    value={formData.purchaseTimeline}
                    onChange={(e) => setFormData((p) => ({ ...p, purchaseTimeline: e.target.value }))}
                  >
                    {PURCHASE_TIMELINES.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="crm-form-field">
                  <label>Bank Loan Required?</label>
                  <select
                    value={formData.loanRequired}
                    onChange={(e) => setFormData((p) => ({ ...p, loanRequired: e.target.value }))}
                  >
                    {LOAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignment & Next Follow-Up */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <strong style={{ fontSize: 13, color: '#334155', display: 'block', marginBottom: 12 }}>
                Assignment & Follow-up
              </strong>

              <div className="crm-form-row">
                <div className="crm-form-field">
                  <label>Assign Sales Agent</label>
                  <select
                    value={formData.assignedUserId}
                    onChange={(e) => setFormData((p) => ({ ...p, assignedUserId: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id || agent.uid} value={agent.id || agent.uid}>
                        {agent.displayName || agent.name || agent.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="crm-form-field">
                  <label>Next Follow-up Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData((p) => ({ ...p, nextFollowUpDate: e.target.value }))}
                  />
                </div>
              </div>

              {formData.nextFollowUpDate && (
                <div className="crm-form-row" style={{ marginTop: 12 }}>
                  <div className="crm-form-field">
                    <label>Follow-up Time</label>
                    <input
                      type="time"
                      value={formData.nextFollowUpTime}
                      onChange={(e) => setFormData((p) => ({ ...p, nextFollowUpTime: e.target.value }))}
                    />
                  </div>

                  <div className="crm-form-field">
                    <label>Follow-up Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Discuss shortlisted plots in Rase"
                      value={formData.nextFollowUpReason}
                      onChange={(e) => setFormData((p) => ({ ...p, nextFollowUpReason: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="crm-form-field" style={{ marginTop: 12 }}>
                <label>Initial Internal Notes</label>
                <textarea
                  placeholder="Record initial buyer conversation, specific plot requirements, or boundary preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="crm-modal-footer">
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              disabled={isSubmitting || (duplicateMatch && !formData.overrideDuplicate)}
            >
              {isSubmitting ? 'Creating Lead...' : 'Save & Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
