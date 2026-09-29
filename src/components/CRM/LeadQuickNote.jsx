import React, { useEffect, useId, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createActivityRecord } from '../../utils/crmLeadModel';

export default function LeadQuickNote({ lead, currentUser, onUpdateLead }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const trigger = useRef(null);
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (editing && !dialog.current.open) dialog.current.showModal();
    if (!editing && dialog.current.open) dialog.current.close();
  }, [editing]);
  const notes = Array.isArray(lead.notes) ? lead.notes : [];
  const close = () => { setEditing(false); setText(''); setError(''); trigger.current?.focus(); };

  const save = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError('');
    try {
      const note = { id: `note_${crypto.randomUUID()}`, text: value, createdAt: new Date().toISOString(), createdByName: currentUser?.displayName || currentUser?.name || 'Admin' };
      const activity = createActivityRecord({ type: 'note_added', title: 'Internal Note Added', description: value.slice(0, 100) + (value.length > 100 ? '...' : ''), user: currentUser });
      const result = await onUpdateLead(lead.id, { notes: [note, ...notes], activities: [activity, ...(lead.activities || [])] });
      if (result === false) throw new Error('Save failed');
      close();
    } catch { setError('Could not save your note. Please try again.'); }
    finally { inFlight.current = false; setSaving(false); }
  };

  return <div className="crm-quick-note">
    {notes[0]?.text && <p className="crm-quick-note-preview" title={notes[0].text}>{notes[0].text}</p>}
    <button ref={trigger} type="button" className="crm-btn crm-btn-secondary" aria-haspopup="dialog" disabled={saving || !onUpdateLead} onClick={() => setEditing(true)}><Plus size={14} /> Add note</button>
    <dialog ref={dialog} className="crm-note-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!saving) close(); }}>
      <header className="crm-note-dialog-header"><div><h3 id={titleId}>Add note</h3><p>{lead.name || lead.phone || 'Unnamed lead'}</p></div><button type="button" className="crm-btn crm-btn-secondary" aria-label="Close note editor" disabled={saving} onClick={close}><X size={18} /></button></header>
      {editing && <form onSubmit={save} className="crm-quick-note-form">
      <textarea autoFocus aria-label={`New note for ${lead.name || lead.phone || 'unnamed lead'}`} placeholder="Write a note…" value={text} disabled={saving} onChange={(event) => setText(event.target.value)} />
      <div><button type="submit" className="crm-btn crm-btn-primary" disabled={saving || !text.trim()}>{saving ? 'Saving…' : 'Save'}</button><button type="button" className="crm-btn crm-btn-secondary" disabled={saving} onClick={close}>Cancel</button></div>
      {error && <small role="alert">{error}</small>}
      </form>}
    </dialog>
  </div>;
}
