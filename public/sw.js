// Service Worker para PWA
const CACHE_NAME = 'barberia-elite-v1'

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado')
  event.waitUntil(clients.claim())
})

// Estrategia: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
      })
  )
})

