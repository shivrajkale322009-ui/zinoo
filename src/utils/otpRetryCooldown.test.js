import test from 'node:test';
import assert from 'node:assert/strict';
import { delayOtpRetry, otpRetrySeconds } from './otpRetryCooldown.js';

test('OTP failures delay retries and subsequent errors cannot shorten throttling delay', () => {
  assert.equal(delayOtpRetry('auth/invalid-phone-number', 1000), 0);
  assert.equal(delayOtpRetry('auth/invalid-app-credential', 1000), 30);
  assert.equal(otpRetrySeconds(16000), 15);
  assert.equal(delayOtpRetry('auth/too-many-requests', 16000), 300);
  assert.equal(delayOtpRetry('auth/network-request-failed', 17000), 299);
  assert.equal(otpRetrySeconds(316000), 0);
});
