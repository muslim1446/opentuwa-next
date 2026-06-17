'use client'

import { useEffect, useState } from 'react'

export function StatusHub() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div id="status-hub" className="glass-panel" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '320px',
      padding: '12px 16px',
      zIndex: 2026,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderRadius: '14px',
      transform: 'translateX(0)',
      transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
      color: '#FFFFFF',
    }}>
      <div style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: 'var(--accent-orange)',
        boxShadow: '0 0 10px var(--accent-orange)',
        animation: 'pulse 2s infinite',
      }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>System State</span>
        <span style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>Offline Mode</span>
      </div>
      <button
        style={{
          flexShrink: 0, padding: 8, borderRadius: 8,
          background: 'rgba(255,255,255,0.05)',
          border: 'none', cursor: 'pointer', color: '#FFFFFF',
          transition: 'background 0.2s',
        }}
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
