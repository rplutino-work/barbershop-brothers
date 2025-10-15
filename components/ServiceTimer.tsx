'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface ServiceTimerProps {
  startTime: string | Date
  size?: 'sm' | 'md' | 'lg'
}

export function ServiceTimer({ startTime, size = 'md' }: ServiceTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = Math.floor((now - start) / 1000) // Segundos
      setElapsed(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }[size]

  const iconSizeClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }[size]

  return (
    <div className="flex items-center gap-2 animate-pulse">
      <Clock className={`${iconSizeClass} text-white`} />
      <span className={`${textSizeClass} font-mono font-bold text-white`}>
        {formatTime(elapsed)}
      </span>
    </div>
  )
}

