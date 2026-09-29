import { isEligibleRelease, rolloutBucket, verifyManifest } from './liveUpdatePolicy.js';

export const PENDING_UPDATE_KEY = 'zinoo.live-update.pending.v1';
export const ACCEPTED_REVISION_KEY = 'zinoo.live-update.revision.v1';
const LAST_GOOD_KEY = 'zinoo.live-update.last-good.v1';
const PREVIOUS_GOOD_KEY = 'zinoo.live-update.previous-good.v1';

// Native `next()` is deliberately never used: it can activate on background.
// Only activatePending(), called BEFORE React mounts, is allowed to call set().
export function createLiveUpdateController({ updater, app, storage, fetchManifest, publicKey,
  runtime, bundleBaseUrl, cryptoApi = globalThis.crypto, now = Date.now }) {
  let checkInFlight;
  let readyPromise;

  const read = (key) => {
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
  };
  const context = async () => {
    const [info, device] = await Promise.all([app.getInfo(), updater.getDeviceId()]);
    return { nativeBuild: info.build, runtime, bundleBaseUrl, now: now(), bucket: await rolloutBucket(device.deviceId, cryptoApi) };
  };
  const revision = () => Number(read(ACCEPTED_REVISION_KEY)) || 0;

  async function activatePending() {
    const pending = read(PENDING_UPDATE_KEY);
    if (!pending) return false;
    // Consume first: even a killed activation cannot create an endless boot loop.
    storage.removeItem(PENDING_UPDATE_KEY);
    const manifest = await verifyManifest(pending.envelope, publicKey, cryptoApi);
    if (manifest.revision < revision() || !isEligibleRelease(manifest, await context())) return false;
    const [{ bundles }, { bundle: current }] = await Promise.all([updater.list(), updater.current()]);
    const downloaded = bundles.find((bundle) => bundle.id === pending.id
      && bundle.version === manifest.release.version && bundle.checksum === manifest.release.checksum
      && ['pending', 'success'].includes(bundle.status));
    if (!downloaded || downloaded.id === current.id) return false;
    await updater.set({ id: downloaded.id });
    return true; // set() replaces the WebView; never mount the old screen afterwards.
  }

  async function check() {
    const envelope = await fetchManifest();
    const manifest = await verifyManifest(envelope, publicKey, cryptoApi);
    const ctx = await context();
    if (manifest.revision < revision()) return;
    if (manifest.schema !== 1 || !Number.isSafeInteger(manifest.revision) || manifest.expiresAt <= now()) return;
    storage.setItem(ACCEPTED_REVISION_KEY, JSON.stringify(manifest.revision));
    if (!isEligibleRelease(manifest, ctx)) {
      storage.removeItem(PENDING_UPDATE_KEY); // Includes signed pause / rollout reduction.
      return;
    }
    const [{ bundles }, { bundle: current }] = await Promise.all([updater.list(), updater.current()]);
    if (current.version === manifest.release.version) {
      storage.removeItem(PENDING_UPDATE_KEY);
      return;
    }
    // Keep failed bundle records so a broken release is never downloaded again.
    if (bundles.some((bundle) => bundle.version === manifest.release.version && bundle.status === 'error')) return;
    let downloaded = bundles.find((bundle) => bundle.version === manifest.release.version
      && bundle.checksum === manifest.release.checksum && ['pending', 'success'].includes(bundle.status));
    if (!downloaded) downloaded = await updater.download(manifest.release);
    if (!downloaded?.id || downloaded.status === 'error' || downloaded.checksum !== manifest.release.checksum) {
      throw new Error('Downloaded update did not match the release');
    }
    // Recheck after download: a pause, promotion or replacement may have happened meanwhile.
    const latestEnvelope = await fetchManifest();
    const latest = await verifyManifest(latestEnvelope, publicKey, cryptoApi);
    if (latest.revision < manifest.revision || !isEligibleRelease(latest, { ...ctx, now: now() })
      || latest.release.version !== manifest.release.version || latest.release.checksum !== manifest.release.checksum) return;
    storage.setItem(ACCEPTED_REVISION_KEY, JSON.stringify(latest.revision));
    storage.setItem(PENDING_UPDATE_KEY, JSON.stringify({ id: downloaded.id, envelope: latestEnvelope }));
  }

  async function markReady() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      await updater.notifyAppReady();
      const { bundle } = await updater.current();
      const last = read(LAST_GOOD_KEY);
      if (last && last !== bundle.id) storage.setItem(PREVIOUS_GOOD_KEY, JSON.stringify(last));
      storage.setItem(LAST_GOOD_KEY, JSON.stringify(bundle.id));
      const keep = new Set([bundle.id, last, read(PREVIOUS_GOOD_KEY), read(PENDING_UPDATE_KEY)?.id, 'builtin']);
      const { bundles } = await updater.list();
      for (const candidate of bundles) {
        if (candidate.status === 'success' && !keep.has(candidate.id)) {
          await updater.delete({ id: candidate.id }).catch(() => {});
        }
      }
    })().catch((error) => { readyPromise = null; throw error; });
    return readyPromise;
  }

  return {
    activatePending,
    markReady,
    check: () => {
      if (!checkInFlight) checkInFlight = check().finally(() => { checkInFlight = null; });
      return checkInFlight;
    }
  };
}
