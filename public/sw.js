// Service Worker para PWA - SIN CACHÉ
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando sin caché...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando sin caché...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Eliminando cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => clients.claim())
  )
})

// Estrategia: NUNCA cachear nada - siempre ir a la red
self.addEventListener('fetch', (event) => {
  // NO interceptar peticiones de autenticación - dejar que pasen directamente
  if (event.request.url.includes('/api/auth')) {
    return
  }
  
  // NO interceptar peticiones a la API en desarrollo
  if (event.request.url.includes('/api/') && event.request.url.includes('localhost')) {
    return
  }
  
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  )
})

