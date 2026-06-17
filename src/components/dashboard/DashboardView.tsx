'use client'

import { usePlayer } from '@/context/PlayerContext'
import { HeroBanner } from './HeroBanner'
import { CardScroller } from './CardScroller'
import { SearchOverlay } from './SearchOverlay'

export function DashboardView() {
  const { quranData } = usePlayer()
  const allIndices = Array.from({ length: 114 }, (_, i) => i)
  const shortRowIndices = allIndices.slice(77, 114)
  const trendingIndices = [85, 54, 104, 81, 86, 69, 56, 88, 53].map(id => id - 1)
  const combinedIndices = [...trendingIndices, ...shortRowIndices, ...allIndices]

  return (
    <div id="dashboard-view" className="active fixed inset-0 z-[2000] flex flex-col overflow-hidden animate-fade-in">
      <HeroBanner />

      <div className="row-section px-0 py-4 relative z-[5]">
        <div className="row-header ml-4 text-[22px] font-bold -tracking-[0.03em] text-[var(--text-primary)] mb-4">
          Continue Listening
        </div>
        <CardScroller indices={trendingIndices} />
      </div>

      <div className="row-section px-0 py-4 relative z-[5] pb-[100px]">
        <CardScroller indices={combinedIndices} />
      </div>

      <SearchOverlay />
    </div>
  )
}
