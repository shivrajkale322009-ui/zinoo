import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';

export default function MetaCapiSettings() {
  const [status, setStatus] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (action) => {
    setBusy(true);
    setMessage('');
    try {
      const call = httpsCallable(functions, 'metaCapiAdmin');
      await call({ action, ...(action === 'test' ? { testCode: code.trim() } : {}) });
      setStatus((await call({ action: 'status' })).data);
      if (action === 'test') setMessage('Meta accepted the test event. Check Test events in Events Manager.');
    } catch (error) { setMessage(error.message || 'Could not connect to Meta.'); }
    finally { setBusy(false); }
  };
  return <details className="crm-meta-settings" onToggle={(event) => { if (event.currentTarget.open && !status && !busy) run('status'); }}>
    <summary>Meta lead integration</summary>
    <p>Dataset 2252404462242027 · {status?.mode === 'production' ? 'Sending enabled' : 'Sending disabled'}</p>
    <p>Only Meta-sourced leads are sent. Visit Completed sends QualifiedLead after the buyer’s visit. Closed Won sends ConvertedLead. Use Hot, Warm or Cold to track buying interest. Notes are never sent.</p>
    <label>Meta test event code<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="From Events Manager → Test events" /></label>
    <div className="crm-meta-actions">
      <button className="crm-btn crm-btn-secondary" disabled={busy || !code.trim()} onClick={() => run('test')}>Send test event</button>
      <button className="crm-btn crm-btn-primary" disabled={busy || !status?.tested} onClick={() => run(status?.mode === 'production' ? 'disable' : 'enable')}>{status?.mode === 'production' ? 'Pause sending' : 'Enable sending'}</button>
      <button className="crm-btn crm-btn-secondary" disabled={busy} onClick={() => run('status')}>Refresh</button>
    </div>
    {message && <p role="status">{message}</p>}
    {!!status?.recent?.length && <ul>{status.recent.map((event) => <li key={event.id}>{event.eventName}: {event.status}{event.error ? ` — ${event.error}` : ''}</li>)}</ul>}
  </details>;
}
