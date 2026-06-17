'use client'

import { useState, useRef, useCallback } from 'react'
import { usePlayer } from '@/context/PlayerContext'

export function IslandSearch() {
  const [query, setQuery] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isError, setIsError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { quranData } = usePlayer()

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
      const el = c as HTMLElement
      el.style.transform = ''
      el.style.filter = ''
      el.style.boxShadow = ''
    })
    const cards = Array.from(document.querySelectorAll('.surah-card'))
    const target = cards.find(card => {
      const numDiv = card.querySelector('.card-bg-num')
      return numDiv && numDiv.textContent?.trim() === String(chapterNum)
    })
    if (target) {
      const el = target as HTMLElement
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      el.style.transform = 'scale(1.1)'
      el.style.filter = 'brightness(1.4)'
      el.style.boxShadow = '0 0 25px rgba(209, 209, 214, 0.6)'
      setTimeout(() => {
        el.style.transform = ''
        el.style.filter = ''
        el.style.boxShadow = ''
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
    <div id="island-search-wrapper">
      <div className={`island-search-box ${isThinking ? 'ai-thinking' : ''} ${isError ? 'island-error' : ''}`}>
        <div className="search-icon-wrapper">
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
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <button
        id="island-trigger"
        className="enter-trigger"
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
