'use client'

import { usePlayer } from '@/context/PlayerContext'

interface SurahCardProps {
  chapterNumber: number
  englishName: string
  index: number
}

export function SurahCard({ chapterNumber, englishName, index }: SurahCardProps) {
  const { launchPlayer } = usePlayer()

  return (
    <div
      className="surah-card"
      role="button"
      tabIndex={0}
      aria-label={englishName}
      onClick={() => launchPlayer(chapterNumber, 1)}
      onKeyDown={(e) => { if (e.key === 'Enter') launchPlayer(chapterNumber, 1) }}
    >
      <div className="card-bg-num absolute top-3 right-5 text-[6.4rem] font-bold leading-none -tracking-[0.04em] opacity-30 select-none" style={{ color: 'var(--text-tertiary)' }}>
        {chapterNumber}
      </div>
      <div className="card-title text-[22px] font-semibold z-[2] whitespace-nowrap overflow-hidden text-ellipsis -tracking-[0.02em]" style={{ color: 'var(--text-primary)' }}>
        {englishName}
      </div>
    </div>
  )
}
