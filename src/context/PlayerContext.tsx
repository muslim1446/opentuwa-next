'use client'

import React, {
  createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode,
} from 'react'
import { ChapterData, ViewType, PlayerState, TimingData } from '@/lib/types'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import {
  RECITERS_CONFIG, TRANSLATIONS_CONFIG, STORAGE_KEY,
  RTL_CODES, FTT_URL,
} from '@/lib/configs'
import { encodeStream, decodeStream, loadState, saveState, getBrowserLang } from '@/lib/stream-utils'
import { getChapterTiming } from '@/lib/timing'

interface PlayerContextType {
  view: ViewType
  setView: (v: ViewType) => void
  quranData: ChapterData[]
  quranDataLoaded: boolean
  currentChapterIdx: number
  currentVerseIdx: number
  currentReciter: string
  currentTrans: string
  currentAudioTrans: string
  translationText: string
  chapterTitle: string
  isPlaying: boolean
  isBuffering: boolean
  volume: number
  isMuted: boolean
  isIdle: boolean
  forbiddenVerses: Set<string>
  timingData: TimingData | null

  setChapter: (idx: number) => void
  setVerse: (idx: number) => void
  setReciter: (id: string) => void
  setTrans: (id: string) => void
  setAudioTrans: (id: string) => void
  togglePlayPause: () => void
  nextVerse: () => void
  prevVerse: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  launchPlayer: (chapterNum: number, verseNum?: number) => void
  loadQuranData: () => Promise<void>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>('dashboard')
  const [quranData, setQuranData] = useState<ChapterData[]>([])
  const [quranDataLoaded, setQuranDataLoaded] = useState(false)
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0)
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0)
  const [currentReciter, setCurrentReciter] = useState('alafasy')
  const [currentTrans, setCurrentTrans] = useState('en')
  const [currentAudioTrans, setCurrentAudioTrans] = useState('none')
  const [translationText, setTranslationText] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const [forbiddenVerses, setForbiddenVerses] = useState<Set<string>>(new Set())
  const [timingData, setTimingData] = useState<TimingData | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const transAudioRef = useRef<HTMLAudioElement | null>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const translationCache = useRef<Record<string, Document>>({})
  const timingCache = useRef<Record<number, TimingData>>({})
  const currentLoadedChapter = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = document.getElementById('audio-player') as HTMLAudioElement
      transAudioRef.current = document.getElementById('translation-audio-player') as HTMLAudioElement
    }
  }, [])

  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => setIsIdle(true), 4000)
    }
    const events = ['mousemove', 'touchstart', 'click', 'keydown']
    events.forEach(e => window.addEventListener(e, handleActivity))
    return () => events.forEach(e => window.removeEventListener(e, handleActivity))
  }, [])

  useEffect(() => {
    loadFTT()
  }, [])

  const loadFTT = async () => {
    try {
      const res = await fetch(FTT_URL)
      if (res.ok) {
        const text = await res.text()
        const doc = new DOMParser().parseFromString(text, 'application/xml')
        const verses = doc.querySelectorAll('Verse')
        const set = new Set<string>()
        verses.forEach(v => {
          const c = v.getAttribute('chapter')?.trim()
          const n = v.getAttribute('number')?.trim()
          if (c && n) set.add(`${c}-${n}`)
        })
        setForbiddenVerses(set)
      }
    } catch {}
  }

  const loadQuranData = useCallback(async () => {
    try {
      const res = await fetch('https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/2TM3TM.json')
      if (!res.ok) throw new Error('Failed to load Quran JSON')
      const jsonData = await res.json()
      const merged = jsonData.chapters.map((ch: any, idx: number) => {
        const meta = SURAH_METADATA.find(m => m.chapter === ch.chapterNumber)
        return meta ? { ...ch, english_name: meta.english_name, description: meta.description } : ch
      })
      setQuranData(merged)
      setQuranDataLoaded(true)

      const saved = loadState()
      if (saved) {
        setCurrentChapterIdx(saved.chapter)
        setCurrentVerseIdx(saved.verse)
        setCurrentReciter(saved.reciter)
        setCurrentTrans(saved.trans)
        setCurrentAudioTrans(saved.audio_trans)
      }
    } catch (e) {
      console.error('Failed to load Quran data:', e)
    }
  }, [])

  const loadTranslation = useCallback(async (id: string) => {
    if (translationCache.current[id]) return
    if (!TRANSLATIONS_CONFIG[id]) return
    try {
      setIsBuffering(true)
      const res = await fetch(TRANSLATIONS_CONFIG[id].url)
      if (res.ok) {
        const text = await res.text()
        translationCache.current[id] = new DOMParser().parseFromString(text, 'application/xml')
      }
    } catch {} finally {
      setIsBuffering(false)
    }
  }, [])

  const updateTranslationText = useCallback((chNum: number, vNum: number) => {
    const tid = currentTrans
    const cache = translationCache.current[tid]
    if (!cache) return
    const sura = cache.querySelector(`sura[index="${chNum}"]`)
    const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null
    if (aya) {
      setTranslationText(aya.getAttribute('text') || '')
    } else {
      setTranslationText('Translation unavailable')
    }
  }, [currentTrans])

  const loadVerse = useCallback(async (autoplay: boolean) => {
    const ch = quranData[currentChapterIdx]
    if (!ch) return
    const chNum = ch.chapterNumber
    const verseData = ch.verses[currentVerseIdx]
    if (!verseData) return
    const vNum = verseData.verseNumber

    setChapterTitle(ch.english_name)

    const timing = await getChapterTiming(chNum)
    setTimingData(timing)
    if (!timing) return

    const verseKey = `${chNum}-${vNum}`
    const isForbidden = forbiddenVerses.has(verseKey)

    if (currentTrans && !translationCache.current[currentTrans]) {
      await loadTranslation(currentTrans)
    }

    if (!isForbidden) {
      updateTranslationText(chNum, vNum)
    } else {
      setTranslationText('')
    }

    await updateAudio(chNum, vNum, autoplay)
    saveState({
      chapter: currentChapterIdx,
      verse: currentVerseIdx,
      reciter: currentReciter,
      trans: currentTrans,
      audio_trans: currentAudioTrans,
    })
  }, [quranData, currentChapterIdx, currentVerseIdx, currentReciter, currentTrans, currentAudioTrans, forbiddenVerses, loadTranslation, updateTranslationText])

  const updateAudio = useCallback(async (chNum: number, vNum: number, play: boolean) => {
    const audio = audioRef.current
    if (!audio) return
    const padCh = String(chNum).padStart(3, '0')
    const src = `https://hosting.opentuwa.com/${padCh}.wav`
    const timing = await getChapterTiming(chNum)
    if (!timing) return
    const verseTiming = timing.verses.find(v => v.verse === vNum)
    if (!verseTiming) return

    if (currentLoadedChapter.current !== chNum) {
      audio.src = src
      currentLoadedChapter.current = chNum
      await new Promise<void>((resolve) => {
        const onMeta = () => { audio.removeEventListener('loadedmetadata', onMeta); resolve() }
        audio.addEventListener('loadedmetadata', onMeta)
        setTimeout(resolve, 3000)
      })
    }

    audio.currentTime = verseTiming.start_time_ms / 1000
    if (play) {
      await audio.play().catch(() => {})
      setIsPlaying(true)
      if (typeof window !== 'undefined' && (window as any).initEQ) {
        ;(window as any).initEQ()
      }
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  const nextVerse = useCallback(() => {
    const ch = quranData[currentChapterIdx]
    if (!ch) return
    if (currentVerseIdx + 1 < ch.verses.length) {
      setCurrentVerseIdx(currentVerseIdx + 1)
    } else if (currentChapterIdx + 1 < quranData.length) {
      setCurrentChapterIdx(currentChapterIdx + 1)
      setCurrentVerseIdx(0)
    }
  }, [quranData, currentChapterIdx, currentVerseIdx])

  const prevVerse = useCallback(() => {
    if (currentVerseIdx > 0) {
      setCurrentVerseIdx(currentVerseIdx - 1)
    } else if (currentChapterIdx > 0) {
      setCurrentChapterIdx(currentChapterIdx - 1)
      const prevCh = quranData[currentChapterIdx - 1]
      if (prevCh) setCurrentVerseIdx(prevCh.verses.length - 1)
    }
  }, [quranData, currentChapterIdx, currentVerseIdx])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) {
      audioRef.current.volume = v
      if (v > 0 && audioRef.current.muted) {
        audioRef.current.muted = false
        setIsMuted(false)
      }
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(audioRef.current.muted)
    }
  }, [])

  const launchPlayer = useCallback((chapterNum: number, verseNum = 1) => {
    const chIdx = chapterNum - 1
    setCurrentChapterIdx(chIdx)
    setCurrentVerseIdx(verseNum - 1)
    setView('cinema')
    const streamToken = encodeStream(chapterNum, verseNum, currentReciter, currentTrans, currentAudioTrans)
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'cinema', stream: streamToken }, '', `?stream=${streamToken}`)
    }
  }, [currentReciter, currentTrans, currentAudioTrans])

  useEffect(() => {
    if (quranDataLoaded && view === 'cinema') {
      loadTranslation(currentTrans)
      loadVerse(true)
    }
  }, [currentChapterIdx, currentVerseIdx, currentReciter, currentTrans, currentAudioTrans])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => nextVerse()
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [nextVerse])

  return (
    <PlayerContext.Provider value={{
      view, setView,
      quranData, quranDataLoaded,
      currentChapterIdx, currentVerseIdx,
      currentReciter, currentTrans, currentAudioTrans,
      translationText, chapterTitle,
      isPlaying, isBuffering, volume, isMuted, isIdle,
      forbiddenVerses, timingData,
      setChapter: setCurrentChapterIdx,
      setVerse: setCurrentVerseIdx,
      setReciter: setCurrentReciter,
      setTrans: setCurrentTrans,
      setAudioTrans: setCurrentAudioTrans,
      togglePlayPause, nextVerse, prevVerse,
      setVolume, toggleMute, launchPlayer, loadQuranData,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider')
  return ctx
}
