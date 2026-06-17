'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function StatusHub() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      id="status-hub"
      className="fixed bottom-6 right-6 max-w-[320px] px-4 py-3 z-[2026] flex items-center gap-3 rounded-[14px] shadow-lg translate-x-0 transition-transform duration-600"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: 'var(--accent-orange)', boxShadow: '0 0 10px var(--accent-orange)' }}
      />
      <div className="flex-1">
        <span className="text-[11px] uppercase tracking-[1px] opacity-50 block">System State</span>
        <span className="text-sm font-medium block">Offline Mode</span>
      </div>
      <button
        className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/15 transition-all cursor-pointer border-none text-white"
        onClick={() => window.location.reload()}
        aria-label="Sync"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
    </div>
  )
}
