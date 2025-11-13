'use client'

import { useEffect } from 'react'

export function PWAInstaller() {
  useEffect(() => {
    // NO registrar Service Worker en desarrollo (solo en producción)
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration)
        })
        .catch((error) => {
          console.log('Error al registrar Service Worker:', error)
        })
    } else if (process.env.NODE_ENV === 'development') {
      // Desregistrar service worker en desarrollo si existe
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister()
            console.log('🔧 Service Worker desregistrado en desarrollo')
          })
        })
      }
    }

    // Detectar evento de instalación PWA
    let deferredPrompt: any

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      console.log('💡 PWA puede ser instalada')
    })

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada exitosamente')
      deferredPrompt = null
    })
  }, [])

  return null
}

