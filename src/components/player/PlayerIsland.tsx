'use client'

import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { VolumeControl } from '@/components/ui/VolumeControl'
import { TRANSLATIONS_CONFIG } from '@/lib/configs'
import { EQPopup } from './EQPopup'

export function PlayerIsland() {
  const { currentTrans, isPlaying, setTrans, togglePlayPause, nextVerse, prevVerse } = usePlayer()
  const { translate } = useI18n()

  const transItems = Object.entries(TRANSLATIONS_CONFIG).map(([k, v]) => ({
    value: k, text: v.name,
  }))

  return (
    <div id="player-island">
      <div className="island-left">
        <button
          className="island-transport-btn"
          onClick={prevVerse}
          aria-label="Previous verse"
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          id="play-pause-btn"
          className="island-play-btn"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          tabIndex={0}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <button
          className="island-transport-btn"
          onClick={nextVerse}
          aria-label="Next verse"
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <a href="/" className="island-brand" aria-label="Tuwa Home">
        <img src="https://opentuwa.com/assets/ui/favicon.svg" alt="Tuwa" width="28" height="28" />
      </a>

      <div className="island-right">
        <CustomSelect
          items={transItems}
          value={currentTrans}
          onChange={setTrans}
          placeholder={translate('player.translation')}
          wrapperId="translationSelectWrapper"
        />
        <VolumeControl />
        <EQPopup />
      </div>
    </div>
  )
}
