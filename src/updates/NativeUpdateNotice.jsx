import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { nativeUpdateState } from './nativeUpdatePolicy';
import './updates.css';

export default function NativeUpdateNotice() {
  const [state, setState] = useState('none');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dismissed = useRef(false);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || !import.meta.env.PROD) return;
    let active = true;
    let lastCheck = 0;
    let checking = false;
    const handles = [];
    const check = async (force = false) => {
      if (checking || (!force && Date.now() - lastCheck < 15 * 60 * 1000)) return;
      checking = true;
      lastCheck = Date.now();
      try {
        const info = await AppUpdate.getAppUpdateInfo();
        if (!active) return;
        if (!dismissed.current) setState(nativeUpdateState(info));
      } catch { /* Offline and sideloaded installs can have no Google Play update info. */ }
      finally { checking = false; }
    };
    const keep = (promise) => promise.then((handle) => active ? handles.push(handle) : handle.remove()).catch(() => {});
    keep(AppUpdate.addListener('onFlexibleUpdateStateChange', (event) => {
      if (!active) return;
      if (event.installStatus === 11) { dismissed.current = false; setState('downloaded'); }
      else if ([1, 2, 3].includes(event.installStatus)) setState('downloading');
      else if ([5, 6].includes(event.installStatus)) { setState('none'); void check(true); }
    }));
    keep(NativeApp.addListener('appStateChange', ({ isActive }) => { if (isActive) void check(); }));
    void check();
    return () => { active = false; handles.forEach((handle) => { void handle.remove(); }); };
  }, []);

  const update = async () => {
    setBusy(true);
    setError('');
    try {
      if (state === 'downloaded') {
        // Only this explicit user action may restart an active session.
        await AppUpdate.completeFlexibleUpdate();
      } else {
        const info = await AppUpdate.getAppUpdateInfo();
        const next = nativeUpdateState(info);
        if (next === 'downloaded') setState(next);
        else if (next === 'store') await AppUpdate.openAppStore();
        else if (next === 'available') {
          const result = await AppUpdate.startFlexibleUpdate();
          if (result.code === 0) setState('downloading');
          else if (result.code === 1) { dismissed.current = true; setState('none'); }
          else setError('Couldn’t start the update. Please try again.');
        } else setState(next);
      }
    } catch { setError('Couldn’t update right now. Please try again later.'); }
    finally { setBusy(false); }
  };

  if (state === 'none' || state === 'downloading') return null;
  return <aside className="zinoo-update-notice" aria-label="App update">
    <div><strong>{state === 'downloaded' ? 'Your update is ready' : 'A Zinoo update is available'}</strong>
      <p>{error || (state === 'downloaded' ? 'Finish what you’re doing before restarting.' : state === 'store' ? 'Get the latest version from Google Play.' : 'You can keep browsing while it downloads.')}</p></div>
    <div className="zinoo-update-actions">
      <button type="button" disabled={busy} onClick={() => { dismissed.current = true; setState('none'); }}>Later</button>
      <button type="button" disabled={busy} onClick={update}>{busy ? 'Please wait…' : state === 'downloaded' ? 'Restart to update' : state === 'store' ? 'Open Play Store' : 'Update'}</button>
    </div>
  </aside>;
}
