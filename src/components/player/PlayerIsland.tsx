'use client'

import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { VolumeControl } from '@/components/ui/VolumeControl'
import { TRANSLATIONS_CONFIG } from '@/lib/configs'
import { EQPopup } from './EQPopup'

export function PlayerIsland() {
  const {
    currentTrans, isPlaying, setTrans, togglePlayPause,
    nextVerse, prevVerse, shuffleChapters, loopChapter,
    toggleShuffle, toggleLoop,
    chapterTitle, currentChapterIdx, displayVerseNumber, quranData,
  } = usePlayer()
  const { translate } = useI18n()

  const transItems = Object.entries(TRANSLATIONS_CONFIG).map(([k, v]) => ({
    value: k, text: v.name,
  }))

  const chapter = quranData[currentChapterIdx]
  const chNum = chapter?.chapterNumber || 0

  return (
    <div id="player-island">
      <div className="island-left">
        <button
          className={`island-transport-btn shuffle-btn ${shuffleChapters ? 'transport-active' : ''}`}
          onClick={toggleShuffle}
          aria-label="Shuffle chapters"
          aria-pressed={shuffleChapters}
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>

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

        <button
          className={`island-transport-btn loop-btn ${loopChapter ? 'transport-active' : ''}`}
          onClick={toggleLoop}
          aria-label="Loop chapter"
          aria-pressed={loopChapter}
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>
      </div>

      <div className="island-center">
        <div className="island-artwork">
          <img
            src="https://opentuwa.com/assets/ui/favicon.svg"
            alt=""
            width="40"
            height="40"
          />
        </div>
        <div className="island-now-playing">
          <div className="island-track-title">{chapterTitle || 'Tuwa'}</div>
          <div className="island-track-subtitle">
            {chNum ? `The Quran \u2022 Verse ${displayVerseNumber}` : 'Quran Audio'}
          </div>
        </div>
      </div>

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
