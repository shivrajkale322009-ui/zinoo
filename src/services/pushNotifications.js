import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';

const DruvioNotifications = registerPlugin('DruvioNotifications');
const ASKED_PERMISSION_KEY = 'druvio-notifications-permission-requested';
const SUPPORTED_BUYER_SCREENS = new Set(['home', 'map', 'saved', 'cashback', 'nearby', 'support']);

const debugLog = (message, details) => {
  if (import.meta.env.DEV) console.info(`[Druvio FCM] ${message}`, details || '');
};

const screenFromUrl = (url) => {
  if (!url) return 'home';
  try {
    const parsed = new URL(url);
    const queryScreen = parsed.searchParams.get('screen');
    const pathScreen = parsed.pathname.split('/').filter(Boolean).at(-1);
    const screen = String(queryScreen || pathScreen || 'home').toLowerCase();
    return SUPPORTED_BUYER_SCREENS.has(screen) ? screen : 'home';
  } catch {
    return 'home';
  }
};

const handleNotificationUrl = (url, source) => {
  const screen = screenFromUrl(url);
  window.sessionStorage.setItem('flinokBuyerDestination', screen);
  window.dispatchEvent(new CustomEvent('druvio:notification-navigation', { detail: { screen } }));
  debugLog('Notification tap/deep-link handled.', { source, screen });
};

export const initializeNotificationTapHandling = async () => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  debugLog('Native FCM tap handling initialized.');
  await CapacitorApp.addListener('appUrlOpen', ({ url }) => handleNotificationUrl(url, 'appUrlOpen'));
  const launch = await CapacitorApp.getLaunchUrl().catch(() => null);
  if (launch?.url) handleNotificationUrl(launch.url, 'coldLaunch');
};

export const requestNotificationPermissionOnce = async () => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  const current = await DruvioNotifications.checkPermissions();
  if (current.notifications === 'granted') {
    debugLog('Notification permission already granted.');
    return;
  }
  if (window.localStorage.getItem(ASKED_PERMISSION_KEY)) {
    debugLog('Notification permission was previously declined; no repeat prompt shown.');
    return;
  }
  window.localStorage.setItem(ASKED_PERMISSION_KEY, 'true');
  const result = await DruvioNotifications.requestPermissions();
  debugLog('Notification permission request completed.', { status: result.notifications });
};
