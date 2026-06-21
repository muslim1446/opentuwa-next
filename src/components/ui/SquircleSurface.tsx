'use client'

import { useEffect, useRef, type ReactNode, type ElementType } from 'react'

interface SquircleSurfaceProps {
  children: ReactNode
  className?: string
  cornerRadius?: number
  cornerSmoothing?: number
  as?: ElementType
  [key: string]: any
}

export function SquircleSurface({
  children,
  className = '',
  cornerRadius = 24,
  cornerSmoothing = 0.6,
  as: Tag = 'div',
  ...props
}: SquircleSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null) as any

  useEffect(() => {
    const el = ref.current as HTMLElement
    if (!el) return

    if (typeof CSS !== 'undefined' && CSS.supports('corner-shape: superellipse(2)')) {
      return
    }

    let ro: ResizeObserver | null = null

    const applySquircle = async () => {
      try {
        const { getSvgPath } = await import('figma-squircle')
        const apply = () => {
          const { width, height } = el.getBoundingClientRect()
          if (width === 0 || height === 0) return
          const svgPath = getSvgPath({
            width,
            height,
            cornerRadius,
            cornerSmoothing,
          })
          el.style.clipPath = `path('${svgPath}')`
        }
        apply()
        ro = new ResizeObserver(() => apply())
        ro.observe(el)
      } catch {
        // fallback
      }
    }

    applySquircle()

    return () => {
      if (ro) ro.disconnect()
    }
  }, [cornerRadius, cornerSmoothing])

  return (
    <Tag
      ref={ref}
      className={`squircle-surface ${className}`}
      style={{ borderRadius: `${cornerRadius}px` }}
      {...props}
    >
      {children}
    </Tag>
  )
}
