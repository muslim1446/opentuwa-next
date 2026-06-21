import { getRequestContext } from '@cloudflare/next-on-pages'
import { getAllArtists, getArtist, getArtistBySlug, getAlbum, getAlbumBySlug, getAllAlbums, getAlbumsByArtist, getTrack, getTracksByAlbum, getAllAlbums as dbAllAlbums } from './db'
import { SURAH_METADATA } from './surah-metadata'
import { RECITERS_CONFIG, ARTIST_NAME, ARTIST_ID } from './configs'
import { encodeAlbumId } from './entity-ids'
import type { DbArtist, DbAlbum, DbTrack } from './db'

export function getDB(): D1Database | null {
  try {
    const ctx = getRequestContext()
    return ctx.env?.DB as D1Database ?? null
  } catch {
    return null
  }
}

function parseVerseCount(description: string): number {
  const m = description.match(/\((\d+) verses?\)/)
  return m ? parseInt(m[1]) : 0
}

export interface ArtistData {
  id: string
  name: string
  slug: string
  bio?: string
  image_url?: string
  artwork_url?: string
  genre?: string
  website?: string
  wikipedia_url?: string
  twitter_handle?: string
  instagram_handle?: string
}

export interface AlbumData {
  id: string
  artist_id: string
  title: string
  slug: string
  description: string
  artwork_url: string
  release_date: string
  genre: string
  track_count: number
  is_verse_based: number
  total_duration_ms: number
  upc: string
  label: string
  copyright: string
  has_timing: number
  timing_base_url: string
  audio_base_url: string
}

export interface TrackData {
  id: string
  album_id: string
  artist_id: string
  title: string
  slug: string
  track_number: number
  disc_number: number
  duration_ms: number
  audio_url: string
  preview_url: string
  timing_json_url: string
  isrc: string
  has_timing: number
  lyrics: string
}

export async function fetchArtists(): Promise<ArtistData[]> {
  const db = getDB()
  if (db) {
    try {
      const rows = await getAllArtists(db)
      return rows.map(r => ({ id: r.id, name: r.name, slug: r.slug, bio: r.bio, image_url: r.image_url, artwork_url: r.artwork_url, genre: r.genre, website: r.website, wikipedia_url: r.wikipedia_url, twitter_handle: r.twitter_handle, instagram_handle: r.instagram_handle }))
    } catch { /* fallthrough */ }
  }
  return Object.entries(RECITERS_CONFIG).map(([id, cfg]) => ({
    id, name: cfg.name, slug: id,
    bio: '', image_url: '', artwork_url: '', genre: 'Quran, Recitation',
    website: '', wikipedia_url: '', twitter_handle: '', instagram_handle: '',
  }))
}

export async function fetchArtist(idOrSlug: string): Promise<ArtistData | null> {
  const db = getDB()
  if (db) {
    try {
      let row = await getArtist(db, idOrSlug)
      if (!row) row = await getArtistBySlug(db, idOrSlug)
      if (row) return { id: row.id, name: row.name, slug: row.slug, bio: row.bio, image_url: row.image_url, artwork_url: row.artwork_url, genre: row.genre, website: row.website, wikipedia_url: row.wikipedia_url, twitter_handle: row.twitter_handle, instagram_handle: row.instagram_handle }
    } catch { /* fallthrough */ }
  }
  const entry = Object.entries(RECITERS_CONFIG).find(([id, _]) => id === idOrSlug)
  if (entry) return { id: entry[0], name: entry[1].name, slug: entry[0], bio: '', image_url: '', artwork_url: '', genre: 'Quran, Recitation', website: '', wikipedia_url: '', twitter_handle: '', instagram_handle: '' }
  return null
}

export async function fetchAlbums(artistId?: string): Promise<AlbumData[]> {
  const db = getDB()
  if (db) {
    try {
      const rows = artistId ? await getAlbumsByArtist(db, artistId) : await dbAllAlbums(db)
      return rows.map(r => ({ ...r }))
    } catch { /* fallthrough */ }
  }
  return SURAH_METADATA.map(s => ({
    id: encodeAlbumId(s.chapter),
    artist_id: ARTIST_ID,
    title: s.english_name,
    slug: s.english_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    description: s.description,
    artwork_url: 'https://opentuwa.com/assets/ui/web_1200.png',
    release_date: '', genre: 'Quran, Recitation',
    track_count: parseVerseCount(s.description),
    is_verse_based: 1, total_duration_ms: 0, upc: '', label: '', copyright: '',
    has_timing: 1,
    timing_base_url: 'https://raw.githubusercontent.com/muslim1446/CDN-muslim.opentuwa.com/main',
    audio_base_url: 'https://hosting.opentuwa.com',
  }))
}

export async function fetchAlbumBySlug(slug: string): Promise<AlbumData | null> {
  const db = getDB()
  if (db) {
    try {
      const row = await getAlbumBySlug(db, slug)
      if (row) return { ...row }
    } catch { /* fallthrough */ }
  }
  return null
}

export async function fetchAlbum(id: string): Promise<AlbumData | null> {
  const db = getDB()
  if (db) {
    try {
      const row = await getAlbum(db, id)
      if (row) return { ...row }
    } catch { /* fallthrough */ }
  }
  const s = SURAH_METADATA.find(s => encodeAlbumId(s.chapter) === id)
  if (!s) return null
  return {
    id, artist_id: ARTIST_ID, title: s.english_name,
    slug: s.english_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    description: s.description, artwork_url: 'https://opentuwa.com/assets/ui/web_1200.png',
    release_date: '', genre: 'Quran, Recitation', track_count: parseVerseCount(s.description),
    is_verse_based: 1, total_duration_ms: 0, upc: '', label: '', copyright: '',
    has_timing: 1,
    timing_base_url: 'https://raw.githubusercontent.com/muslim1446/CDN-muslim.opentuwa.com/main',
    audio_base_url: 'https://hosting.opentuwa.com',
  }
}

export async function fetchTracks(albumId: string): Promise<TrackData[]> {
  const db = getDB()
  if (db) {
    try {
      const rows = await getTracksByAlbum(db, albumId)
      return rows.map(r => ({ ...r }))
    } catch { /* fallthrough */ }
  }
  const album = await fetchAlbum(albumId)
  if (!album) return []
  return Array.from({ length: album.track_count }, (_, i) => ({
    id: '', album_id: albumId, artist_id: album.artist_id,
    title: `Verse ${i + 1}`, slug: `verse-${i + 1}`,
    track_number: i + 1, disc_number: 1, duration_ms: 8000,
    audio_url: '', preview_url: '', timing_json_url: '', isrc: '', has_timing: 1, lyrics: '',
  }))
}

export async function fetchTrack(id: string): Promise<TrackData | null> {
  const db = getDB()
  if (db) {
    try {
      const row = await getTrack(db, id)
      if (row) return { ...row }
    } catch { /* fallthrough */ }
  }
  return null
}

export function getVerseCount(surahIndex: number): number {
  return parseVerseCount(SURAH_METADATA[surahIndex]?.description || '')
}
