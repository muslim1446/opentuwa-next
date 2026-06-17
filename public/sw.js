/* sw.js - Comprehensive Offline Caching Strategy */

const CACHE_VERSION = 'v14';
const CORE_CACHE_NAME = 'core-assets-' + CACHE_VERSION;
const ALL_CACHE_NAMES = [CORE_CACHE_NAME];

const CORE_FILES_TO_CACHE = [
  '/',
  '/manifest.json',
  '/locales/en.json',
  '/locales/ar.json',
  '/locales/es.json',
  '/locales/fr.json',
  '/locales/he.json',
  '/locales/zh.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then((coreCache) => {
      return coreCache.addAll(CORE_FILES_TO_CACHE).catch(error => {
        console.error('[SW] Failed to cache one or more core files:', error);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (!ALL_CACHE_NAMES.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  if (CORE_FILES_TO_CACHE.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      }).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }
});
