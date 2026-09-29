import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isEligibleRelease, rolloutBucket, verifyManifest } from './liveUpdatePolicy.js';
import { createLiveUpdateController, PENDING_UPDATE_KEY, ACCEPTED_REVISION_KEY } from './liveUpdateController.js';
import { nativeUpdateState } from './nativeUpdatePolicy.js';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const now = 1800000000000;
const checksum = 'a'.repeat(64);
const base = 'https://zinoo.in/app-updates/bundles/';
const payload = (changes = {}) => ({ schema: 1, enabled: true, nativeBuild: '42', runtime: 'runtime-42',
  revision: 100, expiresAt: now + 60000, rolloutPercent: 100,
  release: { version: '1.0.6-live.1', checksum, url: `${base}release.zip` }, ...changes });
const envelope = (manifest) => {
  const text = JSON.stringify(manifest);
  return { payload: text, signature: sign('RSA-SHA256', Buffer.from(text), keys.privateKey).toString('base64') };
};
const ctx = { nativeBuild: '42', runtime: 'runtime-42', bucket: 0, now, bundleBaseUrl: base };

function fixture() {
  const data = new Map();
  const calls = [];
  const storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
  const current = { id: 'good', version: '1.0.6-live.0', status: 'success', checksum: 'b'.repeat(64) };
  const downloaded = { id: 'new', version: payload().release.version, status: 'pending', checksum };
  const bundles = [current];
  const updater = {
    getDeviceId: async () => ({ deviceId: 'device-123' }),
    current: async () => ({ bundle: current }),
    list: async () => ({ bundles }),
    download: async (options) => { calls.push(['download', options]); bundles.push(downloaded); return downloaded; },
    set: async (options) => { calls.push(['activate', options]); },
    notifyAppReady: async () => { calls.push(['ready']); },
    delete: async (options) => { calls.push(['delete', options]); }
  };
  let remote = envelope(payload());
  let fetchCount = 0;
  const options = { updater, app: { getInfo: async () => ({ build: '42' }) }, storage,
    fetchManifest: async () => { fetchCount++; return remote; }, publicKey: keys.publicKey,
    runtime: 'runtime-42', bundleBaseUrl: base, cryptoApi: webcrypto, now: () => now };
  return { data, calls, storage, current, downloaded, bundles, options,
    get fetchCount() { return fetchCount; }, set remote(value) { remote = value; },
    controller: createLiveUpdateController(options) };
}

test('only a correctly signed release is trusted', async () => {
  const signed = envelope(payload());
  assert.deepEqual(await verifyManifest(signed, keys.publicKey, webcrypto), payload());
  signed.payload = JSON.stringify(payload({ rolloutPercent: 0 }));
  await assert.rejects(verifyManifest(signed, keys.publicKey, webcrypto), /signature/);
});

test('rollout cohorts stay stable and grow without moving existing users out', async () => {
  const buckets = await Promise.all(Array.from({ length: 1000 }, (_, i) => rolloutBucket(`device-${i}`, webcrypto)));
  const first = buckets.filter((bucket) => isEligibleRelease(payload({ rolloutPercent: 5 }), { ...ctx, bucket }));
  assert.ok(first.length > 20 && first.length < 80);
  for (const bucket of first) assert.equal(isEligibleRelease(payload({ rolloutPercent: 25 }), { ...ctx, bucket }), true);
  assert.equal(await rolloutBucket('device-1', webcrypto), await rolloutBucket('device-1', webcrypto));
  assert.equal(isEligibleRelease(payload({ rolloutPercent: 0 }), ctx), false);
  assert.equal(isEligibleRelease(payload({ rolloutPercent: 5 }), { ...ctx, bucket: 500 }), false);
});

test('rejects incompatible, expired, paused, malformed and untrusted-origin releases', () => {
  for (const changes of [{ nativeBuild: '43' }, { runtime: 'other' }, { expiresAt: now }, { enabled: false },
    { rolloutPercent: 101 }, { rolloutPercent: -1 }, { revision: '100' },
    { release: { ...payload().release, url: 'https://evil.test/release.zip' } },
    { release: { ...payload().release, url: `${base}../private.zip` } },
    { release: { ...payload().release, checksum: 'invalid' } }]) {
    assert.equal(isEligibleRelease(payload(changes), ctx), false, JSON.stringify(changes));
  }
});

