'use client'

import { useEffect, useRef, type ReactNode, type ElementType } from 'react'

interface SquircleSurfaceProps {
  children: ReactNode
  className?: string
  cornerRadius?: number
  cornerSmoothing?: number
  as?: ElementType
  /** Radius derivation role: "root" for outermost, "concentric" for nested */
  radiusRole?: 'root' | 'concentric'
  [key: string]: any
}

export function SquircleSurface({
  children,
  className = '',
  cornerRadius = 24,
  cornerSmoothing = 0.6,
  as: Tag = 'div',
  radiusRole,
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

  const tagProps: Record<string, any> = {
    ref,
    className: `squircle-surface ${className}`,
    style: { borderRadius: `${cornerRadius}px` },
    ...props,
  }

  if (radiusRole === 'root') {
    tagProps['data-radius-role'] = 'root'
    tagProps.style['--radius-root'] = `${cornerRadius}px`
  } else if (radiusRole === 'concentric') {
    tagProps['data-radius-role'] = 'concentric'
  }

  return (
    <Tag {...tagProps}>
      {children}
    </Tag>
  )
}
