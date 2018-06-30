const cachesName = 'app-caches-v1';

const files = [
    '/',
    'js/idb.min.js',
    'js/app.js',
    'css/app.css',
];

//Add files to caches on sw install
self.addEventListener('install', (e) => {
    console.log('[SW] Installig');
    e.waitUntil(
        caches.open(cachesName).then((cache) => {
            console.log('[SW] Caching files');
            return cache.addAll(files);
        }),
    );
});

//Remove old caches and replace them with new ones
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.filter((cacheName) => {
                    return (cacheName.startsWith('currency-converter-') && cacheName != cachesName);
                }).map(cacheName => {
                    return caches.delete(cacheName);
                }),
            );
        }),
    );
});

//Intercept Requests
self.addEventListener('fetch', (event) => {

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === 'https://free.currencyconverterapi.com') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }),
    );
});