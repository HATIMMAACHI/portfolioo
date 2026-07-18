// Service Worker for Portfolio PWA (resilient caching)
const CACHE_NAME = "hatim-portfolio-v3";

// Only cache local, essential assets. Avoid pre-caching external CDNs to
// prevent install failures when those hosts are blocked or slow.
const urlsToCache = [
  "/",
  "index.html",
  "about.html",
  "style.css",
  "script.js",
  "hatim1.jpg",
  "hatim.jpg",
  "assets/MAACHIIII.pdf",
  "assets/resume.pdf",
  "manifest.json",
];

// Install: try to cache local assets but continue even if some fail
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (
            response &&
            (response.status === 200 || response.type === "opaque")
          ) {
            await cache.put(url, response.clone());
          } else {
            // fallback to cache.add which may throw; ignore errors
            await cache.add(url).catch(() => {});
          }
        } catch (err) {
          // Log and continue; we don't want SW install to fail because of one asset
          console.warn("SW: failed to cache", url, err);
        }
      }
    })()
  );
});

// Fetch: respond with cache first, then network; for navigations provide an
// offline fallback to index.html when possible.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkResponse) => {
          // Cache a copy of same-origin GET requests for future use
          if (
            event.request.method === "GET" &&
            new URL(event.request.url).origin === location.origin
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, networkResponse.clone());
              } catch (e) {
                // ignore cache put errors
              }
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If the request is a navigation, serve the cached index.html as a fallback
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
          // otherwise, let the request fail (opaque) or return nothing
          return null;
        });
    })
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
