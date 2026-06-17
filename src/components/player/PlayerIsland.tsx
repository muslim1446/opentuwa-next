'use client'

import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { VolumeControl } from '@/components/ui/VolumeControl'
import { TRANSLATIONS_CONFIG } from '@/lib/configs'
import { EQPopup } from './EQPopup'

export function PlayerIsland() {
  const { currentTrans, isPlaying, setTrans, togglePlayPause } = usePlayer()
  const { translate } = useI18n()

  const transItems = Object.entries(TRANSLATIONS_CONFIG).map(([k, v]) => ({
    value: k, text: v.name,
  }))

  return (
    <div
      id="player-island"
      className="fixed bottom-[max(40px,calc(env(safe-area-inset-bottom,0px)+16px))] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-[40px] select-none transition-all duration-500"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-vibrancy)',
        WebkitBackdropFilter: 'var(--glass-vibrancy)',
        border: '0.5px solid var(--glass-border)',
        boxShadow: 'var(--shadow-floating)',
      }}
    >
      <div className="island-left flex items-center gap-2">
        <a href="/" className="app-brand relative top-auto left-auto transform-none z-auto h-11 px-1 gap-1.5 flex items-center no-underline flex-shrink-0" aria-label="Tuwa Home">
          <span className="brand-icon">
            <img src="https://opentuwa.com/assets/ui/favicon.svg" alt="" width={22} height={22} className="block" />
          </span>
          <span className="brand-text text-[15px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>Tuwa</span>
        </a>
        <CustomSelect
          items={transItems}
          value={currentTrans}
          onChange={setTrans}
          placeholder={translate('player.translation')}
          wrapperId="translationSelectWrapper"
        />
      </div>

      <button
        id="play-pause-btn"
        className="island-play-btn w-11 h-11 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 border-none transition-all duration-200"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--text-primary)' }}
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        tabIndex={0}
      >
        {isPlaying ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div className="island-right flex items-center gap-2">
        <VolumeControl />
        <EQPopup />
      </div>
    </div>
  )
}
