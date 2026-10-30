/* Peace: offline-tuki. Sovellus päivittyy verkosta, kun yhteys on; muuten se toimii välimuistista. */
const VERSION = 'peace-v22';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const RUNTIME = 'peace-runtime-v1';
const SHARE = 'peace-share';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== RUNTIME && k !== SHARE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  /* Jaa sovellukseen: toisesta sovelluksesta jaettu teksti, linkki tai kuva talteen, ja sovellus avautuu */
  if (req.method === 'POST' && url.origin === location.origin && /\/share-target\/?$/.test(url.pathname)) {
    e.respondWith((async () => {
      try {
        const fd = await req.formData(), c = await caches.open(SHARE);
        await Promise.all((await c.keys()).map(k => c.delete(k)));
        const meta = { title: fd.get('title') || '', text: fd.get('text') || '', url: fd.get('url') || '', n: 0, ts: Date.now() };
        const files = fd.getAll('images').filter(f => f && f.size);
        for (let i = 0; i < files.length && i < 10; i++) { await c.put(`./share/img${i}`, new Response(files[i], { headers: { 'content-type': files[i].type || 'image/jpeg' } })); meta.n++; }
        await c.put('./share/meta', new Response(JSON.stringify(meta), { headers: { 'content-type': 'application/json' } }));
      } catch (er) { }
      return Response.redirect(new URL('./?share=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== 'GET') return;

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
