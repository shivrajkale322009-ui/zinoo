let mapsPromise;

export function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your environment.'));
  }

  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previousAuthFailureHandler = window.gm_authFailure;

    window.gm_authFailure = () => {
      window.dispatchEvent(new Event('druvio-google-maps-auth-failure'));
      reject(new Error('Google Maps rejected this API key. Enable Maps JavaScript API, attach billing, and verify the website restrictions.'));
      previousAuthFailureHandler?.();
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=geometry`;
    script.async = true;
    script.onload = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('Google Maps loaded without the Maps JavaScript API.'));
    };
    script.onerror = () => reject(new Error('Google Maps could not be loaded. Check the API key and enabled APIs.'));
    document.head.appendChild(script);
  });

  return mapsPromise;
}
