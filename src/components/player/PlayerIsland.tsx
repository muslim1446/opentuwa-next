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
    <div id="player-island">
      <div className="island-left">
        <a href="/" className="app-brand" aria-label="Tuwa Home">
          <span className="brand-icon">
            <img src="https://muslim.opentuwa.com/assets/ui/favicon.svg" alt="" width="44" height="44" />
          </span>
          <span className="brand-text">Tuwa</span>
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
        className="island-play-btn"
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

      <div className="island-right">
        <VolumeControl />
        <EQPopup />
      </div>
    </div>
  )
}
