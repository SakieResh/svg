// StudySphere service worker — caches the app shell so it works offline
// and qualifies as an installable PWA.

const CACHE_NAME = "studysphere-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script.js",
  "./js/supabase-config.js",
  "./manifest.json",
  "./assets/lion-logo.png",
  "./assets/study-sphere.png",
  "./assets/svg-tutor.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for the AI chat / Supabase API calls, cache-first for the app shell.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API/auth calls — always go to the network.
  if (url.hostname.endsWith("supabase.co")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => caches.match("./index.html"))
      );
    })
  );
});
