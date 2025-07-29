const CACHE = 'terminal-cache-v2';
const ASSETS = [
  './', './index.html', './ocr.html',
  './manifest.json', './sw.js',
  './icon-192.png','./icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
  'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k!==CACHE && caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
}); 
