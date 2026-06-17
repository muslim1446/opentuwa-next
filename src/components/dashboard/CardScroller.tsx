'use client'

import { useRef, useEffect, useCallback } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { SurahCard } from './SurahCard'
import { useI18n } from '@/context/I18nContext'

interface CardScrollerProps {
  indices: number[]
}

export function CardScroller({ indices }: CardScrollerProps) {
  const { quranData } = usePlayer()
  const { translate } = useI18n()
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
    <div
      ref={containerRef}
      className="card-scroller flex gap-4 overflow-x-auto px-4 pb-8 scroll-smooth snap-x snap-mandatory"
      onKeyDown={handleKeyDown}
      style={{
        paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {indices.map(idx => {
        const surah = quranData[idx]
        if (!surah) return null
        return (
          <SurahCard
            key={surah.chapterNumber}
            chapterNumber={surah.chapterNumber}
            englishName={surah.english_name}
            index={idx}
          />
        )
      })}
    </div>
  )
}
