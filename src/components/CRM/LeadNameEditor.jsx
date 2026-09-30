import React, { useId, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { createActivityRecord } from '../../utils/crmLeadModel';

export default function LeadNameEditor({ lead, onSelectLead, onUpdateLead, currentUser }) {
  const dialog = useRef(null);
  const input = useRef(null);
  const inFlight = useRef(false);
  const titleId = useId();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const storedName = String(lead.name || '').trim();
  const unnamed = !storedName || /^unnamed(?: lead)?$/i.test(storedName);
  const open = () => {
    setName(unnamed ? '' : storedName);
    setError('');
    dialog.current.showModal();
    input.current.focus();
  };
  const save = async (event) => {
    event.preventDefault();
    const value = name.trim();
    if (!value || inFlight.current) return;
    if (value === storedName) { dialog.current.close(); return; }
    inFlight.current = true;
    setSaving(true);
    setError('');
    try {
      const activity = createActivityRecord({ type: 'name_changed', title: 'Name Updated', description: `Lead name updated to ${value}.`, user: currentUser });
      const result = await onUpdateLead(lead.id, { name: value, activities: [activity, ...(lead.activities || [])] });
      if (result === false) throw new Error('Save failed');
      dialog.current.close();
    } catch { setError('Could not save the name. Please try again.'); }
    finally { inFlight.current = false; setSaving(false); }
  };
  return <div className="crm-editable-name">
    <button type="button" className="crm-name-label" onClick={() => unnamed ? open() : onSelectLead(lead.id)} disabled={unnamed && !onUpdateLead}>{unnamed ? 'Sir/Madam' : storedName}</button>
    <button type="button" className="crm-name-edit" aria-label={`Edit name for ${unnamed ? lead.phone || 'Sir/Madam' : storedName}`} aria-haspopup="dialog" title="Edit name" disabled={!onUpdateLead} onClick={open}><Pencil size={14} /></button>
    <dialog ref={dialog} className="crm-note-dialog" aria-labelledby={titleId} onCancel={(event) => { if (inFlight.current) event.preventDefault(); }}>
      <h3 id={titleId}>Edit lead name</h3>
      <form className="crm-quick-note-form" onSubmit={save}>
        <label>Customer name<input ref={input} type="text" autoComplete="name" value={name} maxLength={120} required disabled={saving} onChange={(event) => setName(event.target.value)} /></label>
        {error && <small role="alert">{error}</small>}
        <div><button type="button" className="crm-btn crm-btn-secondary" disabled={saving} onClick={() => dialog.current.close()}>Cancel</button><button type="submit" className="crm-btn crm-btn-primary" disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Save'}</button></div>
      </form>
    </dialog>
  </div>;
}
