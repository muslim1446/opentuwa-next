'use client'

import { useEffect, useCallback } from 'react'

const SELECTOR = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"]), .surah-card, .custom-select-trigger, .custom-option'

function isVisible(el: Element): boolean {
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function getDistance(r1: DOMRect, r2: DOMRect, dir: string): number {
  const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 }
  const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 }
  if (dir === 'ArrowRight' && c2.x <= c1.x) return Infinity
  if (dir === 'ArrowLeft' && c2.x >= c1.x) return Infinity
  if (dir === 'ArrowDown' && c2.y <= c1.y) return Infinity
  if (dir === 'ArrowUp' && c2.y >= c1.y) return Infinity
  const dMajor = dir === 'ArrowLeft' || dir === 'ArrowRight'
    ? Math.abs(c1.x - c2.x) : Math.abs(c1.y - c2.y)
  const dMinor = dir === 'ArrowLeft' || dir === 'ArrowRight'
    ? Math.abs(c1.y - c2.y) : Math.abs(c1.x - c2.x)
  return dMajor + dMinor * 2.5
}

export function useKeyboardNav() {
  const navigate = useCallback((direction: string) => {
    const candidates = Array.from(document.querySelectorAll(SELECTOR)).filter(isVisible)
    if (candidates.length === 0) return

    const active = document.activeElement
    let current = active && candidates.includes(active) ? active : candidates[0]

    if (!current || !document.body.contains(current)) {
      ;(candidates[0] as HTMLElement).focus()
      return
    }

    const r1 = current.getBoundingClientRect()
    let best: Element | null = null
    let minScore = Infinity

    for (const el of candidates) {
      if (el === current) continue
      const score = getDistance(r1, el.getBoundingClientRect(), direction)
      if (score < minScore) {
        minScore = score
        best = el
      }
    }

    if (best) {
      ;(best as HTMLElement).focus()
      best.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const active = document.activeElement
        if (active && active.closest('.card-scroller')) return
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        navigate(e.key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}
