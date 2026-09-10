const CACHE_PREFIX = 'flinok:startup:';
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

const storage = () => {
  try { return window.localStorage; } catch { return null; }
};

export const readStartupCache = (key, fallback) => {
  try {
    const raw = storage()?.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return fallback;
    const cached = JSON.parse(raw);
    if (!cached || Date.now() - Number(cached.savedAt || 0) > MAX_CACHE_AGE_MS) return fallback;
    return cached.value ?? fallback;
  } catch {
    return fallback;
  }
};

// User choices such as saved projects are durable preferences, not startup data.
// They intentionally use the same on-disk shape as the existing cache so saved
// values written by earlier releases continue to work without a migration.
export const readPersistentCache = (key, fallback) => {
  try {
    const raw = storage()?.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return fallback;
    const cached = JSON.parse(raw);
    return cached?.value ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeStartupCache = (key, value) => {
  try {
    storage()?.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Storage quotas and privacy modes must never interrupt the live app.
  }
};

export const scheduleIdleWork = (callback, timeout = 1000) => {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(callback, Math.min(timeout, 250));
  return () => window.clearTimeout(id);
};
