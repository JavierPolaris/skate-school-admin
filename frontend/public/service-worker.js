self.addEventListener('install', (event) => {
  
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  
});

self.addEventListener('fetch', (event) => {
  // Puedes cachear cosas aquí si quieres
});
