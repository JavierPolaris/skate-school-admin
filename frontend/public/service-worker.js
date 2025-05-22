self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('[SW] Activo y listo para manejar fetches!');
});

self.addEventListener('fetch', (event) => {
  // Puedes cachear cosas aquí si quieres
});
