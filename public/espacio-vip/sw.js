const CACHE = "monastery-vip-v2";

const PRECACHE = [
  "/espacio-vip",
  "/espacio-vip/manifest.json",
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

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Network-first: auth, API, Next.js data
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/_next/data") ||
    url.pathname.startsWith("/api")
  ) return;

  // Solo cachea rutas dentro del espacio VIP
  if (!url.pathname.startsWith("/espacio-vip") && !url.pathname.startsWith("/_next/static")) return;

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
