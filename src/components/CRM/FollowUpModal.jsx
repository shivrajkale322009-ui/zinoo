import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, History, AlertCircle } from 'lucide-react';

export default function FollowUpModal({
  isOpen,
  onClose,
  onSave,
  lead = null,
  currentUser = null,
  isCompleting = false
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    // If completing existing follow-up
    result: 'Spoke with buyer',
    completionNotes: '',
    // Next follow-up
    scheduleNext: true,
    nextDate: tomorrowStr,
    nextTime: '11:00',
    nextReason: 'Follow-up on plot selection'
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isCompleting) {
      if (!formData.result.trim()) {
        setError('Please enter the follow-up outcome/result.');
        return;
      }
      if (formData.scheduleNext && !formData.nextDate) {
        setError('Please select the next follow-up date.');
        return;
      }

      onSave({
        completedResult: {
          result: formData.result,
          notes: formData.completionNotes.trim(),
          completedAt: new Date().toISOString(),
          completedBy: currentUser?.displayName || 'Admin'
        },
        nextFollowUp: formData.scheduleNext
          ? {
              date: formData.nextDate,
              time: formData.nextTime || '11:00',
              reason: formData.nextReason || 'Scheduled follow-up'
            }
          : null
      });
    } else {
      if (!formData.nextDate) {
        setError('Please choose a follow-up date.');
        return;
      }
      onSave({
        nextFollowUp: {
          date: formData.nextDate,
          time: formData.nextTime || '11:00',
          reason: formData.nextReason || 'Scheduled follow-up'
        }
      });
    }

    onClose();
  };

  return (
    <div className="crm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crm-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{isCompleting ? 'Complete Follow-up & Plan Next' : 'Schedule Next Follow-up'}</h3>
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

            {isCompleting && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <strong style={{ fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  Record Current Follow-up Outcome
                </strong>

                {lead?.nextFollowUpReason && (
                  <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                    Scheduled goal: <em>"{lead.nextFollowUpReason}"</em>
                  </p>
                )}

                <div className="crm-form-field">
                  <label>Outcome / Call Result *</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData((p) => ({ ...p, result: e.target.value }))}
                  >
                    <option value="Spoke with buyer">Spoke with buyer (Positive)</option>
                    <option value="Requirement refined">Requirement refined</option>
                    <option value="Brochure reviewed">Brochure reviewed</option>
                    <option value="Requested site visit">Requested site visit</option>
                    <option value="Callback requested">Callback requested later</option>
                    <option value="Unreachable / Switched off">Unreachable / Switched off</option>
                    <option value="Not interested right now">Not interested right now</option>
                  </select>
                </div>

                <div className="crm-form-field">
                  <label>Call Summary / Discussion Notes</label>
                  <textarea
                    placeholder="e.g. Buyer confirmed interest in 1500 sq ft plot in Rase. Wants to visit on Saturday morning with family."
                    value={formData.completionNotes}
                    onChange={(e) => setFormData((p) => ({ ...p, completionNotes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formData.scheduleNext}
                    onChange={(e) => setFormData((p) => ({ ...p, scheduleNext: e.target.checked }))}
                  />
                  Schedule next follow-up with this buyer
                </label>
              </div>
            )}

            {(!isCompleting || formData.scheduleNext) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <strong style={{ fontSize: 13, color: '#1e293b' }}>
                  {isCompleting ? 'Next Follow-up Details' : 'Follow-up Schedule'}
                </strong>

                <div className="crm-form-row">
                  <div className="crm-form-field">
                    <label>Follow-up Date *</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={formData.nextDate}
                      onChange={(e) => setFormData((p) => ({ ...p, nextDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="crm-form-field">
                    <label>Time</label>
                    <input
                      type="time"
                      value={formData.nextTime}
                      onChange={(e) => setFormData((p) => ({ ...p, nextTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="crm-form-field">
                  <label>Follow-up Reason / Target Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Confirm site visit timing for Saturday"
                    value={formData.nextReason}
                    onChange={(e) => setFormData((p) => ({ ...p, nextReason: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="crm-modal-footer">
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              {isCompleting ? 'Complete & Save Follow-up' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
