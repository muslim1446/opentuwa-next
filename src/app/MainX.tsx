'use client'

import Link from 'next/link'
import { slugify } from '@/lib/metadata'
import type { ArtistData, AlbumData, TrackData } from '@/lib/data'

function formatDuration(ms: number) {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function MainX({
  artists, albums, tracks,
}: {
  artists: ArtistData[]
  albums: AlbumData[]
  tracks: TrackData[]
}) {
  return (
    <div style={{
      background: '#000', minHeight: '100vh', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      paddingBottom: 80,
    }}>
      {/* Hero */}
      {albums[0] && (
        <Link
          href={`/us/album/${slugify(albums[0].title)}/${albums[0].id}`}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div style={{
            position: 'relative', height: '70vh', minHeight: 400,
            background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${albums[0].artwork_url || 'https://opentuwa.com/assets/ui/web_1200.png'}) center/cover`,
            display: 'flex', alignItems: 'flex-end', padding: '40px 24px',
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 8 }}>Featured Album</p>
              <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>{albums[0].title}</h1>
              <p style={{ fontSize: 14, opacity: 0.6, marginTop: 6 }}>{artists.find(a => a.id === albums[0].artist_id)?.name || ''}</p>
            </div>
          </div>
        </Link>
      )}

      <div style={{ padding: '0 24px' }}>
        {/* Albums Row */}
        <Section title="Albums">
          <ScrollRow>
            {albums.map(album => {
              const artist = artists.find(a => a.id === album.artist_id)
              return (
                <Link
                  key={album.id}
                  href={`/us/album/${slugify(album.title)}/${album.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card style={{ width: 180 }}>
                    <img
                      src={album.artwork_url || 'https://opentuwa.com/assets/ui/web_1200.png'}
                      alt={album.title}
                      style={{ width: 180, height: 180, borderRadius: 8, objectFit: 'cover', background: '#222' }}
                    />
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist?.name || 'Artist'}</p>
                  </Card>
                </Link>
              )
            })}
          </ScrollRow>
        </Section>

        {/* Artists Row */}
        <Section title="Artists">
          <ScrollRow>
            {artists.map(artist => (
              <Link
                key={artist.id}
                href={`/us/reciter/${slugify(artist.name)}/${artist.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card style={{ width: 160 }}>
                  <div style={{
                    width: 160, height: 160, borderRadius: '50%',
                    background: `url(${artist.image_url || artist.artwork_url || 'https://opentuwa.com/assets/ui/web_1200.png'}) center/cover`,
                  }} />
                  <p style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 2px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>Artist</p>
                </Card>
              </Link>
            ))}
          </ScrollRow>
        </Section>

        {/* Tracks Row */}
        {tracks.length > 0 && (
          <Section title="Tracks">
            <ScrollRow>
              {tracks.map(track => {
                const album = albums.find(a => a.id === track.album_id)
                return (
                  <Link
                    key={track.id}
                    href={`/us/song/${slugify(track.title)}/${track.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Card style={{ width: 200, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 4, flexShrink: 0,
                        background: `url(${album?.artwork_url || 'https://opentuwa.com/assets/ui/web_1200.png'}) center/cover`,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{formatDuration(track.duration_ms)}</p>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </ScrollRow>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>{title}</h2>
      {children}
    </section>
  )
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8,
      scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
    }}>
      {children}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      scrollSnapAlign: 'start',
      ...style,
    }}>
      {children}
    </div>
  )
}
