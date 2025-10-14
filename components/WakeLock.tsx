'use client'

import { useEffect } from 'react'

export function WakeLock() {
  useEffect(() => {
    let wakeLock: any = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen')
          console.log('✅ Wake Lock activado - la pantalla no se apagará')
        }
      } catch (err: any) {
        console.log('Wake Lock no disponible:', err.message)
      }
    }

    requestWakeLock()

    // Reactivar wake lock cuando la página vuelve a estar visible
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => console.log('Wake Lock liberado'))
      }
    }
  }, [])

  return null
}

