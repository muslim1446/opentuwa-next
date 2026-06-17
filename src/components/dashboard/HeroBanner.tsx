'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'

export function HeroBanner() {
  const { focusedSurah } = usePlayer()

  useEffect(() => {
    const titleEl = document.getElementById('door-hero-title')
    const subEl = document.getElementById('door-hero-subtitle')
    if (focusedSurah) {
      if (titleEl) titleEl.textContent = focusedSurah.englishName
      if (subEl) subEl.textContent = focusedSurah.description || ''
    } else {
      if (titleEl) titleEl.textContent = ''
      if (subEl) subEl.textContent = ''
    }
  }, [focusedSurah])

  return (
    <div className="hero-banner">
      <div className="hero-shadow-overlay" />
      <div id="hero-subtitle-overlay" />
      <div className="hero-content">
        <h1 id="door-hero-title" className="hero-title-text" />
        <div id="door-hero-subtitle" className="hero-subtitle" />
      </div>
    </div>
  )
}
