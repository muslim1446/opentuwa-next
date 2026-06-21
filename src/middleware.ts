import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SURAH_NAMES: Record<number, string> = {
  1: 'al-fatihah', 2: 'al-baqarah', 3: 'al-imran', 4: 'an-nisa', 5: 'al-maidah',
  6: 'al-anam', 7: 'al-araf', 8: 'al-anfal', 9: 'at-tawbah', 10: 'yunus',
  11: 'hud', 12: 'yusuf', 13: 'ar-rad', 14: 'ibrahim', 15: 'al-hijr',
  16: 'an-nahl', 17: 'al-isra', 18: 'al-kahf', 19: 'maryam', 20: 'taha',
  21: 'al-anbiya', 22: 'al-hajj', 23: 'al-muminun', 24: 'an-nur', 25: 'al-furqan',
  26: 'ash-shuara', 27: 'an-naml', 28: 'al-qasas', 29: 'al-ankabut', 30: 'ar-rum',
  31: 'luqman', 32: 'as-sajdah', 33: 'al-ahzab', 34: 'saba', 35: 'fatir',
  36: 'ya-sin', 37: 'as-saffat', 38: 'sad', 39: 'az-zumar', 40: 'ghafir',
  41: 'fussilat', 42: 'ash-shura', 43: 'az-zukhruf', 44: 'ad-dukhan', 45: 'al-jathiyah',
  46: 'al-ahqaf', 47: 'muhammad', 48: 'al-fath', 49: 'al-hujurat', 50: 'qaf',
  51: 'adh-dhariyat', 52: 'at-tur', 53: 'an-najm', 54: 'al-qamar', 55: 'ar-rahman',
  56: 'al-waqiah', 57: 'al-hadid', 58: 'al-mujadilah', 59: 'al-hashr', 60: 'al-mumtahanah',
  61: 'as-saff', 62: 'al-jumuah', 63: 'al-munafiqun', 64: 'at-taghabun', 65: 'at-talaq',
  66: 'at-tahrim', 67: 'al-mulk', 68: 'al-qalam', 69: 'al-haqqah', 70: 'al-maarij',
  71: 'nuh', 72: 'al-jinn', 73: 'al-muzzammil', 74: 'al-muddaththir', 75: 'al-qiyamah',
  76: 'al-insan', 77: 'al-mursalat', 78: 'an-naba', 79: 'an-naziat', 80: 'abasa',
  81: 'at-takwir', 82: 'al-infitar', 83: 'al-mutaffifin', 84: 'al-inshiqaq', 85: 'al-buruj',
  86: 'at-tariq', 87: 'al-ala', 88: 'al-ghashiyah', 89: 'al-fajr', 90: 'al-balad',
  91: 'ash-shams', 92: 'al-layl', 93: 'ad-duha', 94: 'ash-sharh', 95: 'at-tin',
  96: 'al-alaq', 97: 'al-qadr', 98: 'al-bayyinah', 99: 'az-zalzalah', 100: 'al-adiyat',
  101: 'al-qariah', 102: 'at-takathur', 103: 'al-asr', 104: 'al-humazah', 105: 'al-fil',
  106: 'quraysh', 107: 'al-maun', 108: 'al-kawthar', 109: 'al-kafirun', 110: 'an-nasr',
  111: 'al-masad', 112: 'al-ikhlas', 113: 'al-falaq', 114: 'an-nas',
}

