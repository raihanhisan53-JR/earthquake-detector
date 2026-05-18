// ══════════════════════════════════════════════════════════════
// Earthquake Detector — Service Worker (PWA)
// Strategy: Cache-first for static assets, Network-first for API
// ══════════════════════════════════════════════════════════════

const CACHE_NAME = 'eq-detector-v1';
const STATIC_CACHE = 'eq-static-v1';
const API_CACHE = 'eq-api-v1';

// Assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/tornado-siren.mp3',
  '/alert.m4a',
  '/siren-alert.mp3',
];

// ── Install: precache static assets ──────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial fail:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and cross-origin requests
  if (request.method !== 'GET') return;
  if (!url.origin.startsWith('http')) return;

  // API routes: Network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // External APIs (BMKG, USGS): Network-first, short TTL cache
  if (
    url.hostname.includes('bmkg.go.id') ||
    url.hostname.includes('earthquake.usgs.gov') ||
    url.hostname.includes('nominatim.openstreetmap.org')
  ) {
    event.respondWith(networkFirst(request, API_CACHE, 8000));
    return;
  }

  // Static assets (JS, CSS, images, fonts): Cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|mp3|m4a)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation (HTML pages): Network-first, fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME, 5000));
    return;
  }

  // Default: Network-first
  event.respondWith(networkFirst(request, CACHE_NAME, 5000));
});

// ── Strategy: Cache-first ─────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — resource not cached', { status: 503 });
  }
}

// ── Strategy: Network-first with timeout ─────────────────────
async function networkFirst(request, cacheName, timeoutMs) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(tid);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(tid);
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback for navigation
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) return shell;
    }
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Data tidak tersedia saat offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Push notification handler ─────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Earthquake Alert', {
        body: data.body || '',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'earthquake-alert',
        requireInteraction: data.requireInteraction || false,
        data: { url: data.url || '/' },
      })
    );
  } catch {
    // ignore malformed push
  }
});

// ── Notification click: open app ──────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
