'use client'

import React, {
  createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode,
} from 'react'
import { ChapterData, ViewType, TimingData } from '@/lib/types'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import {
  RECITERS_CONFIG, TRANSLATIONS_CONFIG, STORAGE_KEY,
  RTL_CODES, FTT_URL,
} from '@/lib/configs'
import { encodeStream, decodeStream, loadState, saveState, getBrowserLang } from '@/lib/stream-utils'
import { getChapterTiming } from '@/lib/timing'

interface FocusedSurah {
  chapterNum: number
  englishName: string
  description?: string
}

interface PlayerContextType {
  view: ViewType; setView: (v: ViewType) => void
  quranData: ChapterData[]; quranDataLoaded: boolean
  currentChapterIdx: number; currentVerseIdx: number
  currentReciter: string; currentTrans: string; currentAudioTrans: string
  translationText: string; chapterTitle: string
  isPlaying: boolean; isBuffering: boolean
  volume: number; isMuted: boolean; isIdle: boolean
  forbiddenVerses: Set<string>; timingData: TimingData | null
  focusedSurah: FocusedSurah | null; setFocusedSurah: (f: FocusedSurah | null) => void
  setChapter: (idx: number) => void; setVerse: (idx: number) => void
  setReciter: (id: string) => void; setTrans: (id: string) => void
  setAudioTrans: (id: string) => void
  togglePlayPause: () => void; nextVerse: () => void; prevVerse: () => void
  setVolume: (v: number) => void; toggleMute: () => void
  launchPlayer: (chapterNum: number, verseNum?: number) => void
  loadQuranData: () => Promise<void>
  startPlayback: () => void
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
  const [focusedSurah, setFocusedSurah] = useState<FocusedSurah | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const transAudioRef = useRef<HTMLAudioElement | null>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const translationCache = useRef<Record<string, Document>>({})
  const timingCache = useRef<Record<number, TimingData>>({})
  const currentLoadedChapter = useRef<number | null>(null)
  const isSeekingRef = useRef(false)
  const displayVerseRef = useRef<number | null>(null)
  const currentTransRef = useRef(currentTrans)
  useEffect(() => { currentTransRef.current = currentTrans }, [currentTrans])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = document.getElementById('audio-player') as HTMLAudioElement
      transAudioRef.current = document.getElementById('translation-audio-player') as HTMLAudioElement
    }
  }, [])

  useEffect(() => {
    loadFTT()
    restoreStateFromUrl()
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

  const restoreStateFromUrl = () => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const saved = loadState()
    const browserLang = getBrowserLang()

    let streamData = null
    if (urlParams.has('stream')) {
      streamData = decodeStream(urlParams.get('stream')!)
    }

    let ch = 0
    if (streamData) ch = streamData.chapter - 1
    else if (urlParams.has('chapter')) ch = parseInt(urlParams.get('chapter')!) - 1
    else if (saved) ch = saved.chapter
    if (isNaN(ch) || ch < 0) ch = 0
    setCurrentChapterIdx(ch)

    let rec = 'alafasy'
    if (streamData && RECITERS_CONFIG[streamData.reciter]) rec = streamData.reciter
    else if (urlParams.has('reciter') && RECITERS_CONFIG[urlParams.get('reciter')!]) rec = urlParams.get('reciter')!
    else if (saved?.reciter) rec = saved.reciter
    setCurrentReciter(rec)

    let trans = 'en'
    if (streamData) trans = streamData.trans
    else if (urlParams.has('trans')) trans = urlParams.get('trans')!
    else if (saved?.trans) trans = saved.trans
    else if (TRANSLATIONS_CONFIG[browserLang]) trans = browserLang
    if (!TRANSLATIONS_CONFIG[trans]) trans = 'en'
    setCurrentTrans(trans)

    let audTrans = 'none'
    if (streamData) audTrans = streamData.audio_trans
    else if (urlParams.has('audio_trans')) audTrans = urlParams.get('audio_trans')!
    else if (saved?.audio_trans) audTrans = saved.audio_trans
    if (!TRANSLATIONS_CONFIG[audTrans] && audTrans !== 'none') audTrans = 'none'
    setCurrentAudioTrans(audTrans)

    if (streamData) setCurrentVerseIdx(streamData.verse - 1)
    else if (urlParams.has('verse')) setCurrentVerseIdx(parseInt(urlParams.get('verse')!) - 1)
    else if (saved?.verse !== undefined) setCurrentVerseIdx(saved.verse)

    if (urlParams.has('stream') || urlParams.has('chapter')) {
      setView('cinema')
    }
  }

  const loadTranslationData = useCallback(async (id: string) => {
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
    const tid = currentTransRef.current
    const cache = translationCache.current[tid]
    if (!cache) return
    const el = document.getElementById('translation-text')
    if (el) {
      if (RTL_CODES.has(tid)) el.dir = 'rtl'; else el.dir = 'ltr'
    }
    const sura = cache.querySelector(`sura[index="${chNum}"]`)
    const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null
    setTranslationText(aya ? aya.getAttribute('text') || '' : 'Translation unavailable')
  }, [])

  const updateQuranAudio = useCallback(async (chNum: number, vNum: number, play: boolean) => {
    const audio = audioRef.current
    if (!audio) return
    const padCh = String(chNum).padStart(3, '0')
    const src = `https://hosting.opentuwa.com/${padCh}.wav`
    const timing = await getChapterTiming(chNum)
    if (!timing) return
    const verseTiming = timing.verses.find(v => v.verse === vNum)
    if (!verseTiming) return
    const targetTime = verseTiming.start_time_ms / 1000
    isSeekingRef.current = true
    if (currentLoadedChapter.current !== chNum) {
      audio.src = src
      currentLoadedChapter.current = chNum
      await new Promise<void>((resolve) => {
        let done = false
        const onMeta = () => { if (!done) { done = true; audio.removeEventListener('loadedmetadata', onMeta); resolve() } }
        const onErr = () => { if (!done) { done = true; audio.removeEventListener('error', onErr); resolve() } }
        audio.addEventListener('loadedmetadata', onMeta)
        audio.addEventListener('error', onErr)
        setTimeout(resolve, 3000)
      })
    }
    const onSeeked = () => { isSeekingRef.current = false; audio.removeEventListener('seeked', onSeeked) }
    audio.addEventListener('seeked', onSeeked)
    audio.currentTime = targetTime
    setTimeout(() => { isSeekingRef.current = false }, 500)
    if (play) {
      await audio.play().catch(() => {})
      setIsPlaying(true)
      if (typeof window !== 'undefined' && (window as any).initEQ) { (window as any).initEQ() }
    }
  }, [])

  const doSaveState = useCallback((override?: { chapterIdx?: number; verseIdx?: number }) => {
    const chIdx = override?.chapterIdx ?? currentChapterIdx
    const vIdx = override?.verseIdx ?? currentVerseIdx
    saveState({
      chapter: chIdx, verse: vIdx,
      reciter: currentReciter, trans: currentTrans, audio_trans: currentAudioTrans,
    })
    const ch = quranData[chIdx]
    if (!ch) return
    const chNum = ch.chapterNumber
    const vNum = ch.verses[vIdx]?.verseNumber || 1
    const token = encodeStream(chNum, vNum, currentReciter, currentTrans, currentAudioTrans)
    const newUrl = `?stream=${token}`
    if (typeof window !== 'undefined') window.history.replaceState({ path: newUrl, view: 'cinema' }, '', newUrl)
  }, [currentChapterIdx, currentVerseIdx, currentReciter, currentTrans, currentAudioTrans, quranData])

  const updateMediaSession = useCallback((surah: string, verse: number) => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: surah,
      artist: 'The Sight | Original Series',
      album: 'Tuwa Audio',
      artwork: [{ src: 'https://opentuwa.com/social-preview.jpg', sizes: '512x512', type: 'image/jpeg' }]
    })
  }, [])

  const bufferNextResources = useCallback((chIdx: number, vIdx: number) => {
    let nextChIdx = chIdx
    let nextVIdx = vIdx + 1
    if (nextVIdx >= (quranData[nextChIdx]?.verses?.length || 0)) {
      nextChIdx = nextChIdx + 1; nextVIdx = 0
    }
    if (nextChIdx >= quranData.length) return
    const nextCh = quranData[nextChIdx]?.chapterNumber
    if (!nextCh) return
    getChapterTiming(nextCh)
    const padCh = String(nextCh).padStart(3, '0')
    const aud = new Audio()
    aud.src = `https://hosting.opentuwa.com/${padCh}.wav`
    aud.preload = 'auto'
  }, [quranData])

  const loadVerse = useCallback(async (autoplay: boolean) => {
    const ch = quranData[currentChapterIdx]
    if (!ch) return
    const chNum = ch.chapterNumber
    const verseData = ch.verses[currentVerseIdx]
    if (!verseData) return
    const vNum = verseData.verseNumber

    const timing = await getChapterTiming(chNum)
    setTimingData(timing)
    if (!timing) return
    timingCache.current[chNum] = timing

    setChapterTitle(ch.english_name)
    const splashTitle = document.getElementById('doors-hero-title')
    if (splashTitle) splashTitle.textContent = ch.english_name
    const titleEl = document.getElementById('chapter-title')
    if (titleEl) titleEl.innerHTML = `${ch.title} <span class="chapter-subtitle">(${chNum}:${vNum})</span>`

    const verseKey = `${chNum}-${vNum}`
    const isForbidden = forbiddenVerses.has(verseKey)
    const trans = currentTransRef.current
    if (trans && !translationCache.current[trans]) await loadTranslationData(trans)

    if (!isForbidden) updateTranslationText(chNum, vNum)
    else { setTranslationText(''); const te = document.getElementById('translation-text'); if (te) te.textContent = '' }
    await updateQuranAudio(chNum, vNum, autoplay)
    doSaveState()
    updateMediaSession(ch.english_name, vNum)
    bufferNextResources(currentChapterIdx, currentVerseIdx)
  }, [quranData, currentChapterIdx, currentVerseIdx, currentReciter, forbiddenVerses, loadTranslationData, updateTranslationText, updateQuranAudio, doSaveState, bufferNextResources, updateMediaSession])

  const loadQuranData = useCallback(async () => {
    try {
      const res = await fetch('https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/2TM3TM.json')
      if (!res.ok) throw new Error('Failed to load Quran JSON')
      const jsonData = await res.json()
      const merged = jsonData.chapters.map((ch: any) => {
        const meta = SURAH_METADATA.find(m => m.chapter === ch.chapterNumber)
        return meta ? { ...ch, english_name: meta.english_name, description: meta.description } : ch
      })
      setQuranData(merged)
      setQuranDataLoaded(true)
    } catch (e) {
      console.error('Failed to load Quran data:', e)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) { audio.play().catch(() => {}); setIsPlaying(true) }
    else { audio.pause(); setIsPlaying(false) }
  }, [])

  const goToNextChapter = useCallback(() => {
    if (currentChapterIdx + 1 < quranData.length) {
      setCurrentChapterIdx(currentChapterIdx + 1)
    } else {
      setCurrentChapterIdx(0)
    }
    setCurrentVerseIdx(0)
  }, [quranData, currentChapterIdx])

  const nextVerse = useCallback(() => {
    const ch = quranData[currentChapterIdx]
    if (!ch) return
    if (currentVerseIdx + 1 < ch.verses.length) setCurrentVerseIdx(currentVerseIdx + 1)
    else goToNextChapter()
  }, [quranData, currentChapterIdx, currentVerseIdx, goToNextChapter])

  const prevVerse = useCallback(() => {
    if (currentVerseIdx > 0) setCurrentVerseIdx(currentVerseIdx - 1)
    else if (currentChapterIdx > 0) { setCurrentChapterIdx(currentChapterIdx - 1); const p = quranData[currentChapterIdx - 1]; if (p) setCurrentVerseIdx(p.verses.length - 1) }
  }, [quranData, currentChapterIdx, currentVerseIdx])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) { audioRef.current.volume = v; if (v > 0 && audioRef.current.muted) { audioRef.current.muted = false; setIsMuted(false) } }
  }, [])

  const toggleMute = useCallback(() => {
    if (audioRef.current) { audioRef.current.muted = !audioRef.current.muted; setIsMuted(audioRef.current.muted) }
  }, [])

  const launchPlayer = useCallback((chapterNum: number, verseNum = 1) => {
    setCurrentChapterIdx(chapterNum - 1)
    setCurrentVerseIdx(verseNum - 1)
    setView('cinema')
    const token = encodeStream(chapterNum, verseNum, currentReciter, currentTrans, currentAudioTrans)
    if (typeof window !== 'undefined') window.history.pushState({ view: 'cinema', stream: token }, '', `?stream=${token}`)
  }, [currentReciter, currentTrans, currentAudioTrans])

  const startPlayback = useCallback(() => {
    const overlay = document.getElementById('loading-overlay')
    if (overlay) { overlay.style.opacity = '0'; setTimeout(() => { overlay.style.display = 'none' }, 500) }
    loadVerse(true)
  }, [loadVerse])

  // timeupdate: UI-only verse display update (no seek) — matches app.js lines 1412-1453
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => {
      if (isSeekingRef.current) return
      const chIdx = currentChapterIdx
      const ch = quranData[chIdx]
      if (!ch) return
      const chNum = ch.chapterNumber
      const tData = timingCache.current[chNum]
      if (!tData) return
      const currentMs = audio.currentTime * 1000
      const match = tData.verses.find(v => currentMs >= v.start_time_ms && currentMs < v.end_time_ms)
      if (!match) return
      if (match.verse === displayVerseRef.current) return
      displayVerseRef.current = match.verse
      const te = document.getElementById('chapter-title')
      if (te) te.innerHTML = `${ch.title} <span class="chapter-subtitle">(${chNum}:${match.verse})</span>`
      const key = `${chNum}-${match.verse}`
      const forbidden = forbiddenVerses.has(key)
      const tt = document.getElementById('translation-text')
      if (forbidden) {
        if (tt) tt.textContent = ''
      } else {
        const tid = currentTrans
        const cache = translationCache.current[tid]
        if (cache && tt) {
          if (RTL_CODES.has(tid)) tt.dir = 'rtl'; else tt.dir = 'ltr'
          const sura = cache.querySelector(`sura[index="${chNum}"]`)
          const aya = sura ? sura.querySelector(`aya[index="${match.verse}"]`) : null
          tt.textContent = aya ? aya.getAttribute('text') : ''
        }
      }
      const vIdx = ch.verses.findIndex(v => v.verseNumber === match.verse)
      doSaveState({ chapterIdx: chIdx, verseIdx: vIdx >= 0 ? vIdx : 0 })
      updateMediaSession(ch.english_name, match.verse)
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    return () => audio.removeEventListener('timeupdate', onTimeUpdate)
  }, [currentChapterIdx, currentTrans, quranData, forbiddenVerses, doSaveState, updateMediaSession])

  // audio ended -> next chapter (or loop 114 -> 1)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const ended = () => goToNextChapter()
    audio.addEventListener('ended', ended)
    return () => audio.removeEventListener('ended', ended)
  }, [goToNextChapter])

  // sync play/pause state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => { audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause) }
  }, [])

  // idle timer
  useEffect(() => {
    const handler = () => {
      setIsIdle(false)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => setIsIdle(true), 4000)
    }
    const evts = ['mousemove', 'touchstart', 'click', 'keydown']
    evts.forEach(e => window.addEventListener(e, handler))
    return () => evts.forEach(e => window.removeEventListener(e, handler))
  }, [])

  // auto-load verse when chapter/verse/reciter/audio-trans changes
  useEffect(() => {
    if (quranDataLoaded && view === 'cinema') {
      loadTranslationData(currentTransRef.current)
      loadVerse(true)
    }
  }, [currentChapterIdx, currentVerseIdx, currentReciter, currentAudioTrans,
      quranDataLoaded, view, loadVerse, loadTranslationData])

  // translation-only change — update text without seeking audio
  useEffect(() => {
    if (!quranDataLoaded || view !== 'cinema') return
    loadTranslationData(currentTrans)
    const ch = quranData[currentChapterIdx]
    if (!ch) return
    const chNum = ch.chapterNumber
    const vNum = displayVerseRef.current || ch.verses[currentVerseIdx]?.verseNumber || 1
    const key = `${chNum}-${vNum}`
    const tt = document.getElementById('translation-text')
    if (forbiddenVerses.has(key)) {
      if (tt) tt.textContent = ''
    } else {
      const cache = translationCache.current[currentTrans]
      if (cache && tt) {
        if (RTL_CODES.has(currentTrans)) tt.dir = 'rtl'; else tt.dir = 'ltr'
        const sura = cache.querySelector(`sura[index="${chNum}"]`)
        const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null
        tt.textContent = aya ? aya.getAttribute('text') : ''
      }
    }
  }, [currentTrans, quranDataLoaded, view])

  // vh on resize
  useEffect(() => {
    const setVh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])

  return (
    <PlayerContext.Provider value={{
      view, setView,
      quranData, quranDataLoaded,
      currentChapterIdx, currentVerseIdx,
      currentReciter, currentTrans, currentAudioTrans,
      translationText, chapterTitle,
      isPlaying, isBuffering, volume, isMuted, isIdle,
      forbiddenVerses, timingData,
      focusedSurah, setFocusedSurah,
      setChapter: setCurrentChapterIdx, setVerse: setCurrentVerseIdx,
      setReciter: setCurrentReciter, setTrans: setCurrentTrans, setAudioTrans: setCurrentAudioTrans,
      togglePlayPause, nextVerse, prevVerse,
      setVolume, toggleMute, launchPlayer, loadQuranData, startPlayback,
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
