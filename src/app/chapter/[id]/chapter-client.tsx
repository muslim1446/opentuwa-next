'use client'

import { useEffect, useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import HomeClient from '@/app/home-client'

export function ChapterClient({ chapterId }: { chapterId: number }) {
  const { quranDataLoaded, loadQuranData, launchPlayer, view } = usePlayer()
  const launchedRef = useRef(false)

  useEffect(() => {
    if (chapterId < 1 || chapterId > 114) return
    if (!quranDataLoaded) {
      loadQuranData()
      return
    }
    if (launchedRef.current) return
    launchedRef.current = true
    launchPlayer(chapterId, 1)
  }, [chapterId, quranDataLoaded, loadQuranData, launchPlayer])

  // If user navigates back to dashboard, re-launch not needed
  useEffect(() => {
    if (view === 'dashboard') launchedRef.current = false
  }, [view])

  return <HomeClient />
}
