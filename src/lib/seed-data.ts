import { SURAH_METADATA } from './surah-metadata'
import { encodeAlbumId, encodeSongId } from './entity-ids'

const ARTIST_ID = 'alafasy'
const ARTIST_NAME = 'Mishari Rashid Alafasy'
const ARTIST_SLUG = 'mishary-rashid-alafasy'

const AUDIO_BASE = 'https://hosting.opentuwa.com'
const TIMING_BASE = 'https://raw.githubusercontent.com/muslim1446/CDN-muslim.opentuwa.com/main'

function parseVerseCount(description: string): number {
  const m = description.match(/\((\d+) verses?\)/)
  return m ? parseInt(m[1]) : 0
}

export function generateSeedSql(): string {
  const lines: string[] = []

  lines.push(`-- OpenTuwa Seed Data: ${ARTIST_NAME}`)
  lines.push(`-- Generated from static SURAH_METADATA`)
  lines.push('')

  lines.push(`INSERT OR REPLACE INTO artists (id, name, slug, bio, artwork_url, genre, created_at, updated_at) VALUES (
    '${ARTIST_ID}',
    '${ARTIST_NAME}',
    '${ARTIST_SLUG}',
    'Kuwaiti qari and imam. One of the most renowned Quran reciters in the Muslim world, known for his soulful and emotional recitations.',
    'https://opentuwa.com/assets/ui/web_1200.png',
    'Quran, Recitation',
    datetime('now'),
    datetime('now')
  );`)
  lines.push('')

  for (const surah of SURAH_METADATA) {
    const albumId = encodeAlbumId(surah.chapter)
    const verseCount = parseVerseCount(surah.description)
    const paddedCh = String(surah.chapter).padStart(3, '0')

    lines.push(`-- Album: ${surah.chapter}. ${surah.english_name} (${verseCount} tracks)`)
    lines.push(`INSERT OR REPLACE INTO albums (id, artist_id, title, slug, description, artwork_url, genre, track_count, is_verse_based, audio_base_url, timing_base_url, has_timing, created_at, updated_at) VALUES (
      '${albumId}',
      '${ARTIST_ID}',
      '${surah.english_name.replace(/'/g, "''")}',
      '${surah.english_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}',
      '${surah.description.replace(/'/g, "''")}',
      'https://opentuwa.com/assets/ui/web_1200.png',
      'Quran, Recitation',
      ${verseCount},
      1,
      '${AUDIO_BASE}',
      '${TIMING_BASE}',
      1,
      datetime('now'),
      datetime('now')
    );`)

    for (let v = 1; v <= verseCount; v++) {
      const trackId = encodeSongId(surah.chapter, v, 'alafasy', 'en', 'none')
      lines.push(`INSERT OR REPLACE INTO tracks (id, album_id, artist_id, title, slug, track_number, disc_number, duration_ms, audio_url, timing_json_url, has_timing, created_at, updated_at) VALUES (
        '${trackId}',
        '${albumId}',
        '${ARTIST_ID}',
        '${surah.english_name} — Verse ${v}',
        'verse-${v}',
        ${v},
        1,
        8000,
        '${AUDIO_BASE}/${paddedCh}.wav',
        '${TIMING_BASE}/${paddedCh}.json',
        1,
        datetime('now'),
        datetime('now')
      );`)
    }
    lines.push('')
  }

  lines.push(`-- Total: 1 artist, ${SURAH_METADATA.length} albums, seeded tracks`)
  return lines.join('\n')
}

export function logSeedStats(): void {
  let totalTracks = 0
  for (const surah of SURAH_METADATA) {
    const vc = parseVerseCount(surah.description)
    totalTracks += vc
  }
  console.log(`Seed stats: 1 artist, ${SURAH_METADATA.length} albums, ${totalTracks} tracks`)
}
