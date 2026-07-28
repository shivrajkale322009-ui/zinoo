import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import './index.css';
import './styles/druvio-design-system-v1.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider><App /></ThemeProvider>
  </React.StrictMode>
);

// Register Custom PWA Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('Druvio Service Worker registered with scope:', registration.scope);
        return registration.update();
      })
      .catch((error) => {
        console.error('Druvio Service Worker registration failed:', error);
      });
  });
}
