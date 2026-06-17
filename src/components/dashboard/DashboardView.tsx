'use client'

import { usePlayer } from '@/context/PlayerContext'
import { HeroBanner } from './HeroBanner'
import { CardScroller } from './CardScroller'

export function DashboardView() {
  const { quranData } = usePlayer()
  const allIndices = Array.from({ length: 114 }, (_, i) => i)
  const trendingIndices = [85, 54, 104, 81, 86, 69, 56, 88, 53].map(id => id - 1)

  return (
    <>
      <HeroBanner />

      <div className="row-section row-section-hidden" id="continue-section">
        <div className="row-header" data-i18n="dashboard.continueListening">
          Continue Listening
        </div>
        <CardScroller indices={trendingIndices} />
      </div>

      <div className="row-section row-section-padding-bottom">
        <div className="row-header" />
        <CardScroller indices={allIndices} />
      </div>
    </>
  )
}
