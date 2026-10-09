const CACHE = "mazamir-tirage-v3";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./assets/jar.png", "./assets/bg.jpg", "./assets/logo.png",
  "./assets/icon-192.png", "./assets/favicon.ico", "./assets/favicon-32.png", "./assets/apple-touch-icon.png", "./assets/icon-512.png", "./assets/icon-maskable.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
