self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("construction-site-v1").then((cache) =>
      cache.addAll(["/", "/dashboard", "/manifest.json", "/logo.svg"]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/dashboard"))),
  );
});

