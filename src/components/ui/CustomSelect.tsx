'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useIdleTimer } from '@/hooks/useIdleTimer'

interface SelectItem {
  value: string
  text: string
}

interface CustomSelectProps {
  items: SelectItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  wrapperId?: string
}

export function CustomSelect({ items, value, onChange, placeholder, wrapperId }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const isIdle = useIdleTimer()

  const selected = items.find(i => i.value === value)
  const displayText = selected?.text || placeholder || 'Select...'

  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isIdle) return
    setIsOpen(prev => !prev)
  }, [isIdle])

  const handleOptionClick = useCallback((itemValue: string) => {
    onChange(itemValue)
    setIsOpen(false)
  }, [onChange])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        if (isMobile && portalRef.current?.contains(e.target as Node)) return
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobile])

  const optionsContent = (
    <div className="custom-options" role="listbox">
      {items.map(item => (
        <div
          key={item.value}
          className={`custom-option ${item.value === value ? 'selected' : ''}`}
          data-value={item.value}
          role="option"
          tabIndex={0}
          onClick={() => handleOptionClick(item.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleOptionClick(item.value) }}
        >
          {item.text}
        </div>
      ))}
    </div>
  )

  return (
    <div ref={wrapperRef} className={`custom-select-wrapper ${isOpen ? 'open' : ''}`} id={wrapperId}>
      <button
        className="custom-select-trigger"
        onClick={handleTriggerClick}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <span>{displayText}</span>
      </button>
      {isOpen && isMobile ? createPortal(
        <div ref={portalRef} className="mobile-popover-portal">{optionsContent}</div>,
        document.body
      ) : optionsContent}
    </div>
  )
}
