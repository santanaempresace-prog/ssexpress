// Service worker mínimo — existe só para o navegador permitir "instalar" o site como app.
// Não guarda dados em cache (os dados vêm sempre da nuvem em tempo real).
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch(e) {}

  if (sameOrigin) {
    // Arquivos do próprio sistema (index.html, manifest, etc.) — sempre busca a versão mais
    // nova, pra nunca ficar preso numa versão antiga do app.
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(function () {
        return caches.match(req);
      })
    );
  } else {
    // Bibliotecas externas (Firebase, JSZip, xlsx, jsPDF via CDN) — deixa o navegador usar o
    // cache normal dele. Forçar rebaixar tudo de novo toda vez deixava o carregamento lento
    // e instável em conexões 4G, podendo até impedir o Firebase de conectar a tempo.
    event.respondWith(
      fetch(req).catch(function () {
        return caches.match(req);
      })
    );
  }
});
