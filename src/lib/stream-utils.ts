import { StreamData, PlayerState } from './types'
import { STORAGE_KEY } from './configs'

export function encodeStream(ch: number, v: number, rec: string, trans: string, aud: string): string {
  try {
    const raw = `${ch}|${v}|${rec}|${trans}|${aud}`
    return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return ''
  }
}

export function decodeStream(token: string): StreamData | null {
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) base64 += '='
    const raw = atob(base64)
    const parts = raw.split('|')
    if (parts.length < 5) return null
    return {
      chapter: parseInt(parts[0]),
      verse: parseInt(parts[1]),
      reciter: parts[2],
      trans: parts[3],
      audio_trans: parts[4],
    }
  } catch {
    return null
  }
}

export function saveState(state: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function loadState(): PlayerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getBrowserLang(): string {
  if (typeof navigator === 'undefined') return 'en'
  return navigator.language.split('-')[0]
}
