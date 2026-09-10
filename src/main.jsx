import React from 'react';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider><App /></ThemeProvider>
  </React.StrictMode>
);

// Initialize Native Capacitor Features
if (Capacitor.isNativePlatform()) {
  initializeNotificationTapHandling().catch((error) => {
    if (import.meta.env.DEV) console.error('[Druvio FCM] Tap handling initialization failed.', error);
  });
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  window.setTimeout(() => StatusBar.setStyle({ style: Style.Dark }).catch(() => {}), 1400);
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack || window.location.pathname === '/') {
      CapacitorApp.minimizeApp();
    } else {
      window.history.back();
    }
  });
}

// Register Custom PWA Service Worker
// The Android app ships its web build inside the AAB. A service worker adds a
// second, unnecessary app-shell cache there and can keep an older release UI
// alive after an upgrade. Browser/PWA installs still retain offline support.
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error('Zinoo Service Worker registration failed:', error);
      });
  });
}
