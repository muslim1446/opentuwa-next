'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { PlayerView } from '@/components/player/PlayerView'
import { IslandSearch } from '@/components/search/IslandSearch'
import { SearchOverlay } from '@/components/dashboard/SearchOverlay'
import { StatusHub } from '@/components/ui/StatusHub'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function Home() {
  const { view, loadQuranData, quranDataLoaded } = usePlayer()
  const isOnline = useOnlineStatus()

  useKeyboardNav()

  useEffect(() => {
    if (!quranDataLoaded) loadQuranData()
  }, [quranDataLoaded, loadQuranData])

  return (
    <>
      {view !== 'cinema' && <IslandSearch />}
      {view !== 'cinema' && <SearchOverlay />}
      <div id="dashboard-view" className={view === 'dashboard' ? 'active' : ''}>
        <DashboardView />
      </div>
      <audio id="preview-audio" crossOrigin="anonymous" />
      <PlayerView />
      {!isOnline && <StatusHub />}
    </>
  )
}
