'use client'

import { useEffect } from 'react'

export function PWAInstaller() {
  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration)
        })
        .catch((error) => {
          console.log('Error al registrar Service Worker:', error)
        })
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

