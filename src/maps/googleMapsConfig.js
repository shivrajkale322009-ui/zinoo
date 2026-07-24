const googleMapsApiKey =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

export const googleMapsConfig = {
  apiKey: googleMapsApiKey || '',
  isConfigured: Boolean(googleMapsApiKey)
};

export const googleMapsMissingMessage = import.meta.env.DEV
  ? 'Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to the root .env file and restart the Vite dev server.'
  : 'Map is temporarily unavailable.';

export const googleMapsUnavailableMessage = import.meta.env.DEV
  ? 'Google Maps could not be loaded. Check the browser console and your Google Cloud API restrictions.'
  : 'Map is temporarily unavailable.';
