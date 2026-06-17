'use client'

import { useState, useRef, useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'

export function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayer()
  const [isOpen, setIsOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const displayVolume = isMuted ? 0 : volume

  return (
    <div ref={wrapRef} className="island-volume-wrap relative flex items-center">
      <div
        className={`volume-popover absolute bottom-full left-1/2 -translate-x-1/2 px-4 py-3 z-[110] rounded-2xl shadow-floating transition-all duration-250 ${
          isOpen ? 'opacity-100 visible pointer-events-auto scale-100' : 'opacity-0 invisible pointer-events-none scale-[0.92]'
        }`}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-vibrancy)',
          WebkitBackdropFilter: 'var(--glass-vibrancy)',
          border: '0.5px solid var(--glass-border)',
        }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={displayVolume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="island-volume-slider w-[120px] h-1 rounded-full appearance-none cursor-pointer outline-none"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          aria-label="Volume"
        />
      </div>
      <button
        id="volume-btn"
        className="island-icon-btn w-11 h-11 rounded-full bg-transparent border-none flex items-center justify-center cursor-pointer flex-shrink-0"
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
