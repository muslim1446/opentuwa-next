'use client'

import { useState, useEffect, useRef } from 'react'

export function useIdleTimer(timeout = 4000) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIsIdle(true), timeout)
    }

    const events = ['mousemove', 'touchstart', 'click', 'keydown']
    events.forEach(e => window.addEventListener(e, handleActivity))
    handleActivity()

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeout])

  return isIdle
}
