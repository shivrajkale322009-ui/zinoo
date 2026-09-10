import test from 'node:test';
import assert from 'node:assert/strict';
import { assertWebOtpOnline, normalizeIndianMobileNumber, normalizePhoneAuthError, phoneAuthErrorMessage, sanitizePhoneAuthMessage } from './phoneAuth.js';

test('normalizes valid Indian phone inputs to E.164', () => {
  assert.equal(normalizeIndianMobileNumber('84688 45210'), '+918468845210');
  assert.equal(normalizeIndianMobileNumber('+91 8468845210'), '+918468845210');
  assert.equal(normalizeIndianMobileNumber('08468845210'), '+918468845210');
});

test('rejects invalid Indian mobile numbers', () => {
  assert.equal(normalizeIndianMobileNumber('1234567890'), '');
  assert.equal(normalizeIndianMobileNumber('846884521'), '');
});

test('stops web OTP before reCAPTCHA when the browser is offline', () => {
  assert.throws(() => assertWebOtpOnline(false), { code: 'auth/network-request-failed' });
  assert.doesNotThrow(() => assertWebOtpOnline(true));
});

test('keeps Android app authorization distinct from web domain authorization', () => {
  assert.match(phoneAuthErrorMessage({ code: 'auth/app-not-authorized' }), /Android app build is not authorized/i);
  assert.doesNotMatch(phoneAuthErrorMessage({ code: 'auth/app-not-authorized' }), /domain/i);
  assert.match(phoneAuthErrorMessage({ code: 'auth/unauthorized-domain' }), /web origin is not authorized/i);
  assert.match(phoneAuthErrorMessage({ code: 'auth/operation-not-allowed' }), /not enabled/i);
  assert.match(phoneAuthErrorMessage({ code: 'auth/captcha-check-failed' }), /security check/i);
});

test('normalizes native Firebase phone auth error codes', () => {
  assert.equal(normalizePhoneAuthError({ code: 'ERROR_INVALID_VERIFICATION_CODE' }).code, 'auth/invalid-verification-code');
  assert.equal(normalizePhoneAuthError({ message: 'Firebase failed: ERROR_SESSION_EXPIRED' }).code, 'auth/session-expired');
  assert.match(phoneAuthErrorMessage({ code: 'ERROR_SESSION_EXPIRED' }), /expired/i);
});

test('normalizes a structured Firebase Auth error with a known code', () => {
  const result = normalizePhoneAuthError({
    code: 'invalid-phone-number',
    exceptionClass: 'com.google.firebase.auth.FirebaseAuthInvalidCredentialsException',
    message: 'The phone number is invalid.'
  });
  assert.equal(result.code, 'auth/invalid-phone-number');
  assert.match(result.exceptionClass, /FirebaseAuthInvalidCredentialsException/);
});

test('preserves an unknown Firebase Auth code instead of misclassifying it', () => {
  const result = normalizePhoneAuthError({ code: 'future-phone-error', message: 'A future Firebase error.' });
  assert.equal(result.code, 'future-phone-error');
});

test('classifies a native exception with no Firebase code when its message is meaningful', () => {
  const result = normalizePhoneAuthError({
    exceptionClass: 'com.google.firebase.FirebaseException',
    message: 'Play Integrity token validation failed.'
  });
  assert.equal(result.code, 'auth/play-integrity-failed');
});

test('uses unknown only for a native exception with no meaningful code or classification', () => {
  const result = normalizePhoneAuthError({
    exceptionClass: 'java.lang.IllegalStateException',
    message: 'Native verification failed.'
  });
  assert.equal(result.code, 'unknown');
  assert.equal(result.exceptionClass, 'java.lang.IllegalStateException');
});

test('keeps throttling and quota failures distinguishable', () => {
  assert.equal(normalizePhoneAuthError({ code: 'too-many-requests' }).code, 'auth/too-many-requests');
  assert.equal(normalizePhoneAuthError({ code: 'quota-exceeded' }).code, 'auth/quota-exceeded');
});

test('maps confirmation and account failures to distinct messages', () => {
  assert.match(phoneAuthErrorMessage({ code: 'auth/invalid-verification-code' }), /invalid OTP/i);
  assert.match(phoneAuthErrorMessage({ code: 'auth/code-expired' }), /expired/i);
  assert.match(phoneAuthErrorMessage({ code: 'auth/user-disabled' }), /disabled/i);
  assert.match(phoneAuthErrorMessage({ code: 'auth/network-request-failed' }), /connection/i);
});

test('keeps Play Integrity and reCAPTCHA failures distinguishable', () => {
  assert.equal(normalizePhoneAuthError({ message: 'Play Integrity verdict rejected.' }).code, 'auth/play-integrity-failed');
  assert.equal(normalizePhoneAuthError({ code: 'captcha-check-failed' }).code, 'auth/captcha-check-failed');
});

test('rejects a malformed phone number before native authentication', () => {
  assert.equal(normalizeIndianMobileNumber('+91 abc 123'), '');
});

test('sanitizes phone auth diagnostics', () => {
  const sanitized = sanitizePhoneAuthMessage('Failed for +919876543210 using 123456 and eyJabc.def.ghi access_token=secret credential=private');
  assert.doesNotMatch(sanitized, /9876543210|123456|eyJabc|secret|private/);
  assert.match(sanitized, /phone redacted|code redacted|token redacted|credential redacted/);
});
