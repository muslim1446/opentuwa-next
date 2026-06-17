'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { KEYBOARD_KEYS } from '@/lib/configs'

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [results, setResults] = useState<number[]>([])
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

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      id="search-overlay"
      className="active fixed inset-0 z-[2500] grid grid-cols-[320px_1fr]"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-vibrancy)',
        WebkitBackdropFilter: 'var(--glass-vibrancy)',
      }}
    >
      <div
        className="keyboard-section p-8 flex flex-col overflow-y-auto"
        style={{
          background: 'var(--surface)',
          borderRight: '0.5px solid var(--glass-border)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div
          ref={inputDisplayRef}
          id="search-input-display"
          className="mb-4 px-4 py-3 text-[17px] font-medium rounded-xl min-h-11 flex items-center border"
          style={{
            background: 'var(--surface-secondary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--glass-border)',
          }}
        >
          {searchString || '\u00A0'}
        </div>
        <div className="keyboard-grid grid grid-cols-6 gap-2">
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
      <div className="results-section p-8 overflow-y-auto">
        <div className="row-header row-header-top-results text-[22px] font-bold -tracking-[0.03em] mb-4" style={{ color: 'var(--text-primary)' }}>
          {translate('dashboard.topResults')}
        </div>
        <div
          id="search-results-grid"
          className="results-grid grid gap-4 pb-20"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
        >
          {searchString.length <= 2 ? (
            <div className="no-results col-span-full text-center mt-10 text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {translate('dashboard.useKeyboard')}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="no-results col-span-full text-center mt-10 text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {translate('dashboard.searching')}
            </div>
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
                  <div className="card-bg-num absolute top-3 right-5 text-[6.4rem] font-bold leading-none -tracking-[0.04em] opacity-30" style={{ color: 'var(--text-tertiary)' }}>
                    {chNum}
                  </div>
                  <div className="card-title text-[22px] font-semibold z-[2] whitespace-nowrap overflow-hidden text-ellipsis -tracking-[0.02em]" style={{ color: 'var(--text-primary)' }}>
                    {ch.english_name}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
