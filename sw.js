const CACHE = 'terminal-v1';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll([
    './','index.html','app.js','manifest.json',
    'vendor/tesseract.min.js',
    'img/icon-192.png','img/icon-512.png'
  ])));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
