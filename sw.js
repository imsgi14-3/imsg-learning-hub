var CACHE_NAME = "imsg-hub-v2";
var STATIC_ASSETS = [
    "/",
    "/index.html",
    "/style.css"
];

self.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(STATIC_ASSETS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener("activate", function(e) {
    e.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(name) { return name !== CACHE_NAME; })
                     .map(function(name) { return caches.delete(name); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function(e) {
    if (e.request.method !== "GET") return;
    var url = new URL(e.request.url);

    if (url.pathname.indexOf("/__/firebase/") !== -1 || url.hostname.indexOf("googleapis.com") !== -1) {
        return;
    }

    // Network-first: always try fresh content, cache only as offline fallback.
    e.respondWith(
        fetch(e.request).then(function(networkResponse) {
            if (networkResponse && networkResponse.status === 200) {
                var clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(e.request, clone);
                });
            }
            return networkResponse;
        }).catch(function() {
            return caches.match(e.request).then(function(cached) {
                return cached || new Response("", { status: 504 });
            });
        })
    );
});
