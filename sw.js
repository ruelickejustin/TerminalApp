const CACHE_NAME='terminal-app-v1';const ASSETS=[
'https://alstomgroup.sharepoint.com/sites/ProduktionBautzenEPU/TerminalApp/index.html',
'https://alstomgroup.sharepoint.com/sites/ProduktionBautzenEPU/TerminalApp/ocr.html',
'https://alstomgroup.sharepoint.com/sites/ProduktionBautzenEPU/TerminalApp/manifest.json',
'https://alstomgroup.sharepoint.com/sites/ProduktionBautzenEPU/TerminalApp/sw.js',
'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap',
'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{if(k!==CACHE_NAME)return caches.delete(k);}))))});self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
