// Budget Manager PWA — Service Worker
// Cache-first strategy for all local assets + CDN caching on first use

const CACHE_NAME = 'budget-pwa-v1';

// Core assets to cache on install (app shell)
const PRECACHE_URLS = [
  '.',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icon-192.svg',
  'icon-512.svg',
];

// CDN assets cached on first use
const CDN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
];

// ── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Don't skipWaiting here — let the update flow handle it via message
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for local; cache-on-first-use for CDN ─────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // CDN resources: cache on first use (stale-while-revalidate)
  const isCDN = CDN_HOSTS.some((host) => url.hostname.includes(host));
  if (isCDN) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch {
          return cached || new Response('Offline', { status: 503 });
        }
      })
    );
    return;
  }

  // Local assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Return index.html for navigation requests (SPA fallback)
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});

// ── Message: skipWaiting on user request ──────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
