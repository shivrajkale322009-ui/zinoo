let mapsPromise;
const SCRIPT_ID = 'druvio-google-maps-script';
const CALLBACK_NAME = '__druvioGoogleMapsReady';

export function loadGoogleMaps() {
  if (window.google?.maps?.marker?.AdvancedMarkerElement) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your environment.'));
  }

  mapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    const previousAuthFailureHandler = window.gm_authFailure;

    const fail = (error) => {
      mapsPromise = undefined;
      reject(error);
    };

    window.gm_authFailure = () => {
      window.dispatchEvent(new Event('druvio-google-maps-auth-failure'));
      fail(new Error('Google Maps rejected this API key. Enable Maps JavaScript API, attach billing, and verify the website restrictions.'));
      previousAuthFailureHandler?.();
    };

    window[CALLBACK_NAME] = () => {
      delete window[CALLBACK_NAME];
      if (window.google?.maps?.marker?.AdvancedMarkerElement) resolve(window.google.maps);
      else fail(new Error('Google Maps loaded without the marker library.'));
    };

    if (existingScript) {
      existingScript.addEventListener('error', () => fail(new Error('Google Maps could not be loaded. Check the API key and enabled APIs.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&libraries=drawing,geometry,marker,places&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => fail(new Error('Google Maps could not be loaded. Check the API key and enabled APIs.'));
    document.head.appendChild(script);
  });

  return mapsPromise;
}
