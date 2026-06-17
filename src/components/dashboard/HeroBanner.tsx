'use client'

import { usePlayer } from '@/context/PlayerContext'

export function HeroBanner() {
  const { quranData } = usePlayer()

  return (
    <div className="hero-banner">
      <div className="hero-shadow-overlay" />
      <div className="hero-content">
        <div className="hero-super">
          <span>Premium Audio</span>
          <span className="badge" id="resolution-badge">FHD</span>
        </div>
        <h1 id="door-hero-title" className="hero-title-text">
          Tuwa
        </h1>
        <div id="door-hero-subtitle" className="hero-subtitle" />
      </div>
    </div>
  )
}
