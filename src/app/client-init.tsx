'use client'

import { useEffect } from 'react'

export function ClientInit() {
  useEffect(() => {
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
  }, [])

  return null
}
