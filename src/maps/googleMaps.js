import { googleMapsConfig } from './googleMapsConfig';

let mapsPromise;
const SCRIPT_ID = 'druvio-google-maps-script';
const CALLBACK_NAME = '__druvioGoogleMapsReady';

export class GoogleMapsLoadError extends Error {
  constructor(code) {
    super(code);
    this.name = 'GoogleMapsLoadError';
    this.code = code;
  }
}

export function loadGoogleMaps() {
  if (window.google?.maps?.marker?.AdvancedMarkerElement) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;

  if (!googleMapsConfig.isConfigured) {
    return Promise.reject(new GoogleMapsLoadError('configuration-missing'));
  }

  mapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    const previousAuthFailureHandler = window.gm_authFailure;

    const fail = (code) => {
      const failedScript = document.getElementById(SCRIPT_ID);
      if (failedScript?.dataset.druvioLoader === 'true') failedScript.remove();
      delete window[CALLBACK_NAME];
      mapsPromise = undefined;
      reject(new GoogleMapsLoadError(code));
    };

    window.gm_authFailure = () => {
      window.dispatchEvent(new Event('druvio-google-maps-auth-failure'));
      fail('authentication-failed');
      previousAuthFailureHandler?.();
    };

    window[CALLBACK_NAME] = () => {
      delete window[CALLBACK_NAME];
      if (window.google?.maps?.marker?.AdvancedMarkerElement) resolve(window.google.maps);
      else fail('required-library-missing');
    };

    if (existingScript) {
      existingScript.addEventListener('error', () => fail('script-load-failed'), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.dataset.druvioLoader = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsConfig.apiKey)}&v=weekly&loading=async&libraries=drawing,geometry,marker,places&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => fail('script-load-failed');
    document.head.appendChild(script);
  });

  return mapsPromise;
}
