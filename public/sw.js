const CACHE = "monastery-vip-v1";

const PRECACHE = [
  "/espacio-vip",
  "/manifest.json",
  "/images/logo.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Ignore non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Network-first for auth, API and Next.js data routes
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/_next/data") ||
    url.pathname.startsWith("/api")
  ) return;

  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
