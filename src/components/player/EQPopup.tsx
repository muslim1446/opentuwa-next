'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { EQ_BANDS } from '@/lib/configs'

interface EQBand {
  label: string
  freq: number
  type: 'lowshelf' | 'peaking' | 'highshelf'
  Q: number
}

const LS_KEY = 'tuwa_eq_v1'

function loadGains(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveGains(gains: Record<number, number>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(gains))
  } catch {}
}

function formatGain(g: number): string {
  return `${g >= 0 ? '+' : ''}${g.toFixed(1)} dB`
}

export function EQPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [gains, setGains] = useState<Record<number, number>>(loadGains)
  const backdropRef = useRef<HTMLDivElement>(null)

  const handleSliderChange = useCallback((index: number, value: number) => {
    setGains(prev => {
      const next = { ...prev, [index]: value }
      saveGains(next)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setGains({})
    saveGains({})
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      <button
        id="eq-btn"
        className={`player-btn w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 ${
          isOpen ? 'eq-active' : ''
        }`}
        style={{
          color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: 'transparent',
        }}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Equalizer"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={backdropRef}
          id="eq-backdrop"
          className="eq-open fixed inset-0 z-[9998] flex items-end justify-center"
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            paddingBottom: 'max(130px, calc(env(safe-area-inset-bottom, 0px) + 80px))',
          }}
          onClick={(e) => { if (e.target === backdropRef.current) setIsOpen(false) }}
        >
          <div
            id="eq-popup"
            className="px-5 py-4"
            role="dialog"
            aria-modal="true"
            aria-label="Equalizer"
            style={{
              background: 'var(--glass-bg)',
              border: '0.5px solid var(--glass-border)',
              borderRadius: 'var(--radius-squircle, 24px)',
              boxShadow: 'var(--shadow-floating)',
              width: 'min(320px, 92vw)',
              transform: 'translateY(0)',
              opacity: 1,
              transition: 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <div id="eq-popup-header" className="flex items-center justify-between mb-4">
              <span id="eq-popup-title" className="text-[15px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text-secondary)' }}>
                Equalizer
              </span>
              <button
                id="eq-close-btn"
                className="w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer text-lg transition-all"
                style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
                onClick={() => setIsOpen(false)}
                aria-label="Close equalizer"
              >
                ✕
              </button>
            </div>

            {EQ_BANDS.map((band, i) => (
              <div key={band.label} className="eq-band-row flex items-center gap-2 mb-3 last:mb-0">
                <span className="eq-band-label text-[15px] font-medium w-12 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {band.label}
                </span>
                <input
                  type="range"
                  className="eq-band-slider flex-1 h-1 rounded-full appearance-none cursor-pointer outline-none"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={gains[i] ?? 0}
                  onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                  style={{
                    background: 'var(--surface-secondary)',
                  }}
                  aria-label={`${band.label} gain`}
                />
                <span className="eq-band-value text-[13px] w-12 text-right tabular-nums flex-shrink-0 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {formatGain(gains[i] ?? 0)}
                </span>
              </div>
            ))}

            <div id="eq-divider" className="h-[0.5px] my-4" style={{ background: 'var(--glass-border)' }} />

            <button
              id="eq-reset-btn"
              className="w-full py-2 rounded-lg text-[15px] font-sans cursor-pointer tracking-[0.02em] transition-all min-h-11 border"
              style={{
                background: 'transparent',
                borderColor: 'var(--glass-border)',
                color: 'var(--text-secondary)',
              }}
              onClick={handleReset}
            >
              Reset to flat
            </button>
          </div>
        </div>
      )}
    </>
  )
}
