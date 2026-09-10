const AUTH_ATTEMPT_KEY = 'zinoo-auth-diagnostic-attempt';

const readSessionStorage = () => {
  try { return window.sessionStorage; } catch { return null; }
};

const createAttemptId = () => {
  const randomPart = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 10)
    || Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}-${randomPart}`;
};

export const getAuthAttemptId = () => readSessionStorage()?.getItem(AUTH_ATTEMPT_KEY) || 'none';

export const startAuthAttempt = () => {
  const attemptId = createAttemptId();
  readSessionStorage()?.setItem(AUTH_ATTEMPT_KEY, attemptId);
  return attemptId;
};

export const clearAuthDiagnostics = () => {
  readSessionStorage()?.removeItem(AUTH_ATTEMPT_KEY);
  if (typeof window !== 'undefined') window.__ZINOO_AUTH_TRACE__ = [];
};

export const sanitizeAuthDiagnosticMessage = (message) => String(message || 'Unknown authentication error.')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email redacted]')
  .replace(/\+\d[\d\s()-]{7,}\d/g, '[phone redacted]')
  .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[token redacted]')
  .slice(0, 240);

export const authTrace = (event, details = {}) => {
  const entry = {
    attemptId: getAuthAttemptId(),
    timestamp: new Date().toISOString(),
    ...details
  };
  if (typeof window !== 'undefined') {
    window.__ZINOO_AUTH_TRACE__ = [...(window.__ZINOO_AUTH_TRACE__ || []).slice(-99), { event, ...entry }];
  }
  console.info(`[AUTH] ${event} ${JSON.stringify(entry)}`);
};

export const authFailureDetails = (error, details = {}) => ({
  ...details,
  exceptionClass: error?.name || error?.constructor?.name || 'Error',
  errorCode: error?.code || 'unknown',
  message: sanitizeAuthDiagnosticMessage(error?.message || error),
  cause: sanitizeAuthDiagnosticMessage(error?.cause?.message || error?.cause || 'none')
});
