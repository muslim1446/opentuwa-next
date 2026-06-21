export const runtime = 'edge'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ARTIST_NAME } from '@/lib/configs'
import { buildAlbumMetadata, buildSongMetadata, slugify } from '@/lib/metadata'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { decodeSongId } from '@/lib/entity-ids'
import { fetchAlbumBySlug, fetchArtist, fetchTracks } from '@/lib/data'

const siteUrl = 'https://muslim.opentuwa.com'
const DEFAULT_ARTWORK = 'https://opentuwa.com/assets/ui/web_1200.png'

export const revalidate = 86400

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ storefront: string; slug: string }>
  searchParams: Promise<{ i?: string }>
}): Promise<Metadata> {
  const { storefront, slug } = await params
  const { i: songId } = await searchParams

  const album = await fetchAlbumBySlug(slug)
  if (!album) return {}
  const artist = await fetchArtist(album.artist_id)
  const artistName = artist?.name || ARTIST_NAME
  const artistSlug = slugify(artistName)

  if (songId) {
    const songDecoded = decodeSongId(songId)
    if (songDecoded) {
      const songSlug = slugify(album.title)
      const meta = buildSongMetadata({
        name: album.title,
        artistName,
        artistSlug,
        artistId: album.artist_id,
        albumName: album.title,
        albumSlug: songSlug,
        albumId: album.id,
        slug: songSlug,
        id: songId,
        storefront,
        artworkUrl: album.artwork_url || DEFAULT_ARTWORK,
        durationSeconds: Math.round((album.total_duration_ms || 8000) / 1000),
        trackNumber: songDecoded.verse,
      })
      return { ...meta, robots: { index: false, follow: true } }
    }
  }

  return buildAlbumMetadata({
    name: album.title,
    artistName,
    artistSlug,
    artistId: album.artist_id,
    slug,
    id: album.id,
    storefront,
    artworkUrl: album.artwork_url || DEFAULT_ARTWORK,
    trackCount: album.track_count,
    releaseDate: album.release_date || '',
    genres: album.genre ? [album.genre] : ['Quran', 'Recitation'],
  })
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ storefront: string; slug: string }>
}) {
  const { storefront, slug } = await params

  const album = await fetchAlbumBySlug(slug)
  if (!album) notFound()
  const artist = await fetchArtist(album.artist_id)
  if (!artist) notFound()

  const artistName = artist.name
  const url = `${siteUrl}/${storefront}/album/${slug}`
  const artistUrl = `${siteUrl}/${storefront}/reciter/${slugify(artistName)}/${album.artist_id}`

  const tracks = await fetchTracks(album.id)

  const jsonLd = albumJsonLd({
    name: album.title,
    url,
    image: album.artwork_url || DEFAULT_ARTWORK,
    datePublished: album.release_date || '',
    artist: { name: artistName, url: artistUrl },
    tracks: tracks.map(t => ({
      name: t.title,
      durationISO8601: toISO8601Duration(Math.round((t.duration_ms || 8000) / 1000)),
      position: t.track_number,
    })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto p-6" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumb
          items={[
            { name: 'Home', href: `${siteUrl}/${storefront}` },
            { name: artistName, href: artistUrl },
            { name: album.title, href: url },
          ]}
        />
        <div style={{ display: 'flex', gap: 20, marginTop: 24, marginBottom: 32 }}>
          <img
            src={album.artwork_url || DEFAULT_ARTWORK}
            alt={album.title}
            style={{ width: 180, height: 180, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{album.title}</h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '6px 0 4px' }}>{artistName}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{album.track_count} tracks</p>
            {album.description && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10, lineHeight: 1.5 }}>{album.description}</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tracks.map((track) => {
            const trackSlug = slugify(track.title)
            const displayId = String(track.track_number)
            const qs = album.is_verse_based && track.id ? `?t=${track.id}` : ''
            const href = `/${storefront}/song/${trackSlug}/${displayId}${qs}`
            return (
              <Link
                key={track.id}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ width: 24, textAlign: 'right', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{track.track_number}</span>
                <span style={{ flexGrow: 1 }}>{track.title}</span>
                {track.duration_ms ? (
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                    {Math.floor(track.duration_ms / 60000)}:{(track.duration_ms % 60000 / 1000).toFixed(0).padStart(2, '0')}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
