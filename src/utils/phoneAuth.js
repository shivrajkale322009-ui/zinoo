export const normalizeIndianMobileNumber = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return '';
  return `+91${digits}`;
};

export const assertWebOtpOnline = (online) => {
  if (online) return;
  throw Object.assign(
    new Error('The browser is offline. Firebase phone verification requires an internet connection.'),
    { code: 'auth/network-request-failed' }
  );
};

export const phoneAuthErrorMessage = (error) => {
  const code = normalizePhoneAuthError(error).code;
  if (code === 'auth/invalid-phone-number') return 'Enter a valid 10-digit Indian mobile number.';
  if (code === 'auth/too-many-requests') return 'Too many OTP requests were made. Please wait and try again.';
  if (code === 'auth/quota-exceeded') return 'The SMS quota has been reached. Please try again later.';
  if (code === 'auth/play-integrity-failed') return 'Android app verification failed through Play Integrity. Please reinstall the latest app and try again.';
  if (code === 'auth/captcha-check-failed' || code === 'auth/invalid-app-credential') return 'The security check expired or could not be verified. Please try sending the OTP again.';
  if (code === 'auth/operation-not-allowed') return 'Mobile OTP sign-in is not enabled for this Firebase project.';
  if (code === 'auth/invalid-api-key') return 'Mobile OTP is unavailable because the Firebase API key is invalid.';
  if (code === 'auth/app-not-authorized') return 'This Android app build is not authorized for Firebase Phone Authentication. Verify the installed build certificate and Firebase Android app registration.';
  if (code === 'auth/unauthorized-domain') return 'This web origin is not authorized for Firebase Authentication.';
  if (code === 'auth/network-request-failed') return 'OTP could not be sent. Check your connection and try again.';
  if (code === 'auth/user-disabled') return 'This account has been disabled. Please contact Zinoo support.';
  if (code === 'auth/code-expired' || code === 'auth/session-expired') return 'This OTP has expired. Please request a new code.';
  if (code === 'auth/invalid-verification-code') return 'Invalid OTP. Please check the code and try again.';
  if (code === 'auth/missing-verification-code') return 'Enter the 6-digit OTP and try again.';
  return `OTP could not be sent${code ? ` (${code})` : ''}. Please try again.`;
};

const NATIVE_PHONE_AUTH_CODES = Object.freeze({
  ERROR_APP_NOT_AUTHORIZED: 'auth/app-not-authorized',
  ERROR_CAPTCHA_CHECK_FAILED: 'auth/captcha-check-failed',
  ERROR_INVALID_PHONE_NUMBER: 'auth/invalid-phone-number',
  ERROR_INVALID_VERIFICATION_CODE: 'auth/invalid-verification-code',
  ERROR_MISSING_VERIFICATION_CODE: 'auth/missing-verification-code',
  ERROR_NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
  ERROR_QUOTA_EXCEEDED: 'auth/quota-exceeded',
  ERROR_SESSION_EXPIRED: 'auth/session-expired',
  ERROR_TOO_MANY_REQUESTS: 'auth/too-many-requests'
});

const FIREBASE_PHONE_AUTH_CODES = new Set([
  'app-not-authorized',
  'captcha-check-failed',
  'code-expired',
  'invalid-api-key',
  'invalid-app-credential',
  'invalid-phone-number',
  'invalid-verification-code',
  'missing-verification-code',
  'network-request-failed',
  'operation-not-allowed',
  'quota-exceeded',
  'session-expired',
  'too-many-requests',
  'unauthorized-domain',
  'user-disabled'
]);

const inferNativePhoneAuthCode = (message, exceptionClass) => {
  const diagnostic = `${exceptionClass || ''} ${message || ''}`;
  if (/play[\s_-]*integrity|integrity token|integrity verdict/i.test(diagnostic)) return 'auth/play-integrity-failed';
  if (/recaptcha|captcha/i.test(diagnostic)) return 'auth/captcha-check-failed';
  if (/too many requests|unusual activity|blocked all requests|throttl/i.test(diagnostic)) return 'auth/too-many-requests';
  if (/quota|sms limit/i.test(diagnostic)) return 'auth/quota-exceeded';
  if (/invalid phone|phone number.*invalid/i.test(diagnostic)) return 'auth/invalid-phone-number';
  if (/network|unable to resolve host|timeout/i.test(diagnostic)) return 'auth/network-request-failed';
  return 'unknown';
};

export const normalizePhoneAuthError = (error) => {
  const rawMessage = error?.message || String(error || 'Unknown authentication error.');
  const suppliedCode = error?.code || rawMessage.match(/\b(?:auth\/[a-z-]+|ERROR_[A-Z_]+)\b/)?.[0];
  let code = NATIVE_PHONE_AUTH_CODES[suppliedCode] || suppliedCode;
  if (code && !code.startsWith('auth/') && FIREBASE_PHONE_AUTH_CODES.has(code)) code = `auth/${code}`;
  if (!code) code = inferNativePhoneAuthCode(rawMessage, error?.exceptionClass);
  return {
    code,
    exceptionClass: error?.exceptionClass || error?.name || 'Error',
    message: sanitizePhoneAuthMessage(rawMessage),
    causeClass: error?.causeClass || null,
    cause: error?.cause ? sanitizePhoneAuthMessage(error.cause) : null
  };
};

export const sanitizePhoneAuthMessage = (message) => String(message || 'Unknown authentication error.')
  .replace(/\+\d[\d\s()-]{7,}\d/g, '[phone redacted]')
  .replace(/\b\d{6}\b/g, '[code redacted]')
  .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[token redacted]')
  .replace(/\b(?:id|access|refresh)[ _-]?token\s*[:=]\s*\S+/gi, '[token redacted]')
  .replace(/\bcredential\s*[:=]\s*\S+/gi, '[credential redacted]')
  .slice(0, 300);
