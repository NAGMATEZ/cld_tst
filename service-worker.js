// Budget Manager PWA — Service Worker
// Cache-first strategy, offline-first

const CACHE_NAME = 'budget-pwa-v1';

// All assets to pre-cache on install
const PRE_CACHE_URLS = [
  '.',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icon-192.svg',
  'icon-512.svg',
];

// CDN assets to cache on first use (and serve from cache thereafter)
const CDN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
];

// ── Install: pre-cache all local assets ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_URLS);
    })
  );
  // Don't wait for old SW to stop — activate immediately
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for local + CDN assets ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      // Not in cache — fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache CDN assets and same-origin assets for future offline use
          if (
            response.ok &&
            (url.origin === self.location.origin ||
              CDN_HOSTS.some((h) => url.hostname.includes(h)))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
    })
  );
});

// ── Message: skip waiting on demand (update flow) ────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
