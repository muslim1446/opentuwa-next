'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePlayer } from '@/context/PlayerContext'

export function VolumeControl() {
  const { volume, isMuted, setVolume } = usePlayer()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const [portalBottom, setPortalBottom] = useState('0px')
  const muteTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useLayoutEffect(() => {
    if (isOpen && isMobile) {
      const island = document.getElementById('player-island')
      if (island) {
        const rect = island.getBoundingClientRect()
        const gap = 10
        setPortalBottom(`${window.innerHeight - rect.top + gap}px`)
      }
    }
  }, [isOpen, isMobile])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        if (isMobile && portalRef.current?.contains(e.target as Node)) return
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isMobile])

  const displayVolume = isMuted ? 0 : volume

  const handleMouseEnter = () => {
    if (muteTimerRef.current) clearTimeout(muteTimerRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    muteTimerRef.current = setTimeout(() => setIsOpen(false), 500)
  }

  const popoverContent = (
    <div className="volume-popover">
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={displayVolume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="island-volume-slider"
        aria-label="Volume"
      />
    </div>
  )

  return (
    <div ref={wrapRef} className={`island-volume-wrap ${isOpen ? 'volume-open' : ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isOpen && isMobile ? createPortal(
        <div ref={portalRef} className="mobile-popover-portal" style={{ bottom: portalBottom }}>{popoverContent}</div>,
        document.body
      ) : popoverContent}
      <button
        id="volume-btn"
        className="island-icon-btn"
        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        tabIndex={0}
      >
        {isMuted || volume === 0 ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : volume < 0.5 ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  )
}
