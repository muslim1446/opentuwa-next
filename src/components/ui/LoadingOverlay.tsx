'use client'

import { useState, useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'

export function LoadingOverlay() {
  const { chapterTitle } = usePlayer()
  const { translate } = useI18n()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <nav id="splash-footer" className="mb-20">
        <h2 className="heroz-title-text font-display font-bold text-[clamp(34px,6vw,96px)] -tracking-[0.04em] text-[var(--text-primary)]">
          {chapterTitle}
        </h2>
      </nav>
      <div className="loader-content flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full mb-8"
          style={{
            border: '3px solid var(--glass-border)',
            borderTopColor: 'var(--text-primary)',
            animation: 'apple-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          }}
        />
        <div className="loader-text text-lg text-[var(--text-secondary)]" id="loader-text">
          {translate('loading.selectSurah')}
        </div>
        <button
          id="start-btn"
          className="start-btn mt-8 px-10 py-4 rounded-full text-[1.6rem] font-semibold cursor-pointer transition-all duration-500"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-vibrancy)',
            WebkitBackdropFilter: 'var(--glass-vibrancy)',
            border: '0.5px solid var(--glass-border)',
            boxShadow: 'var(--shadow-elevated)',
            color: 'var(--text-primary)',
          }}
          onClick={() => setVisible(false)}
        >
          {translate('player.start')}
        </button>
      </div>
    </div>
  )
}
