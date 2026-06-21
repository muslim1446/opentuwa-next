'use client'

interface SurahCardProps {
  chapterNumber: number
  englishName: string
  description?: string
  onClick: () => void
  onFocus?: () => void
}

export function SurahCard({ chapterNumber, englishName, description, onClick, onFocus }: SurahCardProps) {
  return (
    <div
      className="surah-card squircle-surface"
      role="button"
      tabIndex={0}
      aria-label={englishName}
      onClick={onClick}
      onFocus={onFocus}
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
