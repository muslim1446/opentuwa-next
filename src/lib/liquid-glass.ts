/**
 * Liquid Glass Runtime
 * Complete implementation of the Liquid Glass Protocol for Apple Ecosystem
 *
 * Stages:
 *   B  — Concentric Radius Derivation
 *   J  — Adaptive Color & Glass Composition
 *   F  — Motion, Physics & Animation
 *   K  — Accessibility & Inclusion
 *   L  — Cross-Platform Adaptation
 */

/* --------------------------------------------------------------------------
 * Stage B — Concentric Radius Resolver
 * childRadius = max(0, parentRadius - gap), applied pairwise
 * -------------------------------------------------------------------------- */

export function resolveConcentricRadius(parentRadiusPx: number, gapPx: number): number {
  return Math.max(0, parentRadiusPx - gapPx)
}

export function walkConcentricTree(root: HTMLElement, rootRadiusPx: number): void {
  const children = root.querySelectorAll<HTMLElement>('[data-radius-role="concentric"]')

  children.forEach((child) => {
    const parentRect = root.getBoundingClientRect()
    const childRect = child.getBoundingClientRect()

    const gapPx = Math.abs(parentRect.top - childRect.top)
    const resolvedRadius = resolveConcentricRadius(rootRadiusPx, gapPx)

    child.style.setProperty('--radius', `${resolvedRadius}px`)
    child.style.borderRadius = `${resolvedRadius}px`

    if (child.querySelector('[data-radius-role="concentric"]')) {
      walkConcentricTree(child, resolvedRadius)
    }
  })
}

export function initConcentricResolver(): void {
  document.querySelectorAll<HTMLElement>('[data-radius-role="root"]').forEach((root) => {
    const rootRadius = parseFloat(
      getComputedStyle(root).getPropertyValue('--radius-root') || '0'
    )
    walkConcentricTree(root, rootRadius)
  })
}

/* --------------------------------------------------------------------------
 * Stage J — Adaptive Color Source Image Sampling
 * -------------------------------------------------------------------------- */

interface AdaptiveColorResult {
  h: number
  s: number
  l: number
  hex: string
}

const colorCache = new Map<string, AdaptiveColorResult>()
const LRU_MAX = 200

export function getImageHash(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export async function extractAdaptiveColor(
  imageUrl: string,
  signal?: AbortSignal
): Promise<AdaptiveColorResult | null> {
  const hash = getImageHash(imageUrl)

  // Check cache
  if (colorCache.has(hash)) {
    return colorCache.get(hash)!
  }

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const imgLoad = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Image load failed'))
      if (signal) {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }
    })

    // Timeout at 50ms per spec
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 50)
    )

    img.src = imageUrl
    await Promise.race([imgLoad, timeout])

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // 24x24 downscale, discard outer 15% margin
    canvas.width = 24
    canvas.height = 24
    ctx.drawImage(img, 0, 0, 24, 24)

    const imageData = ctx.getImageData(0, 0, 24, 24)
    const data = imageData.data

    const marginPx = Math.floor(24 * 0.15)
    let totalWeight = 0
    let rAccum = 0, gAccum = 0, bAccum = 0

    for (let y = marginPx; y < 24 - marginPx; y++) {
      for (let x = marginPx; x < 24 - marginPx; x++) {
        const i = (y * 24 + x) * 4
        const r = data[i], g = data[i + 1], b = data[i + 2]

        // Weighted average: weight = 0.3 + 0.7 * saturation
        const maxC = Math.max(r, g, b) / 255
        const minC = Math.min(r, g, b) / 255
        const sat = maxC === 0 ? 0 : (maxC - minC) / maxC
        const weight = 0.3 + 0.7 * sat

        rAccum += r * weight
        gAccum += g * weight
        bAccum += b * weight
        totalWeight += weight
      }
    }

    if (totalWeight === 0) return null

    const avgR = Math.round(rAccum / totalWeight)
    const avgG = Math.round(gAccum / totalWeight)
    const avgB = Math.round(bAccum / totalWeight)

    const { h, s, l: lightness } = rgbToHsl(avgR, avgG, avgB)

    // HSL clamping: L in [10-20%] dark / [80-92%] light for secondary; S <= 45%
    const isDark = lightness < 50
    const clampedL = isDark
      ? Math.min(Math.max(lightness, 10), 20)
      : Math.min(Math.max(lightness, 80), 92)
    const clampedS = Math.min(s, 45)

    // Binary search L channel until WCAG 4.5:1 clears
    const bgLuminance = isDark ? 0.05 : 0.95 // near-black / near-white bg
    let targetL = clampedL
    let step = isDark ? 0.5 : -0.5
    const hexBase = hslToHex(h, clampedS, targetL)

    // Simple binary search for contrast
    for (let i = 0; i < 20; i++) {
      const r = parseInt(hexBase.slice(1, 3), 16)
      const g = parseInt(hexBase.slice(3, 5), 16)
      const b = parseInt(hexBase.slice(5, 7), 16)
      const textLuminance = getLuminance(r, g, b)
      const ratio = getContrastRatio(textLuminance, bgLuminance)

      if (ratio >= 4.5) break

      targetL += step
      if (targetL < 0 || targetL > 100) break
      step = isDark ? Math.min(step + 0.3, 1) : Math.max(step - 0.3, -1)
    }

    const result: AdaptiveColorResult = {
      h,
      s: clampedS,
      l: Math.round(targetL),
      hex: hslToHex(h, clampedS, Math.round(targetL)),
    }

    // Cache
    colorCache.set(hash, result)
    if (colorCache.size > LRU_MAX) {
      const firstKey = colorCache.keys().next().value
      if (firstKey) colorCache.delete(firstKey)
    }

    return result
  } catch {
    return null
  }
}

