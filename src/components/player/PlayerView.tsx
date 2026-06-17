'use client'

import { useEffect, useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { useMediaSession } from '@/hooks/useMediaSession'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { PlayerIsland } from './PlayerIsland'
import { RECITERS_CONFIG, TRANSLATIONS_CONFIG, TRANSLATION_AUDIO_CONFIG } from '@/lib/configs'

export function PlayerView() {
  const {
    quranData, currentChapterIdx, currentVerseIdx,
    currentReciter, currentTrans, currentAudioTrans,
    translationText, chapterTitle, isPlaying,
    setChapter, setVerse, setReciter, setTrans, setAudioTrans,
    nextVerse, prevVerse, timingData,
  } = usePlayer()
  const { translate } = useI18n()

  useMediaSession(chapterTitle, 'Tuwa Reader', nextVerse, prevVerse)

  const chapter = quranData[currentChapterIdx]
  const chNum = chapter?.chapterNumber || 0
  const verseData = chapter?.verses[currentVerseIdx]
  const vNum = verseData?.verseNumber || 0

  const chapterItems = quranData.map((c, i) => ({
    value: String(i),
    text: `${c.chapterNumber}. ${c.english_name} - ${c.title || ''}`,
  }))

  const verseItems = chapter
    ? chapter.verses.map((v, i) => ({ value: String(i), text: String(v.verseNumber) }))
    : []

  const reciterItems = Object.entries(RECITERS_CONFIG).map(([k, v]) => ({
    value: k, text: v.name,
  }))

  const transItems = Object.entries(TRANSLATIONS_CONFIG).map(([k, v]) => ({
    value: k, text: v.name,
  }))

  const audioTransItems = Object.entries(TRANSLATION_AUDIO_CONFIG).map(([k, v]) => ({
    value: k,
    text: k === 'none' ? translate('player.noAudioTranslation') : v.name,
  }))

  const verseKey = `${chNum}-${vNum}`

  return (
    <div id="cinema-view" className="active absolute inset-0 flex flex-col z-[1000] animate-fade-in" style={{ backgroundColor: 'var(--bg)' }}>
      <LoadingOverlay />

      <div className="container flex-1 flex flex-col items-center justify-center px-8 pb-[120px] relative z-[1]">
        <h1
          id="chapter-title"
          className="fixed top-[max(40px,env(safe-area-inset-top,40px))] left-[max(16px,env(safe-area-inset-left,16px))] z-[100] font-bold text-2xl -tracking-[0.04em] transition-all duration-500"
          style={{ color: 'var(--text-primary)' }}
        >
          {chapter?.title} <span className="chapter-subtitle">({chNum}:{vNum})</span>
        </h1>

        <div
          id="content-display"
          className="flex flex-col items-center justify-center flex-1 w-full"
        >
          <div
            id="translation-text"
            className="text-center text-[17px] leading-relaxed font-medium -tracking-[0.02em] px-4 transition-opacity duration-400"
            style={{ color: 'var(--text-primary)' }}
            dir="auto"
          >
            {verseKey ? translationText : (translate('loading.selectSurah') || 'Select a Surah...')}
          </div>
        </div>
      </div>

      <div
        id="selects-row"
        className="flex justify-center items-center gap-2 px-4 py-2 flex-wrap transition-all duration-500"
      >
        <CustomSelect
          items={chapterItems}
          value={String(currentChapterIdx)}
          onChange={(v) => setChapter(parseInt(v))}
          placeholder={translate('player.selectSurahButton')}
          wrapperId="chapterSelectWrapper"
        />
        <CustomSelect
          items={verseItems}
          value={String(currentVerseIdx)}
          onChange={(v) => setVerse(parseInt(v))}
          placeholder={translate('player.ayah')}
          wrapperId="verseSelectWrapper"
        />
        <CustomSelect
          items={reciterItems}
          value={currentReciter}
          onChange={setReciter}
          placeholder={translate('player.reciter')}
          wrapperId="reciterSelectWrapper"
        />
        <CustomSelect
          items={audioTransItems}
          value={currentAudioTrans}
          onChange={setAudioTrans}
          placeholder={translate('player.audioTrans')}
          wrapperId="translationAudioSelectWrapper"
        />
      </div>

      <PlayerIsland />

      <audio id="audio-player" crossOrigin="anonymous" />
      <audio id="translation-audio-player" crossOrigin="anonymous" />
      <audio id="preview-audio" crossOrigin="anonymous" />
    </div>
  )
}
