const KEY = 'zinoo-otp-retry-after';
let retryAfter = 0;

export const otpRetrySeconds = (now = Date.now()) => {
  try {
    const saved = Number(globalThis.sessionStorage?.getItem(KEY));
    if (Number.isFinite(saved)) retryAfter = Math.max(retryAfter, saved);
  } catch { /* Memory fallback when storage is unavailable. */ }
  return Math.max(0, Math.ceil((retryAfter - now) / 1000));
};

export const delayOtpRetry = (code, now = Date.now()) => {
  if (code === 'auth/invalid-phone-number') return otpRetrySeconds(now);
  // This is a client retry delay, not an estimate of Firebase's unblock time.
  const seconds = code === 'auth/too-many-requests' ? 300 : 30;
  retryAfter = Math.max(retryAfter, now + seconds * 1000);
  try { globalThis.sessionStorage?.setItem(KEY, String(retryAfter)); } catch { /* Memory fallback. */ }
  return otpRetrySeconds(now);
};
