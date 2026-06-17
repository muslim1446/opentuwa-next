'use client'

import { ReactNode, useEffect } from 'react'
import { I18nProvider } from '@/context/I18nContext'
import { PlayerProvider } from '@/context/PlayerContext'

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      #_universal_loader {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: #1C1C1E; z-index: 2147483647; opacity: 1;
        display: flex; flex-direction: column; align-items: center;
        justify-content: center;
        transition: opacity 0.8s cubic-bezier(0.32, 0.72, 0, 1) 0.2s;
      }
      .apple-spinner {
        width: 44px; height: 44px;
        border: 3.5px solid rgba(255,255,255,0.15);
        border-top-color: #FFFFFF; border-radius: 50%;
        animation: apple-spin 1s linear infinite;
        margin-bottom: 24px;
      }
      @keyframes apple-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      #_universal_loader.loaded { opacity: 0; pointer-events: none; }
    `
    document.head.appendChild(style)

    const overlay = document.createElement('div')
    overlay.id = '_universal_loader'
    overlay.innerHTML = '<div class="apple-spinner"></div>'
    document.documentElement.appendChild(overlay)

    const reveal = () => {
      overlay.classList.add('loaded')
      setTimeout(() => overlay.remove(), 1200)
    }
    if (document.readyState === 'complete') reveal()
    else window.addEventListener('load', reveal)
    setTimeout(reveal, 6000)
  }, [])

  return (
    <I18nProvider>
      <PlayerProvider>
        {children}
      </PlayerProvider>
    </I18nProvider>
  )
}
