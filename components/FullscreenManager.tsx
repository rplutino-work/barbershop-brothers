'use client'

import { useEffect } from 'react'

export function FullscreenManager() {
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        const elem = document.documentElement

        if (elem.requestFullscreen) {
          await elem.requestFullscreen()
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen()
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen()
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen()
        }
        
        console.log('✅ Pantalla completa activada')
      } catch (err: any) {
        console.log('Fullscreen no disponible:', err.message)
      }
    }

    // Intentar entrar en pantalla completa al hacer click/touch
    const handleInteraction = () => {
      if (!document.fullscreenElement) {
        requestFullscreen()
      }
    }

    // Esperar a la primera interacción del usuario
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })

    // Forzar orientación landscape en Android
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('any').catch(() => {
        console.log('No se pudo bloquear la orientación')
      })
    }

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  return null
}

