'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { EQ_BANDS } from '@/lib/configs'

const LS_KEY = 'tuwa_eq_v1'

function loadGains(): Record<number, number> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

function saveGains(gains: Record<number, number>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(gains)) }
  catch {}
}

function formatGain(g: number) {
  return `${g >= 0 ? '+' : ''}${g.toFixed(1)} dB`
}

export function EQPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [gains, setGains] = useState<Record<number, number>>(loadGains)
  const backdropRef = useRef<HTMLDivElement>(null)

  // EQ engine refs (persist across renders)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const filterNodesRef = useRef<BiquadFilterNode[]>([])
  const eqConnectedRef = useRef(false)
  const sliderElsRef = useRef<HTMLInputElement[]>([])

  // Build the Web Audio EQ chain (idempotent)
  const ensureEQ = useCallback(() => {
    if (eqConnectedRef.current) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      return true
    }
    const audioEl = document.getElementById('audio-player') as HTMLAudioElement | null
    if (!audioEl) return false
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audioEl)
      }
      const saved = loadGains()
      filterNodesRef.current = EQ_BANDS.map((band, i) => {
        const f = audioCtxRef.current!.createBiquadFilter()
        f.type = band.type
        f.frequency.value = band.freq
        f.Q.value = band.Q
        f.gain.value = (saved[i] !== undefined) ? saved[i] : 0
        return f
      })
      let prev: AudioNode = sourceNodeRef.current
      filterNodesRef.current.forEach(f => { prev.connect(f); prev = f })
      prev.connect(audioCtxRef.current.destination)
      eqConnectedRef.current = true
      return true
    } catch (e) {
      console.warn('[Tuwa EQ] Web Audio setup failed:', e)
      return false
    }
  }, [])

  // Apply current gain values to live filter nodes
  const applyGains = useCallback((g: Record<number, number>) => {
    if (!eqConnectedRef.current) return
    filterNodesRef.current.forEach((f, i) => {
      f.gain.value = (g[i] !== undefined) ? g[i] : 0
    })
  }, [])

  // Collect gain values from slider DOM elements
  const gainsFromSliders = useCallback(() => {
    return sliderElsRef.current.map(s => parseFloat(s.value))
  }, [])

  // Expose initEQ on window so PlayerContext can call it on each verse play
  useEffect(() => {
    const initEQ = () => {
      const ok = ensureEQ()
      if (ok) {
        const sliders = gainsFromSliders()
        applyGains(sliders.length ? Object.fromEntries(sliders.map((v, i) => [i, v])) : loadGains())
      }
    }
    ;(window as any).initEQ = initEQ
    return () => { delete (window as any).initEQ }
  }, [ensureEQ, applyGains, gainsFromSliders])

  // When gains change from slider interaction, apply to filters
  useEffect(() => {
    applyGains(gains)
  }, [gains, applyGains])

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
        className={'island-icon-btn' + (isOpen ? ' eq-active' : '')}
        style={{
          position: 'relative',
          color: isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
        }}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Equalizer"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          style={{
            display: 'flex', position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 'max(130px, calc(env(safe-area-inset-bottom, 0px) + 80px))',
          }}
          onClick={(e) => { if (e.target === backdropRef.current) setIsOpen(false) }}
        >
          <div
            id="eq-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Equalizer"
            style={{
              background: 'var(--glass-bg)', border: '0.5px solid var(--glass-border)',
              borderRadius: 'var(--radius-squircle, 24px)',
              boxShadow: 'var(--shadow-floating)',
              padding: '16px 20px',
              width: 'min(320px, 92vw)',
              transform: 'translateY(0)', opacity: 1,
              transition: 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <div id="eq-popup-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span id="eq-popup-title" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Equalizer
              </span>
              <button
                id="eq-close-btn"
                style={{
                  background: 'var(--surface-secondary)', border: 'none', cursor: 'pointer',
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onClick={() => setIsOpen(false)}
                aria-label="Close equalizer"
              >
                ✕
              </button>
            </div>

            {EQ_BANDS.map((band, i) => (
              <div key={band.label} className="eq-band-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="eq-band-label" style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500, width: 48, flexShrink: 0 }}>
                  {band.label}
                </span>
                <input
                  ref={el => { if (el) sliderElsRef.current[i] = el }}
                  type="range"
                  className="eq-band-slider"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={gains[i] ?? 0}
                  onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                  style={{
                    flex: 1, height: 4, borderRadius: 999, background: 'var(--surface-secondary)',
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none',
                  }}
                  aria-label={`${band.label} gain`}
                />
                <span className="eq-band-value" style={{
                  fontSize: 13, color: 'var(--text-tertiary)', width: 48,
                  textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}>
                  {formatGain(gains[i] ?? 0)}
                </span>
              </div>
            ))}

            <div id="eq-divider" style={{ height: '0.5px', background: 'var(--glass-border)', margin: '16px 0 12px' }} />

            <button
              id="eq-reset-btn"
              style={{
                width: '100%', padding: 8, background: 'transparent',
                border: '0.5px solid var(--glass-border)',
                borderRadius: 'var(--radius-md, 12px)',
                color: 'var(--text-secondary)', fontSize: 15,
                fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: '0.02em', transition: 'background 0.15s, color 0.15s',
                minHeight: 44,
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
