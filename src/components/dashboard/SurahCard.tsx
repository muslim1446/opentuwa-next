'use client'

interface SurahCardProps {
  chapterNumber: number
  englishName: string
  onClick: () => void
}

export function SurahCard({ chapterNumber, englishName, onClick }: SurahCardProps) {
  return (
    <div
      className="surah-card"
      role="button"
      tabIndex={0}
      aria-label={englishName}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <div className="card-bg-num">
        {chapterNumber}
      </div>
      <div className="card-title">
        {englishName}
      </div>
    </div>
  )
}
