'use client'

import { useEffect, useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'

export function HeroBanner() {
  const { quranData, launchPlayer } = usePlayer()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewSeqRef = useRef<number[]>([])
  const previewIdxRef = useRef(0)

  const schedulePreview = (chapterNum: number) => {
    if (!quranData[chapterNum - 1]) return
    const surah = quranData[chapterNum - 1]
    const heroTitle = surah.english_name

    const doorHero = document.getElementById('door-hero-title')
    if (doorHero) doorHero.textContent = heroTitle

    const doorHeroSub = document.getElementById('door-hero-subtitle')
    if (doorHeroSub) doorHeroSub.textContent = surah.title
  }

  return (
    <div
      className="hero-banner h-[55vh] w-full relative flex flex-col justify-center px-4 flex-shrink-0 overflow-hidden"
      style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))', paddingRight: 'max(16px, env(safe-area-inset-right, 16px))' }}
    >
      <div
        className="hero-shadow-overlay absolute inset-0 z-[2]"
        style={{ background: 'linear-gradient(to right, var(--bg) 0%, transparent 60%)' }}
      />
      <div className="hero-content max-w-[700px] z-[5] relative mt-[4vh]">
        <h1
          id="door-hero-title"
          className="hero-title-text font-display font-bold text-[clamp(34px,6vw,96px)] leading-[1.05] mb-4 -tracking-[0.04em] text-[var(--text-primary)]"
          style={{ textShadow: 'var(--shadow-soft)' }}
        >
          Tuwa
        </h1>
        <div
          id="door-hero-subtitle"
          className="hero-subtitle hidden text-[22px] font-medium mb-4 -tracking-[0.01em] text-[var(--text-secondary)]"
        />
      </div>
    </div>
  )
}
