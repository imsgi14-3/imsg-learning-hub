var CACHE_NAME = "imsg-hub-v1";
var STATIC_ASSETS = [
    "/",
    "/index.html",
    "/styles.css",
    "/script.js",
    "/data.js",
    "/db.js",
    "/questions/cs9.json",
    "/questions/phy9.json",
    "/questions/bio9.json",
    "/questions/maths9.json"
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
    var url = new URL(e.request.url);

    if (url.pathname.indexOf("/__/firebase/") !== -1 || url.hostname.indexOf("googleapis.com") !== -1) {
        e.respondWith(
            fetch(e.request).catch(function() {
                return caches.match(e.request);
            })
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then(function(cached) {
            var fetchPromise = fetch(e.request).then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                    var clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return networkResponse;
            }).catch(function() {
                return cached;
            });
            return cached || fetchPromise;
        })
    );
});
