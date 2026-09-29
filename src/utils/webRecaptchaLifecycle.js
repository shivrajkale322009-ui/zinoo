const CAPTCHA_CONTAINER_ERROR = 'The security check container is not mounted.';
export const createWebRecaptchaLifecycle = ({
  createVerifier,
  getContainer,
  onEvent = () => {}
}) => {
  let currentVerifier = null;
  let requestInFlight = false;
  let currentVerifierInvalid = false;
  let disposeRequested = false;
  let currentWidgetContainer = null;

  const createWidgetContainer = (host) => {
    // The host outlives the login modal. A previous instance can still own an
    // in-flight request here; only remove our own child during cleanup.
    // Invisible reCAPTCHA does not create a child node of its own. Google
    // instead records the exact element passed to grecaptcha.render(), so
    // clearing that element's markup is not enough for a retry. Give every
    // verifier a fresh child element to prevent a stale Google registry entry
    // from colliding with the next render.
    if (typeof globalThis.document?.createElement === 'function' && typeof host?.appendChild === 'function') {
      const container = globalThis.document.createElement('div');
      host.appendChild(container);
      return container;
    }
    return host;
  };

  const removeWidgetContainer = () => {
    const container = currentWidgetContainer;
    currentWidgetContainer = null;
    if (container && container !== getContainer()) container.remove?.();
  };

  const invalidate = (reason = 'cleared', expectedVerifier = null, force = false) => {
    if (expectedVerifier && currentVerifier !== expectedVerifier) return false;
    if (requestInFlight && !force) {
      disposeRequested = true;
      onEvent({ type: 'cleanup-deferred', reason });
      return false;
    }
    const verifier = currentVerifier;
    currentVerifier = null;
    currentVerifierInvalid = false;
    disposeRequested = false;
    if (verifier) {
      try { verifier.clear(); } catch (_) { /* Firebase may already have cleared an expired widget. */ }
    }
    removeWidgetContainer();
    onEvent({ type: 'invalidated', reason });
    return Boolean(verifier);
  };

  const initialize = async () => {
    if (currentVerifier && !currentVerifierInvalid) return currentVerifier;
    if (currentVerifier) invalidate('replaced-before-request', null, true);
    const container = getContainer();
    if (!container || container.isConnected === false) {
      throw Object.assign(new Error(CAPTCHA_CONTAINER_ERROR), { code: 'auth/captcha-check-failed' });
    }
    const widgetContainer = createWidgetContainer(container);

    let verifier;
    verifier = createVerifier(widgetContainer, {
      size: 'invisible',
      callback: () => onEvent({ type: 'verified' }),
      'expired-callback': () => {
        if (currentVerifier !== verifier) return;
        currentVerifierInvalid = true;
        onEvent({ type: 'expired' });
      },
      'error-callback': () => {
        if (currentVerifier !== verifier) return;
        currentVerifierInvalid = true;
        onEvent({ type: 'error' });
      }
    });
    currentWidgetContainer = widgetContainer;
    currentVerifier = verifier;
    onEvent({ type: 'created' });
    return verifier;
  };

  const execute = async (executeRequest) => {
    if (requestInFlight) {
      throw Object.assign(new Error('A web phone verification request is already in progress.'), { code: 'auth/request-in-progress' });
    }
    requestInFlight = true;
    onEvent({ type: 'request-started' });
    let verifier;
    try {
      verifier = await initialize();
      const result = await executeRequest(verifier);
      onEvent({ type: 'request-succeeded' });
      return result;
    } catch (error) {
      currentVerifierInvalid = true;
      onEvent({ type: 'request-failed', code: error?.code || 'unknown' });
      throw error;
    } finally {
      requestInFlight = false;
      if (disposeRequested) {
        // The host remains mounted in App while Google's queued callbacks settle.
        globalThis.setTimeout(() => invalidate('deferred-dispose', verifier), 1000);
      }
    }
  };

  return {
    initialize,
    execute,
    invalidate,
    dispose: () => invalidate('unmounted'),
    getCurrent: () => currentVerifierInvalid ? null : currentVerifier,
    getState: () => ({ hasVerifier: Boolean(currentVerifier), valid: Boolean(currentVerifier) && !currentVerifierInvalid, requestInFlight })
  };
};
