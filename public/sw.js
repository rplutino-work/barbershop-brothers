// Service Worker para PWA - Versión actualizada
const CACHE_NAME = 'barberia-elite-v2'
const urlsToCache = [
  '/',
  '/offline.html'
]

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nueva versión...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando nueva versión...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache viejo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => clients.claim())
  )
})

// Estrategia: Network ONLY para API, Cache para assets estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // NUNCA cachear llamadas a API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    )
    return
  }
  
  // Para todo lo demás: Network first
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})

