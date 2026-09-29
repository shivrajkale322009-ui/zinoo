import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import './index.css';
import './styles/zinoo-design-system-v1.css';
import './styles/admin-system.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { initializeNotificationTapHandling } from './services/pushNotifications';
import { prepareLiveUpdate } from './updates/liveUpdates';

performance.mark('zinoo:react-mounted');

// Activate previously downloaded assets before any login, map or form mounts.
// No network request is made during this step; resuming the app never runs it.
prepareLiveUpdate().then((reloading) => {
  if (!reloading) ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider><App /></ThemeProvider>
  );
});

// Initialize Native Capacitor Features
if (Capacitor.isNativePlatform()) {
  initializeNotificationTapHandling().catch((error) => {
    if (import.meta.env.DEV) console.error('[Druvio FCM] Tap handling initialization failed.', error);
  });
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  window.setTimeout(() => StatusBar.setStyle({ style: Style.Dark }).catch(() => {}), 1400);
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    const buyerBack = new CustomEvent('zinoo:buyer-back', { cancelable: true });
    window.dispatchEvent(buyerBack);
    if (buyerBack.defaultPrevented) return;
    if (!canGoBack || window.location.pathname === '/') {
      CapacitorApp.minimizeApp();
    } else {
      window.history.back();
    }
  });
}

// Register Custom PWA Service Worker
// Android starts from bundled assets or a verified live-update bundle. A service
// worker would add another app-shell cache and could mask updates or rollback.
// Browser/PWA installs still retain offline support.
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error('Zinoo Service Worker registration failed:', error);
      });
  });
}
