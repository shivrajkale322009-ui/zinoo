import { Capacitor } from '@capacitor/core';

const webGoogleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
const androidGoogleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_ANDROID_API_KEY?.trim();
const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
const googleMapsApiKey = isNativeAndroid ? androidGoogleMapsApiKey : webGoogleMapsApiKey;

export const googleMapsConfig = {
  apiKey: googleMapsApiKey || '',
  isConfigured: Boolean(googleMapsApiKey),
  platform: isNativeAndroid ? 'android' : 'web'
};

export const googleMapsMissingMessage = import.meta.env.DEV
  ? `Google Maps is not configured. Add ${isNativeAndroid ? 'VITE_GOOGLE_MAPS_ANDROID_API_KEY' : 'VITE_GOOGLE_MAPS_API_KEY'} to the root .env file and restart the Vite dev server.`
  : 'Map is temporarily unavailable.';

export const googleMapsUnavailableMessage = import.meta.env.DEV
  ? 'Google Maps could not be loaded. Check the browser console and your Google Cloud API restrictions.'
  : 'Map is temporarily unavailable.';

const googleMapsErrorMessages = {
  'authentication-failed': 'Google Maps rejected this app. Check the API key, billing, enabled APIs, and allowed website origins.',
  'configuration-missing': googleMapsMissingMessage,
  'network-offline': 'You appear to be offline. Reconnect to the internet and try loading the map again.',
  'required-library-missing': 'A required Google Maps service is unavailable. Verify the key permits Maps JavaScript, Places API (New), and Geocoding.',
  'script-load-failed': 'Google Maps could not be reached. Check the network connection, firewall, or content blocker.',
  'load-timeout': 'Google Maps took too long to respond. Check the network connection and try again.',
  'quota-exceeded': 'The Google Maps usage limit has been reached. Check the project quota and billing account.',
  'billing-disabled': 'Google Maps billing is not active for this project.',
  'api-unavailable': 'A required Google Maps API is disabled or temporarily unavailable.'
};

export function getGoogleMapsErrorMessage(error) {
  const code = error?.code;
  const status = String(error?.status || error?.message || '').toUpperCase();

  if (code && googleMapsErrorMessages[code]) return googleMapsErrorMessages[code];
  if (status.includes('OVER_QUERY_LIMIT') || status.includes('RESOURCE_EXHAUSTED')) {
    return googleMapsErrorMessages['quota-exceeded'];
  }
  if (status.includes('BILLING')) return googleMapsErrorMessages['billing-disabled'];
  if (status.includes('REQUEST_DENIED') || status.includes('API_NOT_ACTIVATED')) {
    return googleMapsErrorMessages['api-unavailable'];
  }
  return googleMapsUnavailableMessage;
}
