const CACHE_NAME = 'mangalore-nav-static-v1';
const IMAGE_CACHE_NAME = 'mangalore-nav-images-v1';
const TILE_CACHE_NAME = 'mangalore-nav-tiles-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icons.svg',
  '/alien_bg.png',
  '/vada_sambar.png',
  '/yakshagana.jpg'
];

// Install Event: cache baseline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching baseline assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up old caches
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, IMAGE_CACHE_NAME, TILE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!allowedCaches.includes(key)) {
            console.log('SW: Wiping old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: intercept requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip POST, PUT, DELETE, etc. API requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and other non-http protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // 1. Map Tiles (openstreetmap.org)
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Serve cached tile immediately, fetch/update in background to keep fresh
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse);
              }
            }).catch(() => {}); // ignore network errors offline
            return cachedResponse;
          }

          // Fetch from network and cache
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.warn('SW: Map tile fetch failed and not cached:', err);
            return new Response('', { status: 408, statusText: 'Network timeout' });
          });
        });
      })
    );
    return;
  }

  // 2. Images (local /images/* or unsplash image requests)
  if (url.pathname.includes('/images/') || url.hostname.includes('images.unsplash.com')) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fallback for image when completely offline
            return caches.match('/favicon.svg');
          });
        });
      })
    );
    return;
  }

  // 3. API endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Static UI assets (same origin index.html, bundle JS/CSS, manifest, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.warn('SW: Local asset fetch failed offline:', err);
            // HTML routing fallback: serve index.html for navigation when offline
            if (event.request.mode === 'navigate') {
              return cache.match('/index.html') || cache.match('/');
            }
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
});
