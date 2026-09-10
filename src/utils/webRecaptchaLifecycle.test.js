import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebRecaptchaLifecycle } from './webRecaptchaLifecycle.js';

const setup = () => {
  const events = [];
  const verifiers = [];
  const host = { isConnected: true, parentElement: {} };
  const lifecycle = createWebRecaptchaLifecycle({
    getContainer: () => host,
    createVerifier: (container, callbacks) => {
      const verifier = { callbacks, container, clearCount: 0, clear() { this.clearCount += 1; } };
      verifiers.push(verifier);
      return verifier;
    },
    onEvent: (event) => events.push(event)
  });
  return { events, host, lifecycle, verifiers };
};

test('initializes one verifier against the stable host and reuses it', async () => {
  const { host, lifecycle, verifiers } = setup();
  const first = await lifecycle.initialize();
  const second = await lifecycle.initialize();
  assert.equal(first, second);
  assert.equal(first.container, host);
  assert.equal(verifiers.length, 1);
});

test('keeps the verifier and its DOM alive after a successful OTP request', async () => {
  const { lifecycle, verifiers } = setup();
  const result = await lifecycle.execute(() => Promise.resolve({ verificationId: 'first-id' }));
  assert.equal(result.verificationId, 'first-id');
  assert.equal(verifiers[0].clearCount, 0);
  assert.equal(lifecycle.getCurrent(), verifiers[0]);
});

test('keeps failed CAPTCHA DOM intact until a later explicit retry', async () => {
  const { lifecycle, verifiers } = setup();
  await assert.rejects(lifecycle.execute(() => Promise.reject(
    Object.assign(new Error('expired'), { code: 'auth/invalid-app-credential' })
  )), { code: 'auth/invalid-app-credential' });
  assert.equal(verifiers[0].clearCount, 0);
  assert.equal(lifecycle.getCurrent(), null);

  const retryVerifier = await lifecycle.initialize();
  assert.equal(verifiers[0].clearCount, 1);
  assert.notEqual(retryVerifier, verifiers[0]);
  assert.equal(verifiers.length, 2);
});

test('expiration and widget errors mark the verifier invalid without deleting callback DOM', async () => {
  const { lifecycle, verifiers } = setup();
  const expired = await lifecycle.initialize();
  expired.callbacks['expired-callback']();
  assert.equal(expired.clearCount, 0);
  assert.equal(lifecycle.getCurrent(), null);

  const next = await lifecycle.initialize();
  next.callbacks['error-callback']();
  assert.equal(next.clearCount, 0);
  assert.equal(lifecycle.getCurrent(), null);
  assert.equal(verifiers.length, 2);
});

test('rejects a double request while one verifier owns Firebase verification', async () => {
  const { lifecycle } = setup();
  let release;
  const first = lifecycle.execute(() => new Promise((resolve) => { release = resolve; }));
  await assert.rejects(lifecycle.execute(() => Promise.resolve()), { code: 'auth/request-in-progress' });
  release({ verificationId: 'first-id' });
  await first;
});

test('close or unmount defers cleanup while Firebase owns the verifier', async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const deferred = [];
  globalThis.setTimeout = (callback) => { deferred.push(callback); return 1; };
  try {
    const { events, lifecycle, verifiers } = setup();
    let release;
    const request = lifecycle.execute(() => new Promise((resolve) => { release = resolve; }));
    await Promise.resolve();
    lifecycle.dispose();
    assert.equal(verifiers[0].clearCount, 0);
    assert.equal(events.some(({ type }) => type === 'cleanup-deferred'), true);
    release({ verificationId: 'first-id' });
    await request;
    assert.equal(verifiers[0].clearCount, 0);
    assert.equal(deferred.length, 1);
    deferred[0]();
    assert.equal(verifiers[0].clearCount, 1);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
  }
});

test('fails cleanly when the persistent host is unavailable', async () => {
  const lifecycle = createWebRecaptchaLifecycle({ createVerifier: () => null, getContainer: () => null });
  await assert.rejects(lifecycle.initialize(), { code: 'auth/captcha-check-failed' });
});
