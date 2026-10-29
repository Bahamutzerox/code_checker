const CACHE = 'open-code-v6';
const CORE  = ['./index.html', './name_checker.html', './madrid_graph.html', './icon.svg', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // IPNI requests: network only, fail silently offline
  if (e.request.url.includes('ipni.org')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"results":[]}', {
      headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }
  // Everything else: cache first, fall back to network
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
