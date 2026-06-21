import type { D1Database } from '@cloudflare/workers-types'

export interface DbArtist {
  id: string
  name: string
  slug: string
  bio: string
  image_url: string
  artwork_url: string
  genre: string
  website: string
  wikipedia_url: string
  twitter_handle: string
  instagram_handle: string
  created_at: string
  updated_at: string
}

export interface DbAlbum {
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
  created_at: string
  updated_at: string
}

export interface DbTrack {
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
  created_at: string
  updated_at: string
}

export type D1Result<T> = { results: T[]; success: boolean }

export async function getArtist(db: D1Database, id: string): Promise<DbArtist | null> {
  const res = await db.prepare('SELECT * FROM artists WHERE id = ?').bind(id).first()
  return (res as unknown as DbArtist) || null
}

export async function getArtistBySlug(db: D1Database, slug: string): Promise<DbArtist | null> {
  const res = await db.prepare('SELECT * FROM artists WHERE slug = ?').bind(slug).first()
  return (res as unknown as DbArtist) || null
}

export async function getAllArtists(db: D1Database): Promise<DbArtist[]> {
  const res = await db.prepare('SELECT * FROM artists ORDER BY name ASC').all()
  return res.results as unknown as DbArtist[]
}

export async function getAlbum(db: D1Database, id: string): Promise<DbAlbum | null> {
  const res = await db.prepare('SELECT * FROM albums WHERE id = ?').bind(id).first()
  return (res as unknown as DbAlbum) || null
}

export async function getAlbumsByArtist(db: D1Database, artistId: string): Promise<DbAlbum[]> {
  const res = await db.prepare('SELECT * FROM albums WHERE artist_id = ? ORDER BY title ASC').bind(artistId).all()
  return res.results as unknown as DbAlbum[]
}

export async function getAllAlbums(db: D1Database): Promise<DbAlbum[]> {
  const res = await db.prepare('SELECT * FROM albums ORDER BY title ASC').all()
  return res.results as unknown as DbAlbum[]
}

export async function getAlbumBySlug(db: D1Database, slug: string): Promise<DbAlbum | null> {
  const res = await db.prepare('SELECT * FROM albums WHERE slug = ?').bind(slug).first()
  return (res as unknown as DbAlbum) || null
}

export async function getTrack(db: D1Database, id: string): Promise<DbTrack | null> {
  const res = await db.prepare('SELECT * FROM tracks WHERE id = ?').bind(id).first()
  return (res as unknown as DbTrack) || null
}

export async function getTracksByAlbum(db: D1Database, albumId: string): Promise<DbTrack[]> {
  const res = await db.prepare('SELECT * FROM tracks WHERE album_id = ? ORDER BY track_number ASC').bind(albumId).all()
  return res.results as unknown as DbTrack[]
}

export async function getTracksByArtist(db: D1Database, artistId: string): Promise<DbTrack[]> {
  const res = await db.prepare('SELECT * FROM tracks WHERE artist_id = ? ORDER BY track_number ASC').bind(artistId).all()
  return res.results as unknown as DbTrack[]
}

export async function deleteArtist(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM tracks WHERE artist_id = ?').bind(id).run()
  await db.prepare('DELETE FROM albums WHERE artist_id = ?').bind(id).run()
  await db.prepare('DELETE FROM artists WHERE id = ?').bind(id).run()
}

export async function deleteAlbum(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM tracks WHERE album_id = ?').bind(id).run()
  await db.prepare('DELETE FROM albums WHERE id = ?').bind(id).run()
}
