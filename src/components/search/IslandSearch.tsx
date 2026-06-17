'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { useI18n } from '@/context/I18nContext'

export function IslandSearch() {
  const [query, setQuery] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isError, setIsError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { launchPlayer, quranData } = usePlayer()
  const { translate } = useI18n()

  const resetButton = useCallback(() => {
    const trigger = document.querySelector('.enter-trigger')
    const hint = trigger?.querySelector('.key-hint')
    if (trigger) trigger.classList.remove('expanded-btn')
    if (hint) {
      hint.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>`
    }
  }, [])

  const highlightChapter = useCallback((chapterNum: number) => {
    document.querySelectorAll('.surah-card').forEach(c => {
      ;(c as HTMLElement).style.transform = 'scale(1)'
      ;(c as HTMLElement).style.filter = 'none'
      ;(c as HTMLElement).style.boxShadow = 'none'
    })
    const cards = Array.from(document.querySelectorAll('.surah-card'))
    const target = cards.find(card => {
      const numDiv = card.querySelector('.card-bg-num')
      return numDiv && numDiv.textContent?.trim() === String(chapterNum)
    })
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(target as HTMLElement).style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      ;(target as HTMLElement).style.transform = 'scale(1.1)'
      ;(target as HTMLElement).style.filter = 'brightness(1.4)'
      ;(target as HTMLElement).style.boxShadow = '0 0 25px rgba(209, 209, 214, 0.6)'
      setTimeout(() => {
        ;(target as HTMLElement).style.transform = 'scale(1)'
        ;(target as HTMLElement).style.filter = 'none'
        ;(target as HTMLElement).style.boxShadow = 'none'
      }, 9500)
    }
  }, [])

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setIsThinking(true)
    setIsError(false)
    const box = document.querySelector('.island-search-box')
    box?.classList.add('ai-thinking')

    try {
      let results: number[] = []
      const num = parseInt(searchQuery)
      if (!isNaN(num) && num > 0 && num <= 114) {
        await new Promise(r => setTimeout(r, 600))
        results = [num]
      } else {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        })
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        results = data.chapters || []
      }

      if (results.length > 0) {
        highlightChapter(results[0])
        if (results.length > 1) {
          const trigger = document.querySelector('.enter-trigger')
          const hint = trigger?.querySelector('.key-hint')
          if (trigger) trigger.classList.add('expanded-btn')
          if (hint) hint.textContent = 'See more results'
        }
      } else {
        setIsError(true)
        box?.classList.add('island-error')
        setTimeout(() => box?.classList.remove('island-error'), 1000)
      }
    } catch {
      setIsError(true)
      const box = document.querySelector('.island-search-box')
      box?.classList.add('island-error')
      setTimeout(() => box?.classList.remove('island-error'), 1000)
    } finally {
      setIsThinking(false)
      box?.classList.remove('ai-thinking')
    }
  }, [highlightChapter])

  const handleInput = useCallback((value: string) => {
    setQuery(value)
    resetButton()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => executeSearch(value), 800)
  }, [executeSearch, resetButton])

  const handleTrigger = useCallback(() => {
    if (!query.trim()) return
    executeSearch(query)
  }, [query, executeSearch])

  return (
    <div id="island-search-wrapper" className="fixed bottom-[max(40px,calc(env(safe-area-inset-bottom,0px)+16px))] left-[max(16px,env(safe-area-inset-left,16px))] flex items-center gap-4 pointer-events-none z-[9999]">
      <div
        className={`island-search-box pointer-events-auto relative z-10 flex items-center px-4 py-3 w-[280px] min-h-11 rounded-full shadow-floating transition-all duration-500 ${
          isThinking ? 'ai-thinking' : ''
        } ${isError ? 'island-error' : ''}`}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-vibrancy)',
          WebkitBackdropFilter: 'var(--glass-vibrancy)',
          border: '0.5px solid var(--glass-border)',
        }}
      >
        <div className="search-icon-wrapper flex items-center mr-3" style={{ color: 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={inputRef}
          id="island-input"
          type="text"
          placeholder="Search anything"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleTrigger() }}
          className="bg-transparent border-none text-[17px] font-medium -tracking-[0.02em] w-full outline-none min-h-11"
          style={{ color: 'var(--text-primary)' }}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <button
        id="island-trigger"
        className="enter-trigger w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 pointer-events-auto cursor-pointer transition-all duration-500 z-10"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-vibrancy)',
          WebkitBackdropFilter: 'var(--glass-vibrancy)',
          border: '0.5px solid var(--glass-border)',
          boxShadow: 'var(--shadow-elevated)',
          color: 'var(--text-primary)',
        }}
        onClick={handleTrigger}
        aria-label="Execute Search"
        tabIndex={0}
      >
        <span className="key-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
          </svg>
        </span>
      </button>
    </div>
  )
}
