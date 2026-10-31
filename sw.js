// Service worker: lets the app open offline after the first visit. Network first, cache as fallback.
const V = "hadota-v4";
const FILES = ["./", "index.html", "app.js", "engine.js", "data.js", "backend.js", "config.js", "manifest.webmanifest", "assets/hadota.webp", "assets/cafe.mp3", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // Supabase and CDN calls go straight to the network
  // network first, so updates always arrive; the cache is only the offline fallback
  e.respondWith(fetch(e.request).then((r) => { if (r.status === 200) caches.open(V).then((c) => c.put(e.request, r.clone())).catch(() => {}); return r; }).catch(() => caches.match(e.request)));
});
