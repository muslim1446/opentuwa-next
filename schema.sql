-- OpenTuwa D1 Schema
-- Run: wrangler d1 execute opentuwa-prod --file=schema.sql

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  artwork_url TEXT DEFAULT '',
  genre TEXT DEFAULT 'Quran, Recitation',
  website TEXT DEFAULT '',
  wikipedia_url TEXT DEFAULT '',
  twitter_handle TEXT DEFAULT '',
  instagram_handle TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  artwork_url TEXT DEFAULT '',
  release_date TEXT DEFAULT '',
  genre TEXT DEFAULT '',
  track_count INTEGER DEFAULT 0,
  is_verse_based INTEGER DEFAULT 0,
  total_duration_ms INTEGER DEFAULT 0,
  upc TEXT DEFAULT '',
  label TEXT DEFAULT '',
  copyright TEXT DEFAULT '',
  has_timing INTEGER DEFAULT 0,
  timing_base_url TEXT DEFAULT '',
  audio_base_url TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT DEFAULT '',
  track_number INTEGER NOT NULL,
  disc_number INTEGER DEFAULT 1,
  duration_ms INTEGER DEFAULT 8000,
  audio_url TEXT DEFAULT '',
  preview_url TEXT DEFAULT '',
  timing_json_url TEXT DEFAULT '',
  isrc TEXT DEFAULT '',
  has_timing INTEGER DEFAULT 0,
  lyrics TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (album_id) REFERENCES albums(id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_slug ON albums(slug);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
