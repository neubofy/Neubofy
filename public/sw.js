const CACHE_VERSION = 'v3';
const CACHE_NAME = `neubofy-cache-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.ico',
        '/neubofylogo.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (!key.startsWith('neubofy-cache-') || key === CACHE_NAME) return Promise.resolve();
        return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML to reduce stale blank pages
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHtml = req.headers.get('accept')?.includes('text/html');
  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first for others
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
