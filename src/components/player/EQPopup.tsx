'use client'

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
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
  return `${g >= 0 ? '+' : ''}${g.toFixed(1)}`
}

export function EQPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [gains, setGains] = useState<Record<number, number>>(loadGains)
  const [isMobile, setIsMobile] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [portalBottom, setPortalBottom] = useState('0px')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const filterNodesRef = useRef<BiquadFilterNode[]>([])
  const eqConnectedRef = useRef(false)
  const sliderElsRef = useRef<HTMLInputElement[]>([])

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

  const applyGains = useCallback((g: Record<number, number>) => {
    if (!eqConnectedRef.current) return
    filterNodesRef.current.forEach((f, i) => {
      f.gain.value = (g[i] !== undefined) ? g[i] : 0
    })
  }, [])

  const gainsFromSliders = useCallback(() => {
    return sliderElsRef.current.map(s => parseFloat(s.value))
  }, [])

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

  useEffect(() => {
    applyGains(gains)
  }, [gains, applyGains])

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

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

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 500)
  }

  const popoverContent = (
    <div className="eq-popover">
      <div className="eq-popover-header">
        <span className="eq-popover-title">Equalizer</span>
        <button className="eq-popover-reset" onClick={handleReset}>Reset</button>
      </div>
      {EQ_BANDS.map((band, i) => (
        <div key={band.label} className="eq-band-row">
          <span className="eq-band-label">{band.label}</span>
          <input
            ref={el => { if (el) sliderElsRef.current[i] = el }}
            type="range"
            className="eq-band-slider"
            min={-12}
            max={12}
            step={0.5}
            value={gains[i] ?? 0}
            onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
            aria-label={`${band.label} gain`}
          />
          <span className="eq-band-value">{formatGain(gains[i] ?? 0)}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div
      ref={wrapRef}
      className={`eq-wrap ${isOpen ? 'eq-open' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isOpen && isMobile ? createPortal(
        <div ref={portalRef} className="mobile-popover-portal" style={{ bottom: portalBottom }}>{popoverContent}</div>,
        document.body
      ) : popoverContent}
      <button
        id="eq-btn"
        className={'island-icon-btn' + (isOpen ? ' eq-active' : '')}
        style={{ color: isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' }}
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
    </div>
  )
}
