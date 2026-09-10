import { googleMapsConfig } from './googleMapsConfig';

let mapsPromise;
const SCRIPT_ID = 'zinoo-google-maps-script';
const CALLBACK_NAME = '__zinooGoogleMapsReady';
const LOAD_TIMEOUT_MS = 15000;

export class GoogleMapsLoadError extends Error {
  constructor(code) {
    super(code);
    this.name = 'GoogleMapsLoadError';
    this.code = code;
  }
}

async function getGoogleMapsWithMarkerLibrary() {
  const maps = window.google?.maps;
  if (!maps?.Map) throw new GoogleMapsLoadError('required-library-missing');

  if (!maps.marker?.AdvancedMarkerElement && typeof maps.importLibrary === 'function') {
    await maps.importLibrary('marker');
  }
  if (!maps.marker?.AdvancedMarkerElement) {
    throw new GoogleMapsLoadError('required-library-missing');
  }
  return maps;
}

export function loadGoogleMaps() {
  if (window.google?.maps?.Map) return getGoogleMapsWithMarkerLibrary();
  if (mapsPromise) return mapsPromise;

  if (!googleMapsConfig.isConfigured) {
    return Promise.reject(new GoogleMapsLoadError('configuration-missing'));
  }

  mapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    const previousAuthFailureHandler = window.gm_authFailure;
    let settled = false;
    let loadTimeout;

    const cleanup = ({ keepCallback = false } = {}) => {
      window.clearTimeout(loadTimeout);
      // The Maps script can invoke its callback more than once while loading
      // optional libraries. Keep a no-op handler after success to prevent an
      // uncaught "callback is not a function" error on a later invocation.
      if (keepCallback) window[CALLBACK_NAME] = () => {};
      else delete window[CALLBACK_NAME];
      if (window.gm_authFailure === authFailureHandler) {
        if (previousAuthFailureHandler) window.gm_authFailure = previousAuthFailureHandler;
        else delete window.gm_authFailure;
      }
    };

    const fail = (code) => {
      if (settled) return;
      settled = true;
      const failedScript = document.getElementById(SCRIPT_ID);
      if (failedScript?.dataset.zinooLoader === 'true') failedScript.remove();
      cleanup();
      mapsPromise = undefined;
      reject(new GoogleMapsLoadError(code));
    };

    const authFailureHandler = () => {
      window.dispatchEvent(new Event('flinok-google-maps-auth-failure'));
      fail('authentication-failed');
      previousAuthFailureHandler?.();
    };
    window.gm_authFailure = authFailureHandler;

    window[CALLBACK_NAME] = () => {
      if (settled) return;
      getGoogleMapsWithMarkerLibrary()
        .then((maps) => {
          if (settled) return;
          settled = true;
          cleanup({ keepCallback: true });
          resolve(maps);
        })
        .catch(() => fail('required-library-missing'));
    };

    loadTimeout = window.setTimeout(
      () => fail(navigator.onLine ? 'load-timeout' : 'network-offline'),
      LOAD_TIMEOUT_MS
    );

    if (existingScript) {
      existingScript.addEventListener('error', () => fail('script-load-failed'), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.dataset.zinooLoader = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsConfig.apiKey)}&v=weekly&loading=async&libraries=geometry,marker,places&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => fail('script-load-failed');
    document.head.appendChild(script);
  });

  return mapsPromise;
}
