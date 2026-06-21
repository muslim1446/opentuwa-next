'use client'

import { useEffect } from 'react'
import { initLiquidGlass, applyPlatform } from '@/lib/liquid-glass'

export function ClientInit() {
  useEffect(() => {
    // Initialize Liquid Glass platform
    initLiquidGlass()

    const u = new URLSearchParams(window.location.search)
    if (u.has('regex')) {
      document.querySelectorAll('.app-brand').forEach(el =>
        (el as HTMLElement).style.setProperty('display', 'none', 'important')
      )
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
      })
    }

    document.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('copy', (e) => e.preventDefault())
    document.addEventListener('dragstart', (e) => e.preventDefault())

    if (window.location.hostname.includes('github.io')) {
      window.location.replace('https://opentuwa.pages.dev' + window.location.pathname + window.location.search)
    }

    // Re-apply platform on resize for orientation changes
    const handleResize = () => applyPlatform()
    window.addEventListener('orientationchange', handleResize)
    return () => window.removeEventListener('orientationchange', handleResize)
  }, [])

  return null
}
