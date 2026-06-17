'use client'

import { usePlayer } from '@/context/PlayerContext'
import { useMediaSession } from '@/hooks/useMediaSession'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { PlayerIsland } from './PlayerIsland'

export function PlayerView() {
  const {
    view, quranData, currentChapterIdx, currentVerseIdx,
    translationText, chapterTitle,
    nextVerse, prevVerse, startPlayback,
  } = usePlayer()

  useMediaSession(chapterTitle, 'Tuwa Reader', nextVerse, prevVerse)

  const chapter = quranData[currentChapterIdx]
  const chNum = chapter?.chapterNumber || 0
  const vNum = chapter?.verses[currentVerseIdx]?.verseNumber || 0
  const verseKey = `${chNum}-${vNum}`

  return (
    <div id="cinema-view" className={view === 'cinema' ? 'active' : ''}>
      <LoadingOverlay onStart={startPlayback} />

      <div className="container">
        <audio id="audio-player" crossOrigin="anonymous" />
        <audio id="translation-audio-player" crossOrigin="anonymous" />
        <h1 id="chapter-title">
          {chapter?.title} ({chNum}:{vNum})
        </h1>

        <div id="content-display">
          <div id="translation-text" dir="auto">
            {verseKey ? translationText : 'Select a Surah...'}
          </div>
        </div>
      </div>

      <PlayerIsland />
    </div>
  )
}
