const CACHE_NAME = 'alive-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/mail.js',
  './js/storage.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
