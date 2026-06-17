'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'
import { useMediaSession } from '@/hooks/useMediaSession'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { PlayerIsland } from './PlayerIsland'
import { RECITERS_CONFIG, TRANSLATIONS_CONFIG, TRANSLATION_AUDIO_CONFIG } from '@/lib/configs'

export function PlayerView() {
  const {
    view, quranData, currentChapterIdx, currentVerseIdx,
    currentReciter, currentTrans, currentAudioTrans,
    translationText, chapterTitle, isPlaying,
    setChapter, setVerse, setReciter, setTrans, setAudioTrans,
    nextVerse, prevVerse,
  } = usePlayer()
  const { translate } = useI18n()

  useMediaSession(chapterTitle, 'Tuwa Reader', nextVerse, prevVerse)

  const chapter = quranData[currentChapterIdx]
  const chNum = chapter?.chapterNumber || 0
  const vNum = chapter?.verses[currentVerseIdx]?.verseNumber || 0

  const chapterItems = quranData.map((c, i) => ({
    value: String(i),
    text: `${c.chapterNumber}. ${c.english_name}`,
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
    <div id="cinema-view" className={view === 'cinema' ? 'active' : ''}>
      <LoadingOverlay />

      <div className="container">
        <h1 id="chapter-title">
          {chapter?.title} ({chNum}:{vNum})
        </h1>

        <div id="content-display">
          <div id="translation-text" dir="auto">
            {verseKey ? translationText : (translate('loading.selectSurah') || 'Select a Surah...')}
          </div>
        </div>
      </div>

      <div id="selects-row">
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
