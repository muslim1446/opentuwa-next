'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { PlayerView } from '@/components/player/PlayerView'
import { IslandSearch } from '@/components/search/IslandSearch'
import { AppBrand } from '@/components/ui/AppBrand'
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
      <AppBrand />
      {view === 'dashboard' && <DashboardView />}
      {view === 'cinema' && <PlayerView />}
      <IslandSearch />
      {!isOnline && <StatusHub />}
    </>
  )
}
