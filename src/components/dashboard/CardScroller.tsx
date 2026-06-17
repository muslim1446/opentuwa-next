'use client'

import { useRef, useCallback } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { SurahCard } from './SurahCard'

interface CardScrollerProps {
  indices: number[]
}

export function CardScroller({ indices }: CardScrollerProps) {
  const { quranData, launchPlayer } = usePlayer()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll('.surah-card'))
    const current = document.activeElement
    const currentIdx = cards.indexOf(current as Element)
    if (currentIdx === -1) return
    e.preventDefault()
    let nextIdx = e.key === 'ArrowRight' ? currentIdx + 1 : currentIdx - 1
    if (nextIdx >= cards.length) nextIdx = 0
    if (nextIdx < 0) nextIdx = cards.length - 1
    const nextCard = cards[nextIdx] as HTMLElement
    if (nextCard) {
      nextCard.focus({ preventScroll: true })
      nextCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [])

  return (
    <div ref={containerRef} className="card-scroller" onKeyDown={handleKeyDown}>
      {indices.map(idx => {
        const surah = quranData[idx]
        if (!surah) return null
        return (
          <SurahCard
            key={surah.chapterNumber}
            chapterNumber={surah.chapterNumber}
            englishName={surah.english_name}
            onClick={() => launchPlayer(surah.chapterNumber, 1)}
          />
        )
      })}
    </div>
  )
}
