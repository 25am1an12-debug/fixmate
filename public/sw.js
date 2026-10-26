// FixMate service worker — makes the app installable and usable offline.
// Cache-first for the app's own files; API calls and logins always go to
// the network and are never cached. Bump CACHE when the shell changes.
const CACHE = 'fixmate-v3';
const CORE = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Only our own files — never cache API calls, auth, or other sites' images.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      }).catch(() => {
        // Offline and it's a page navigation — show the app shell.
        if (request.mode === 'navigate') return caches.match('/index.html');
        throw new Error('offline');
      });
    })
  );
});
