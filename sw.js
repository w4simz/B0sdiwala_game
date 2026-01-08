const CACHE_NAME = "neon-runner-v1";

const ASSETS = [
  "index.html",
  "style.css",
  "game.js",
  "manifest.json",

  // assets
  "player-cyan.png",
  "player-pink.png",
  "player-purple.png",
  "block.png",
  "money.png",
  "coin.mp3",
  "hit.mp3"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});