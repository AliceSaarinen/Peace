/* Peace: offline-tuki. Sovellus päivittyy verkosta, kun yhteys on; muuten se toimii välimuistista. */
const VERSION = 'peace-v16';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const RUNTIME = 'peace-runtime-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== RUNTIME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Sivu itse: verkko ensin, jotta päivitykset tulevat perille */
  if (req.mode === 'navigate' || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname))) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }

  /* Kielimalli, tunnistusohjelma, viivakoodinlukija ja fontit: välimuisti ensin */
  const cacheFirst = url.origin === location.origin ||
    /(^|\.)cdn\.jsdelivr\.net$|(^|\.)unpkg\.com$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/.test(url.hostname);
  if (!cacheFirst) return;
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)); }
    return r;
  })));
});