const ENGLISH_NAMES: Record<number, string> = {
  1: 'the-opening', 2: 'the-cow', 3: 'the-family-of-imran', 4: 'the-women', 5: 'the-table-spread',
  6: 'the-cattle', 7: 'the-heights', 8: 'the-spoils-of-war', 9: 'the-repentance', 10: 'jonah',
  11: 'hud', 12: 'joseph', 13: 'the-thunder', 14: 'abraham', 15: 'the-rocky-tract',
  16: 'the-bee', 17: 'the-night-journey', 18: 'the-cave', 19: 'mary', 20: 'ta-ha',
  21: 'the-prophets', 22: 'the-pilgrimage', 23: 'the-believers', 24: 'the-light', 25: 'the-criterion',
  26: 'the-poets', 27: 'the-ant', 28: 'the-narratives', 29: 'the-spider', 30: 'the-romans',
  31: 'luqman', 32: 'the-prostration', 33: 'the-combined-forces', 34: 'sheba', 35: 'the-originator',
  36: 'ya-sin', 37: 'those-who-set-the-ranks', 38: 'the-letter-sad', 39: 'the-troops', 40: 'the-forgiver',
  41: 'explained-in-detail', 42: 'the-consultation', 43: 'the-ornaments-of-gold', 44: 'the-smoke', 45: 'the-crouching',
  46: 'the-wind-curved-sandhills', 47: 'muhammad', 48: 'the-victory', 49: 'the-rooms', 50: 'the-letter-qaf',
  51: 'the-winnowing-winds', 52: 'the-mount', 53: 'the-star', 54: 'the-moon', 55: 'the-beneficent',
  56: 'the-inevitable', 57: 'the-iron', 58: 'the-pleading-woman', 59: 'the-exile', 60: 'she-that-is-to-be-examined',
  61: 'the-ranks', 62: 'the-congregation', 63: 'the-hypocrites', 64: 'the-mutual-disillusion', 65: 'the-divorce',
  66: 'the-prohibition', 67: 'the-sovereignty', 68: 'the-pen', 69: 'the-reality', 70: 'the-ascending-stairways',
  71: 'noah', 72: 'the-jinn', 73: 'the-enshrouded-one', 74: 'the-cloaked-one', 75: 'the-resurrection',
  76: 'man', 77: 'the-emissaries', 78: 'the-tidings', 79: 'those-who-drag-forth', 80: 'he-frowned',
  81: 'the-overthrowing', 82: 'the-cleaving', 83: 'the-defrauding', 84: 'the-sundering', 85: 'the-mansions-of-the-stars',
  86: 'the-morning-star', 87: 'the-most-high', 88: 'the-overwhelming', 89: 'the-dawn', 90: 'the-city',
  91: 'the-sun', 92: 'the-night', 93: 'the-morning-hours', 94: 'the-relief', 95: 'the-fig',
  96: 'the-clot', 97: 'the-power', 98: 'the-clear-proof', 99: 'the-earthquake', 100: 'the-courser',
  101: 'the-calamity', 102: 'the-rivalry-in-world-increase', 103: 'the-declining-day', 104: 'the-traducer', 105: 'the-elephant',
  106: 'quraysh', 107: 'the-small-kindnesses', 108: 'the-abundance', 109: 'the-disbelievers', 110: 'the-divine-support',
  111: 'the-palm-fiber', 112: 'the-sincerity', 113: 'the-daybreak', 114: 'mankind',
}

const RECITER_SLUGS: Record<string, string> = {
  'alafasy': 'mishari-alafasy',
  'juhaynee': 'al-juhany',
  'sudais': 'as-sudais',
  'ghamadi': 'al-ghamdi',
  'abbad': 'fares-abbad',
  'muaiqly': 'al-muaiqly',
  'shuraym': 'ash-shuraym',
  'basit': 'abdul-basit',
  'ayyoub': 'muhammad-ayyoub',
  'minshawy': 'minshawy',
  'jaber': 'ali-jaber',
  'ajamy': 'ahmed-ali-ajamy',
}

function decodeStream(token: string): { chapter: number; verse: number; reciter: string; trans: string; audio_trans: string } | null {
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

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const streamMatch = search.match(/[?&]stream=([^&]+)/)
  if (streamMatch) {
    const data = decodeStream(streamMatch[1])
    if (data && data.chapter >= 1 && data.chapter <= 114) {
      const slug = ENGLISH_NAMES[data.chapter] || 'surah'
      const reciterSlug = RECITER_SLUGS[data.reciter] || data.reciter
      let target = `/en/surah/${slug}/${data.chapter}`
      const qs = new URLSearchParams()
      if (data.reciter !== 'alafasy') qs.set('reciter', data.reciter)
      if (data.trans !== 'en') qs.set('trans', data.trans)
      if (data.verse > 1) qs.set('verse', String(data.verse))
      const qStr = qs.toString()
      if (qStr) target += `?${qStr}`
      return NextResponse.redirect(new URL(target, request.url), 301)
    }
  }

  const chapterMatch = pathname.match(/^\/chapter\/(\d+)$/)
  if (chapterMatch) {
    const id = parseInt(chapterMatch[1])
    if (id >= 1 && id <= 114) {
      const slug = ENGLISH_NAMES[id] || 'surah'
      return NextResponse.redirect(new URL(`/en/surah/${slug}/${id}`, request.url), 301)
    }
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url), 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|manifest.json|sw.js|api|robots.txt|sitemap.xml).*)',
  ],
}
