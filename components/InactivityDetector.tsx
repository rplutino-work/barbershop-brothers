'use client'

import { useEffect, useRef } from 'react'

interface InactivityDetectorProps {
  onInactive: () => void
  timeoutMinutes?: number
}

export function InactivityDetector({ onInactive, timeoutMinutes = 3 }: InactivityDetectorProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ Inactividad detectada - Mostrando screensaver')
        onInactive()
      }, timeoutMs)
    }

    // Eventos que resetean el timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Agregar listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true)
    })

    // Iniciar timer
    resetTimer()

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [onInactive, timeoutMinutes])

  return null
}

