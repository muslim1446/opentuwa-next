'use client'

import { SurahCard } from '@/components/dashboard/SurahCard'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'

interface SearchResultsProps {
  results: number[]
  hasQuery: boolean
}

export function SearchResults({ results, hasQuery }: SearchResultsProps) {
  const { quranData } = usePlayer()
  const { translate } = useI18n()

  if (!hasQuery) {
    return (
      <div className="no-results col-span-full text-center mt-10 text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {translate('dashboard.useKeyboard')}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="no-results col-span-full text-center mt-10 text-[17px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {translate('dashboard.searching')}
      </div>
    )
  }

  return (
    <>
      {results.map(chNum => {
        const ch = quranData[chNum - 1]
        if (!ch) return null
        return (
          <SurahCard
            key={chNum}
            chapterNumber={ch.chapterNumber}
            englishName={ch.english_name}
            index={chNum - 1}
          />
        )
      })}
    </>
  )
}