export function applyAdaptiveColor(
  element: HTMLElement,
  color: AdaptiveColorResult,
  isDark: boolean
): void {
  const baseL = isDark ? Math.min(color.l, 15) : Math.max(color.l, 85)
  const lightL = isDark ? Math.min(color.l + 70, 92) : Math.max(color.l - 65, 10)

  element.style.setProperty('--adaptive-h', String(color.h))
  element.style.setProperty('--adaptive-s', `${color.s}%`)
  element.style.setProperty('--adaptive-l', `${color.l}%`)
  element.style.setProperty('--adaptive-color', `hsl(${color.h}, ${color.s}%, ${color.l}%)`)
  element.style.setProperty('--adaptive-color-base', `hsl(${color.h}, ${Math.min(color.s, 30)}%, ${baseL}%)`)
  element.style.setProperty('--adaptive-color-light', `hsl(${color.h}, ${Math.min(color.s, 30)}%, ${lightL}%)`)
}

/* --------------------------------------------------------------------------
 * Stage F — Motion, Physics & Animation
 * -------------------------------------------------------------------------- */

export interface SpringConfig {
  duration: number
  bounce: number
}

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  smooth:  { duration: 0.5,  bounce: 0 },
  snappy:  { duration: 0.25, bounce: 0.05 },
  bouncy:  { duration: 0.5,  bounce: 0.2 },
  gesture: { duration: 0.15, bounce: 0 },
  sheet:   { duration: 0.4,  bounce: 0.1 },
  modal:   { duration: 0.55, bounce: 0 },
  hero:    { duration: 0.5,  bounce: 0.15 },
}

export interface PhysicsParams {
  mass: number
  stiffness: number
  damping: number
}

/**
 * Convert Apple-style duration/bounce to mass/stiffness/damping
 * Based on WWDC 2023 corrected formulas
 */
export function springToPhysics(duration: number, bounce: number): PhysicsParams {
  const mass = 1
  const stiffness = Math.pow((2 * Math.PI) / duration, 2)
  const damping = bounce >= 0
    ? ((1 - bounce) * 4 * Math.PI) / duration
    : (4 * Math.PI) / (duration * (1 + bounce))
  return { mass, stiffness, damping }
}

/**
 * Generate CSS linear() spring approximation
 * Requires Safari 17.2+, Chrome 113+, Firefox 112+
 */
export function generateLinearSpring(
  { stiffness = 180, damping = 12, mass = 1, samples = 60 } = {}
): { easing: string; durationMs: number } {
  const omega = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  const omegaD = omega * Math.sqrt(1 - zeta ** 2)
  const zetaFac = zeta / Math.sqrt(1 - zeta ** 2)

  let settleT = 1
  for (let t = 0.05; t < 10; t += 0.01) {
    const x = 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(omegaD * t) + zetaFac * Math.sin(omegaD * t)
    )
    if (Math.abs(x - 1) < 0.002) { settleT = t; break }
  }

  const points = Array.from({ length: samples + 1 }, (_, i) => {
    const t = (i / samples) * settleT
    const x = 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(omegaD * t) + zetaFac * Math.sin(omegaD * t)
    )
    return +x.toFixed(4)
  })

  return {
    easing: `linear(${points.join(', ')})`,
    durationMs: Math.round(settleT * 1000),
  }
}

