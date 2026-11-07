// Service worker do SS Financeiro.
// Recebe arquivos compartilhados de outros apps (ex.: comprovante do WhatsApp)
// e deixa o app abrir pedindo para escolher o lançamento.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.searchParams.get('share') === '1') {
    event.respondWith((async function () {
      try {
        const form = await event.request.formData();
        const files = form.getAll('arquivos').filter(function (f) { return f && typeof f !== 'string'; });
        const cache = await caches.open('ss-compartilhados');
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          await cache.put(new Request('./compartilhado-' + Date.now() + '-' + i),
            new Response(f, { headers: { 'content-type': f.type || 'application/octet-stream', 'x-nome': encodeURIComponent(f.name || 'comprovante') } }));
        }
      } catch (e) {}
      return Response.redirect('./?compartilhado=1', 303);
    })());
    return;
  }
  // Demais requisições: sempre a versão mais nova do app.
  if (url.origin === self.location.origin && event.request.method === 'GET') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(function () { return caches.match(event.request); }));
  }
});
