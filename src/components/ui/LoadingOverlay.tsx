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
    <div id="loading-overlay">
      <nav id="splash-footer">
        <h2 className="heroz-title-text">{chapterTitle}</h2>
      </nav>
      <div className="loader-content">
        <div className="loader-spinner" />
        <div className="loader-text" id="loader-text" style={{ color: 'var(--text-secondary)', fontSize: 17, marginTop: 8 }}>
          {translate('loading.selectSurah')}
        </div>
        <div className="splash-footer-description">
          <p>Designed for Apple Users</p>
        </div>
        <button id="start-btn" className="start-btn" onClick={() => setVisible(false)}>
          {translate('player.start')}
        </button>
      </div>
    </div>
  )
}
