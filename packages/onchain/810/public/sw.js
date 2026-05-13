self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic pass-through for PWA installability requirements
  // In a real app, you would cache assets here for offline support
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline Mode');
    })
  );
});
