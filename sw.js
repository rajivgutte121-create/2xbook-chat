// 2X BOOK Service Worker — basic offline shell
const CACHE = '2xbook-v1';
const ASSETS = ['./customer.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // Never cache Firebase / google APIs — always go to network
  if (url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic')) {
    return; // default browser fetch
  }
  // network-first for our own pages, fallback to cache when offline
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy).catch(()=>{}));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
