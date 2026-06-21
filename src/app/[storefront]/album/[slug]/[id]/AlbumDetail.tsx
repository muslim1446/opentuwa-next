'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { slugify } from '@/lib/metadata'
import type { AlbumData, ArtistData, TrackData } from '@/lib/data'

function formatDuration(ms: number) {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function AlbumDetail({
  album, artist, tracks, storefront,
}: {
  album: AlbumData
  artist: ArtistData
  tracks: TrackData[]
  storefront: string
}) {
  const searchParams = useSearchParams()
  const playingId = searchParams.get('i')

  return (
    <div style={{
      background: '#000', minHeight: '100vh', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', gap: 24, padding: '24px 24px 32px',
        alignItems: 'flex-end',
        background: 'linear-gradient(rgba(0,0,0,0.6), #000)',
      }}>
        <img
          src={album.artwork_url || 'https://opentuwa.com/assets/ui/web_1200.png'}
          alt={album.title}
          style={{ width: 220, height: 220, borderRadius: 12, objectFit: 'cover', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.6, marginBottom: 6 }}>Album</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{album.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 14, opacity: 0.7 }}>
            <Link href={`/${storefront}/reciter/${slugify(artist.name)}/${artist.id}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              {artist.name}
            </Link>
            {album.release_date && <span>· {album.release_date.slice(0, 4)}</span>}
            <span>· {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
            {album.genre && <span>· {album.genre}</span>}
          </div>
          {album.description && (
            <p style={{ fontSize: 13, opacity: 0.5, marginTop: 8, maxWidth: 500, lineHeight: 1.4 }}>{album.description}</p>
          )}
        </div>
      </div>

      {/* Track list */}
      <div style={{ padding: '0 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
          padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none',
            background: '#1ed760', color: '#000', fontSize: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ▶
          </button>
          <button style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            fontSize: 22, padding: 4, display: 'flex', alignItems: 'center',
          }}>
            ↓
          </button>
        </div>

        {/* Column headers */}
        <div style={{
          display: 'flex', gap: 12, padding: '4px 8px', marginBottom: 4,
          fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ width: 32, textAlign: 'center' }}>#</span>
          <span style={{ flex: 1 }}>Title</span>
          <span style={{ width: 48, textAlign: 'right' }}>⏱</span>
        </div>

        {tracks.map((track, idx) => (
          <Link
            key={track.id}
            href={`/${storefront}/song/${slugify(track.title)}/${track.id}`}
            style={{
              textDecoration: 'none', color: 'inherit',
              display: 'flex', gap: 12, alignItems: 'center',
              padding: '8px 8px', borderRadius: 6,
              background: playingId === track.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              fontSize: 14,
            }}
            onMouseEnter={e => { if (playingId !== track.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (playingId !== track.id) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{
              width: 32, textAlign: 'center', fontSize: 13,
              color: playingId === track.id ? '#1ed760' : 'rgba(255,255,255,0.4)',
              fontWeight: playingId === track.id ? 600 : 400,
            }}>
              {playingId === track.id ? '🔊' : track.track_number}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontSize: 14,
                color: playingId === track.id ? '#1ed760' : '#fff',
                fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {track.title}
              </p>
            </div>
            <span style={{ width: 48, textAlign: 'right', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {formatDuration(track.duration_ms)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
