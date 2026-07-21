// Service worker mínimo — existe só para o navegador permitir "instalar" o site como app.
// Não guarda dados em cache (os dados vêm sempre da nuvem em tempo real).
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
