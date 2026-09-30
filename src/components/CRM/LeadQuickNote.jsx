import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createActivityRecord } from '../../utils/crmLeadModel';
import { updateNoteWithDate } from '../../utils/noteDateShortcut';
import NoteText from './NoteText';

export default function LeadQuickNote({ lead, currentUser, onUpdateLead }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const trigger = useRef(null);
  const dialog = useRef(null);
  const noteInput = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (editing) {
      if (!dialog.current.open) dialog.current.showModal();
      noteInput.current?.focus({ preventScroll: true });
    }
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
    <button ref={trigger} type="button" className="crm-notes-area" aria-label={`Open notes for ${lead.name || lead.phone || 'unnamed lead'}`} aria-haspopup="dialog" disabled={saving || !onUpdateLead} onClick={() => setEditing(true)}>
      {notes[0]?.stage && <span className="crm-note-stage-tag">{notes[0].stage}</span>}
      <span className={`crm-quick-note-preview${notes[0]?.text ? '' : ' crm-notes-placeholder'}`}>{notes[0]?.text ? <NoteText>{notes[0].text}</NoteText> : 'Click to write a note…'}</span>
    </button>
    <dialog ref={dialog} className="crm-note-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!saving) close(); }}>
      <header className="crm-note-dialog-header"><div><h3 id={titleId}>Add note</h3><p>{lead.name && !/^unnamed(?:\s+lead)?$/i.test(lead.name.trim()) ? lead.name : lead.phone || 'Sir/Madam'}</p></div><button type="button" className="crm-btn crm-btn-secondary" aria-label="Close note editor" disabled={saving} onClick={close}><X size={18} /></button></header>
      {editing && <>
      {notes.length > 0 && <div className="crm-note-history" aria-label="Existing notes">
        {notes.map((note, index) => <div className="crm-note-history-item" key={note.id || `${note.createdAt || 'note'}-${index}`}>
          <div className="crm-note-history-meta">{note.createdByName || 'Admin'}{note.createdAt ? ` · ${new Date(note.createdAt).toLocaleDateString()}` : ''}</div>
          <div className="crm-note-history-text"><NoteText>{note.text}</NoteText></div>
        </div>)}
      </div>}
      <form onSubmit={save} className="crm-quick-note-form">
      <textarea ref={noteInput} autoFocus aria-label={`New note for ${lead.name || lead.phone || 'unnamed lead'}`} placeholder="Write a note…" value={text} disabled={saving} onChange={(event) => updateNoteWithDate(event, setText)} onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault();
          if (!event.repeat && !inFlight.current && text.trim()) event.currentTarget.form.requestSubmit();
        }
      }} />
      <small>/, . or @ inserts today’s date · Enter to save · Shift+Enter for a new line</small>
      <div><button type="submit" className="crm-btn crm-btn-primary" disabled={saving || !text.trim()}>{saving ? 'Saving…' : 'Save'}</button><button type="button" className="crm-btn crm-btn-secondary" disabled={saving} onClick={close}>Cancel</button></div>
      {error && <small role="alert">{error}</small>}
      </form></>}
    </dialog>
  </div>;
}
