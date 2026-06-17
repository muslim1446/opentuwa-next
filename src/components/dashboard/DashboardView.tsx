'use client'

import { usePlayer } from '@/context/PlayerContext'
import { HeroBanner } from './HeroBanner'
import { CardScroller } from './CardScroller'
import { SearchOverlay } from './SearchOverlay'

export function DashboardView() {
  const { quranData } = usePlayer()
  const allIndices = Array.from({ length: 114 }, (_, i) => i)
  const trendingIndices = [85, 54, 104, 81, 86, 69, 56, 88, 53].map(id => id - 1)

  return (
    <>
      <HeroBanner />

      <div className="row-section" id="continue-listening-row">
        <div className="row-header" style={{ marginLeft: 'max(16px, env(safe-area-inset-left, 16px))' }}>
          Continue Listening
        </div>
        <CardScroller indices={trendingIndices} />
      </div>

      <div className="row-section row-section-padding-bottom" id="all-surahs-row">
        <CardScroller indices={allIndices} />
      </div>

      <SearchOverlay />
    </>
  )
}
