import React, { useEffect, useId, useRef, useState } from 'react';
import { CLOSED_LOST_REASONS, createClosedLostUpdate } from '../../utils/crmLeadModel';
import { updateNoteWithDate } from '../../utils/noteDateShortcut';

export default function ClosedLostDialog({ lead, currentUser, onUpdateLead, onClose }) {
  const dialog = useRef(null);
  const lock = useRef(false);
  const titleId = useId();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { dialog.current.showModal(); }, []);
  const save = async (event) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      const updates = createClosedLostUpdate(lead, reason, notes, currentUser);
      const result = await onUpdateLead(lead.id, updates);
      if (result === false) throw new Error('Could not save. Please try again.');
      onClose();
    } catch (error) { setError(error.message); }
    finally { lock.current = false; setSaving(false); }
  };
  return <dialog ref={dialog} className="crm-note-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!lock.current) onClose(); }}>
    <h3 id={titleId}>Close lead as lost</h3>
    <p>{lead.name && !/^unnamed(?:\s+lead)?$/i.test(lead.name.trim()) ? lead.name : 'Sir/Madam'}</p>
    <form className="crm-quick-note-form" onSubmit={save}>
      <span className="crm-note-stage-tag">Closed Lost</span>
      <label>Reason <select required value={reason} disabled={saving} onChange={(event) => setReason(event.target.value)}><option value="">Select reason</option>{CLOSED_LOST_REASONS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Note{reason === 'Other' ? ' (required)' : ' (optional)'}<textarea value={notes} required={reason === 'Other'} disabled={saving} placeholder="Why was this lead lost?" onChange={(event) => updateNoteWithDate(event, setNotes)} onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault();
          if (!event.repeat && !lock.current) event.currentTarget.form.requestSubmit();
        }
      }} /></label>
      <small>/, . or @ inserts today’s date · Enter to save · Shift+Enter for a new line</small>
      {error && <small role="alert">{error}</small>}
      <div><button type="button" className="crm-btn crm-btn-secondary" disabled={saving} onClick={onClose}>Cancel</button><button type="submit" className="crm-btn crm-btn-primary" disabled={saving || !reason}>{saving ? 'Saving…' : 'Save Closed Lost'}</button></div>
    </form>
  </dialog>;
}
