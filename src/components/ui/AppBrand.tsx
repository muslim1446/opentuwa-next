'use client'

import { usePlayer } from '@/context/PlayerContext'

export function AppBrand() {
  const { view, setView } = usePlayer()

  if (view === 'cinema') return null

  return (
    <a
      href="/"
      className="app-brand fixed top-[max(24px,env(safe-area-inset-top,24px))] left-1/2 -translate-x-1/2 z-[9000] flex items-center justify-center gap-3 no-underline h-12 px-4 cursor-pointer transition-all duration-500"
      onClick={(e) => { e.preventDefault(); setView('dashboard') }}
      aria-label="Tuwa Home"
    >
      <span className="brand-icon" aria-hidden="true">
        <img
          src="https://opentuwa.com/assets/ui/favicon.svg"
          alt=""
          width={44}
          height={44}
          className="block object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
        />
      </span>
      <span className="brand-text font-bold text-[32px] -tracking-[0.04em] text-[var(--text-primary)] leading-none whitespace-nowrap hidden md:block">
        Tuwa
      </span>
    </a>
  )
}