test('downloads without reloading; a later bootstrap activates once, without fetching', async () => {
  const f = fixture();
  await Promise.all([f.controller.check(), f.controller.check()]);
  assert.equal(f.calls.filter(([type]) => type === 'download').length, 1);
  assert.equal(f.calls.some(([type]) => type === 'activate'), false);
  assert.ok(f.data.has(PENDING_UPDATE_KEY));
  const requests = f.fetchCount;
  const nextLaunch = createLiveUpdateController(f.options);
  assert.equal(await nextLaunch.activatePending(), true);
  assert.equal(f.fetchCount, requests);
  assert.equal(f.data.has(PENDING_UPDATE_KEY), false);
  assert.equal(await nextLaunch.activatePending(), false);
});

test('a native upgrade discards staged assets for the old native runtime', async () => {
  const f = fixture();
  await f.controller.check();
  f.options.app.getInfo = async () => ({ build: '43' });
  assert.equal(await createLiveUpdateController(f.options).activatePending(), false);
  assert.equal(f.calls.some(([type]) => type === 'activate'), false);
});

test('activation failure consumes staging so the app cannot enter an activation loop', async () => {
  const f = fixture();
  await f.controller.check();
  f.options.updater.set = async () => { throw new Error('missing files'); };
  await assert.rejects(f.controller.activatePending(), /missing files/);
  assert.equal(await f.controller.activatePending(), false);
});

test('failed bundles are not downloaded or activated again', async () => {
  const f = fixture();
  f.bundles.push({ ...f.downloaded, status: 'error' });
  await f.controller.check();
  assert.deepEqual(f.calls, []);
  assert.equal(f.data.has(PENDING_UPDATE_KEY), false);
});

test('a signed pause clears staged downloads and stale manifests cannot undo it', async () => {
  const f = fixture();
  await f.controller.check();
  f.remote = envelope(payload({ revision: 101, enabled: false }));
  await f.controller.check();
  assert.equal(f.data.has(PENDING_UPDATE_KEY), false);
  f.remote = envelope(payload());
  await f.controller.check();
  assert.equal(f.data.has(PENDING_UPDATE_KEY), false);
  assert.equal(f.data.get(ACCEPTED_REVISION_KEY), '101');
});

test('a pause during a download prevents staging', async () => {
  const f = fixture();
  const download = f.options.updater.download;
  f.options.updater.download = async (options) => {
    const result = await download(options);
    f.remote = envelope(payload({ revision: 101, enabled: false }));
    return result;
  };
  await f.controller.check();
  assert.equal(f.data.has(PENDING_UPDATE_KEY), false);
});

test('network failure leaves the current version untouched', async () => {
  const f = fixture();
  f.options.fetchManifest = async () => { throw new Error('offline'); };
  await assert.rejects(createLiveUpdateController(f.options).check(), /offline/);
  assert.deepEqual(f.calls, []);
});

test('readiness acknowledges a rendered screen once and retains previous working assets', async () => {
  const f = fixture();
  f.data.set('zinoo.live-update.last-good.v1', JSON.stringify('previous'));
  f.bundles.push({ id: 'previous', status: 'success' }, { id: 'ancient', status: 'success' }, { id: 'broken', status: 'error' });
  await Promise.all([f.controller.markReady(), f.controller.markReady()]);
  assert.equal(f.calls.filter(([type]) => type === 'ready').length, 1);
  assert.deepEqual(f.calls.filter(([type]) => type === 'delete'), [['delete', { id: 'ancient' }]]);
});

test('Play update statuses distinguish download, restart and store-only updates', () => {
  assert.equal(nativeUpdateState({ updateAvailability: 2, flexibleUpdateAllowed: true }), 'available');
  assert.equal(nativeUpdateState({ updateAvailability: 2, flexibleUpdateAllowed: false }), 'store');
  assert.equal(nativeUpdateState({ installStatus: 11 }), 'downloaded');
  assert.equal(nativeUpdateState({ installStatus: 2 }), 'downloading');
  assert.equal(nativeUpdateState({ updateAvailability: 1 }), 'none');
});

test('native safety configuration disables background activation and preserves rollback', () => {
  const source = readFileSync(new URL('../../capacitor.config.js', import.meta.url), 'utf8');
  for (const pattern of [/autoUpdate: false/, /directUpdate: false/, /autoDeletePrevious: false/,
    /autoDeleteFailed: false/, /resetWhenUpdate: true/, /appReadyTimeout: 60000/, /statsUrl: ''/]) assert.match(source, pattern);
});
