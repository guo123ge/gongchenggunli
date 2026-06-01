const CACHE_NAME = "construction-site-v1";
const PRECACHE_URLS = ["/manifest.json", "/logo.svg"];
const RUNTIME_FALLBACK_URLS = ["/dashboard", "/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(PRECACHE_URLS);
      await Promise.allSettled(RUNTIME_FALLBACK_URLS.map((url) => cache.add(url)));
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => cached || caches.match("/dashboard") || caches.match("/")),
    ),
  );
});
