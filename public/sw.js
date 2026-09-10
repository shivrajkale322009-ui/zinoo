const CACHE_NAME = 'zinoo-app-shell-v6';
const IMAGE_CACHE_NAME = 'zinoo-images-v1';
const MAX_IMAGE_CACHE_ENTRIES = 60;
const ASSETS_TO_CACHE = [
  '/index.html',
  '/manifest.json',
  '/brand/zinoo-logo.png',
  '/zinoo-home-hero.webp'
];

const trimImageCache = async (cache) => {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_IMAGE_CACHE_ENTRIES)).map((request) => cache.delete(request)));
};

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell and dependencies');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => Promise.all(clients.map((client) => client.navigate(client.url))))
  );
});

// Fetch Requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const network = fetch(event.request).then(async (response) => {
          if (response.ok || response.type === 'opaque') {
            await cache.put(event.request, response.clone());
            trimImageCache(cache);
          }
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (url.pathname === '/manifest.json') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match('/manifest.json'))
    );
    return;
  }

  if (ASSETS_TO_CACHE.some((asset) => new URL(asset, self.location.origin).pathname === url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
    );
  }
});
