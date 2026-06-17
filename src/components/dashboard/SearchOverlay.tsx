'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { KEYBOARD_KEYS } from '@/lib/configs'

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const { quranData, launchPlayer } = usePlayer()
  const { translate } = useI18n()
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputDisplayRef = useRef<HTMLDivElement>(null)

  const handleKeyPress = useCallback((key: string) => {
    setSearchString(prev => {
      if (key === 'SPACE') return prev + ' '
      if (key === 'DEL') return prev.slice(0, -1)
      if (key === 'CLEAR') return ''
      return prev + key
    })
  }, [])

  const filteredResults = searchString.length > 2
    ? quranData
        .map((ch, i) => ({ ...ch, idx: i }))
        .filter(ch =>
          ch.english_name.toLowerCase().includes(searchString.toLowerCase()) ||
          String(ch.chapterNumber).includes(searchString)
        )
        .map(ch => ch.chapterNumber)
    : []

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.open) setIsOpen(true)
    }
    window.addEventListener('toggle-search' as any, handler)
    return () => window.removeEventListener('toggle-search' as any, handler)
  }, [])

  return (
    <div ref={overlayRef} id="search-overlay" className={isOpen ? 'active' : ''}>
      <div className="keyboard-section">
        <div id="voice-search-btn" tabIndex={0} role="button" aria-label="Voice Search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
        </div>
        <div ref={inputDisplayRef} id="search-input-display">
          {searchString || '\u00A0'}
        </div>
        <div className="keyboard-grid" id="keyboard-grid">
          {KEYBOARD_KEYS.map(key => (
            <div
              key={key}
              className={`key ${['SPACE', 'DEL', 'CLEAR'].includes(key) ? 'wide' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={key}
              onClick={() => handleKeyPress(key)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleKeyPress(key) }}
            >
              {key === 'SPACE' ? '\u2423' : key === 'DEL' ? '\u232B' : key === 'CLEAR' ? '\u2716' : key}
            </div>
          ))}
        </div>
      </div>
      <div className="results-section">
        <div className="row-header row-header-top-results" style={{ marginLeft: 'max(16px, env(safe-area-inset-left, 16px))', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16, color: 'var(--text-primary)' }}>
          {translate('dashboard.topResults')}
        </div>
        <div id="search-results-grid" className="results-grid">
          {searchString.length <= 2 ? (
            <div className="no-results">{translate('dashboard.useKeyboard')}</div>
          ) : filteredResults.length === 0 ? (
            <div className="no-results">{translate('dashboard.searching')}</div>
          ) : (
            filteredResults.map(chNum => {
              const ch = quranData[chNum - 1]
              if (!ch) return null
              return (
                <div
                  key={chNum}
                  className="surah-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => { setIsOpen(false); launchPlayer(chNum, 1) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setIsOpen(false); launchPlayer(chNum, 1) }}}
                >
                  <div className="card-bg-num">{chNum}</div>
                  <div className="card-title">{ch.english_name}</div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
