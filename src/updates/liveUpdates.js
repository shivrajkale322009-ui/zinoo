import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import publicKey from 'virtual:zinoo-update-public-key';
import runtime from '../../updates/android-runtime.json';
import config from '../../updates/config.json';
import { createLiveUpdateController } from './liveUpdateController.js';

const enabled = Capacitor.getPlatform() === 'android' && import.meta.env.PROD;
let controller;
let started = false;
let ready = false;
let bootError = false;

const report = (error) => console.warn('[Zinoo updates]', error?.message || 'Update unavailable');

function getController() {
  if (!controller) controller = createLiveUpdateController({
    updater: CapacitorUpdater,
    app: NativeApp,
    storage: window.localStorage,
    publicKey,
    runtime: runtime.fingerprint,
    bundleBaseUrl: config.bundleBaseUrl,
    fetchManifest: async () => {
      const abort = new AbortController();
      const timeout = window.setTimeout(() => abort.abort(), 10000);
      try {
        const response = await fetch(config.manifestUrl, { cache: 'no-store', signal: abort.signal, credentials: 'omit' });
        if (!response.ok) throw new Error(`Update check returned ${response.status}`);
        const text = await response.text();
        if (text.length > 24000) throw new Error('Update manifest too large');
        return JSON.parse(text);
      } finally { window.clearTimeout(timeout); }
    }
  });
  return controller;
}

export async function prepareLiveUpdate() {
  if (!enabled) return false;
  // A failed new bundle remains unacknowledged for native rollback to the last
  // successful version. Do not tie health to network/API availability.
  window.addEventListener('error', () => { if (!ready) bootError = true; });
  try { return await getController().activatePending(); }
  catch (error) { report(error); return false; }
}

export function markUpdateScreenReady() {
  if (!enabled || ready || bootError) return;
  // Called only after a real screen commits, from inside its Suspense boundary.
  window.setTimeout(() => {
    if (ready || bootError) return;
    getController().markReady().then(() => {
      ready = true;
      startBackgroundChecks();
    }).catch(report);
  }, 500);
}

export function markUpdateBootFailed() {
  if (!ready) bootError = true;
}

function startBackgroundChecks() {
  if (started) return;
  started = true;
  let lastChecked = 0;
  const check = () => {
    if (document.visibilityState === 'hidden' || !navigator.onLine || Date.now() - lastChecked < 15 * 60 * 1000) return;
    lastChecked = Date.now();
    getController().check().catch(report);
  };
  window.setTimeout(check, 5000);
  window.setInterval(check, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', check);
  window.addEventListener('online', () => { lastChecked = 0; check(); });
}
