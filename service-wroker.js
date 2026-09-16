const CACHE_NAME = "homework-tracker-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames.map(cacheName => {

                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }

                })

            );

        })
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)

            .then(response => {

                const responseClone =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});