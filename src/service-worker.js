const CACHE = `cache-${self.__SVELTE_KIT_APP_VERSION__ || 'unknown'}`;

// Function to get assets from SvelteKit or use a default empty array
const getAssets = () => {
  try {
    return self.__SVELTE_KIT_ASSETS__ || [];
  } catch (e) {
    console.warn('Failed to get SvelteKit assets:', e);
    return [];
  }
};

const ASSETS = getAssets();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => {
        self.skipWaiting();
      })
      .catch(err => {
        console.error('Failed to cache assets:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async keys => {
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          // Cache the fetched response
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return a fallback
        return new Response('You are offline and this page is not cached.');
      })
  );
});

// Log any errors that occur within the Service Worker
self.addEventListener('error', function(event) {
  console.error('Service Worker error:', event.error);
});