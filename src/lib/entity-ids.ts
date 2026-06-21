/**
 * Apple-style numeric IDs for album/song routes.
 * Encodes playback parameters into opaque 11-digit numbers
 * so the URL reveals no religious content.
 *
 * Song ID:  {chapter:03d}{verse:03d}{reciterIdx:02d}{transIdx:02d}{audioIdx:01d}
 *           chapter 1-114, verse 1-286, reciter 0-11, trans 0-49, audio 0-4
 *           e.g. ch=1, v=6, alafasy(0), en(0), none(0) → "00100600000"
 *
 * Album ID: {chapter:03d}00000000
 *           e.g. ch=1 → "00100000000"
 */
import {
  RECITERS_CONFIG,
  TRANSLATIONS_CONFIG,
  TRANSLATION_AUDIO_CONFIG,
} from './configs'

export const RECITER_KEYS = Object.keys(RECITERS_CONFIG)
export const TRANS_KEYS = Object.keys(TRANSLATIONS_CONFIG)
export const AUDIO_TRANS_KEYS = Object.keys(TRANSLATION_AUDIO_CONFIG)

export function encodeSongId(
  chapter: number,
  verse: number,
  reciter: string,
  trans: string,
  audioTrans: string,
): string {
  const recIdx = RECITER_KEYS.indexOf(reciter)
  const transIdx = TRANS_KEYS.indexOf(trans)
  const audioIdx = AUDIO_TRANS_KEYS.indexOf(audioTrans)
  if (recIdx < 0 || transIdx < 0 || audioIdx < 0) return '00100100000'
  const ch = chapter.toString().padStart(3, '0')
  const v = verse.toString().padStart(3, '0')
  const r = recIdx.toString().padStart(2, '0')
  const t = transIdx.toString().padStart(2, '0')
  const a = audioIdx.toString()
  return `${ch}${v}${r}${t}${a}`
}

export function decodeSongId(
  id: string,
): {
  chapter: number
  verse: number
  reciter: string
  trans: string
  audioTrans: string
} | null {
  if (id.length !== 11) return null
  const ch = parseInt(id.substring(0, 3), 10)
  const v = parseInt(id.substring(3, 6), 10)
  const recIdx = parseInt(id.substring(6, 8), 10)
  const transIdx = parseInt(id.substring(8, 10), 10)
  const audioIdx = parseInt(id.substring(10, 11), 10)
  if (isNaN(ch) || isNaN(v) || ch < 1 || ch > 114) return null
  return {
    chapter: ch,
    verse: v,
    reciter: RECITER_KEYS[recIdx] || 'alafasy',
    trans: TRANS_KEYS[transIdx] || 'en',
    audioTrans: AUDIO_TRANS_KEYS[audioIdx] || 'none',
  }
}

export function encodeAlbumId(chapter: number): string {
  return chapter.toString().padStart(3, '0') + '00000000'
}

export function decodeAlbumId(
  id: string,
): { chapter: number } | null {
  if (id.length !== 11) return null
  const ch = parseInt(id.substring(0, 3), 10)
  if (isNaN(ch) || ch < 1 || ch > 114) return null
  return { chapter: ch }
}
