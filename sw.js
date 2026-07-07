// Project Atlas Service Worker

const CACHE = 'atlas-v2';
const STATIC_ASSETS = [
  '/project-atlas/',
  '/project-atlas/index.html',
  '/project-atlas/css/global.css',
  '/project-atlas/js/app.js',
  '/project-atlas/js/store.js',
  '/project-atlas/js/router.js',
  '/project-atlas/js/api.js',
  '/project-atlas/js/socket.js',
  '/project-atlas/js/component.js',
  '/project-atlas/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/project-atlas/api/') || url.hostname !== location.hostname) {
    return;
  }

  if (url.pathname.startsWith('/project-atlas/')) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('<h1>Offline</h1><p>You are offline.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
