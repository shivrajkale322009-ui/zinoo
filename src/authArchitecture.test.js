import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Firebase auth state is authoritative and routing waits for initial restoration', async () => {
  const app = await read('./App.jsx');
  assert.match(app, /onAuthStateChanged\(auth,/);
  assert.match(app, /if \(!authReady\) return null/);
  assert.match(app, /if \(!user\) \{/);
  assert.doesNotMatch(app, /localStorage[^\n]*(?:isLoggedIn|isAuthenticated|authUser|uid|token)/i);
});

test('authenticated profile failures remain separate from authentication failure', async () => {
  const app = await read('./App.jsx');
  const guestBranch = app.indexOf('if (!user) {');
  const profileErrorBranch = app.indexOf("if (profileStatus === 'error')");
  assert.ok(guestBranch >= 0 && profileErrorBranch > guestBranch);
  assert.match(app, /You are signed in, but your Zinoo profile could not be prepared/);
});

test('profile provisioning is idempotent for existing and new users', async () => {
  const profile = await read('./utils/authUser.js');
  assert.match(profile, /runTransaction/);
  assert.match(profile, /if \(snap\.exists\(\)\) return \{ profile: snap\.data\(\), existing: true \}/);
  assert.match(profile, /transaction\.set\(ref, profile\)/);
});

test('logout delegates to Firebase and clears only supporting cached context', async () => {
  const logout = await read('./services/authSessionService.js');
  assert.match(logout, /await signOut\(auth\)/);
  assert.match(logout, /sessionStorage\.removeItem/);
  assert.doesNotMatch(logout, /localStorage\.setItem\([^\n]*(?:isLoggedIn|isAuthenticated|uid|token)/i);
});

test('OTP request and confirmation both reject duplicate submissions', async () => {
  const login = await read('./components/LoginScreen.jsx');
  assert.ok((login.match(/if \(authRequestInFlight\.current/g) || []).length >= 2);
  assert.match(login, /if \(authRequestInFlight\.current \|\| !confirmationResult\) return/);
  assert.match(login, /disabled=\{loading \|\| phoneNumber\.length !== 10\}/);
  assert.match(login, /disabled=\{loading \|\| otp\.length !== 6\}/);
});

test('resend discards stale OTP confirmation state', async () => {
  const login = await read('./components/LoginScreen.jsx');
  assert.match(login, /if \(next === 'phone'\) \{[\s\S]*setConfirmationResult\(null\);[\s\S]*setOtp\(''\)/);
});

test('phone authentication does not update component state after unmount', async () => {
  const login = await read('./components/LoginScreen.jsx');
  assert.match(login, /mountedRef\.current = false/);
  assert.match(login, /if \(!mountedRef\.current\) return/);
  assert.match(login, /if \(mountedRef\.current\) setLoading\(false\)/);
});