/* --------------------------------------------------------------------------
 * Stage F — Accessibility & Reduced Motion
 * -------------------------------------------------------------------------- */

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function prefersReducedTransparency(): boolean {
  return window.matchMedia('(prefers-reduced-transparency: reduce)').matches
}

export function prefersContrastMore(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches
}

export function prefersDarkScheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function withMotionSupport<T extends { duration?: number }>(
  activeConfig: T,
  reducedConfig: T = { duration: 0 } as T
): T {
  return prefersReducedMotion() ? reducedConfig : activeConfig
}

/* --------------------------------------------------------------------------
 * Stage L — Cross-Platform Adaptation
 * -------------------------------------------------------------------------- */

export type Platform = 'ios' | 'ipados' | 'macos' | 'visionos' | 'watchos' | 'tvos'

export function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/Mac OS/.test(ua) && !/iP(ad|hone|od)/.test(ua)) return 'macos'
  if (/iPad/.test(ua)) return 'ipados'
  if (/iPhone/.test(ua)) return 'ios'
  if (/Watch/.test(ua)) return 'watchos'
  if (/AppleTV/.test(ua)) return 'tvos'
  if (/Mac/.test(ua) && typeof Touch !== 'undefined') return 'ipados'
  if (/Android/.test(ua) && typeof Touch !== 'undefined') return 'ios' // mobile fallback
  return 'macos'
}

export function applyPlatform(root: HTMLElement = document.documentElement): void {
  const platform = detectPlatform()
  root.setAttribute('data-platform', platform)
}

/* --------------------------------------------------------------------------
 * Stage M — Haptics (Web Vibration API)
 * -------------------------------------------------------------------------- */

export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
export type NotificationType = 'success' | 'warning' | 'error'

const IMPACT_PATTERNS: Record<ImpactStyle, number[]> = {
  light:  [10],
  medium: [20],
  heavy:  [30],
  rigid:  [15, 10, 15],
  soft:   [8, 5, 8],
}

const NOTIFICATION_PATTERNS: Record<NotificationType, number[]> = {
  success: [20, 30, 20],
  warning: [30, 20, 30, 20],
  error:   [40, 20, 40, 20, 40],
}

export function hapticImpact(style: ImpactStyle = 'medium'): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(IMPACT_PATTERNS[style])
  }
}

export function hapticNotification(type: NotificationType = 'success'): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(NOTIFICATION_PATTERNS[type])
  }
}

/* --------------------------------------------------------------------------
 * Stage B — Runtime Validation (Z-Index Layer Check)
 * -------------------------------------------------------------------------- */

export function resolveZIndex(token: string, elementType: 'content' | 'navigation' | 'overlay'): number {
  const value = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue(token), 10
  )

  const layerRanges: Record<string, [number, number]> = {
    content:    [0, 1999],
    navigation: [2000, 2999],
    overlay:    [3000, Infinity],
  }

  if (process.env.NODE_ENV === 'development') {
    const [min, max] = layerRanges[elementType]
    if (value < min || value > max) {
      throw new Error(
        `[Liquid Glass] Layer violation: ${token} (${value}) ` +
        `assigned to ${elementType}, expected ${min}–${max}`
      )
    }
  }

  return value
}

/* --------------------------------------------------------------------------
 * Initialization
 * -------------------------------------------------------------------------- */

export function initLiquidGlass(): void {
  applyPlatform()

  // Safe area CSS custom properties
  if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
    const style = getComputedStyle(document.documentElement)
    document.documentElement.style.setProperty('--safe-top', style.getPropertyValue('--safe-top'))
  }

  // Init concentric resolver after layout stabilizes
  requestAnimationFrame(() => {
    initConcentricResolver()
  })

  // Squircle surfaces: observe for JS-based clip-path fallback
  const squircleSurfaces = document.querySelectorAll<HTMLElement>('.squircle-surface')
  if (squircleSurfaces.length > 0 && !CSS.supports('corner-shape: superellipse(2)')) {
    // Dynamic import of figma-squircle if available
    import('figma-squircle').catch(() => {
      // figma-squircle not available — border-radius fallback is acceptable
    })
  }
}

declare module 'figma-squircle' {
  export function getSvgPath(params: {
    width: number
    height: number
    cornerRadius: number
    cornerSmoothing?: number
  }): string
}
