const CACHE_NAME = 'suiri-cache-v1';

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['./', './index.html']);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((chaves) => {
            return Promise.all(
                chaves.map((chave) => {
                    if (chave !== CACHE_NAME) return caches.delete(chave);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        fetch(evento.request).catch(() => caches.match(evento.request))
    );
});
