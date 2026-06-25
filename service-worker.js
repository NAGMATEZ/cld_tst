/* ============================================================
   Budget Manager – Service Worker (cache-first)
   ============================================================ */

const CACHE_NAME = 'budget-manager-v1';

// Local assets cached at install time
const STATIC_ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icon-192.svg',
  'icon-512.svg'
];

// CDN assets cached at install time so the app works fully offline
const CDN_ASSETS = [
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
];

// ── Install: pre-cache everything ─────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([...STATIC_ASSETS, ...CDN_ASSETS])
        .catch(err => {
          // If a CDN asset fails, cache what we can (local assets are critical)
          console.warn('[SW] Some CDN assets failed to pre-cache:', err);
          return cache.addAll(STATIC_ASSETS);
        })
    )
  );
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first, fall back to network & cache ─────────
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful responses (not opaque/error)
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        // Also cache opaque CDN responses (cross-origin with no CORS)
        if (response && response.type === 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});

// ── Message: skipWaiting on demand ────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
