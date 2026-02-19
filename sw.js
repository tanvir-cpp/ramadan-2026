const CACHE = 'ramadan-2026-v3';
const STATIC = [
    'index.html',
    'calendar.html',
    'css/style.css',
    'js/shared.js',
    'js/app.js',
    'js/calendar.js',
    'manifest.json',
    'assets/hero-bg.jpg',
    'assets/icon.svg',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Network-first for API calls
    if (url.hostname === 'api.aladhan.com') {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
        return;
    }

    // Cache-first for static assets
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
