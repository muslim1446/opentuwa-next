export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ARTIST_NAME } from '@/lib/configs'
import { buildAlbumMetadata, buildSongMetadata, slugify } from '@/lib/metadata'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { decodeSongId } from '@/lib/entity-ids'
import { fetchAlbumBySlug, fetchArtist, fetchTracks } from '@/lib/data'
import HomeClient from '@/app/home-client'

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
  searchParams,
}: {
  params: Promise<{ storefront: string; slug: string }>
  searchParams: Promise<{ i?: string; reciter?: string; trans?: string; audio_trans?: string }>
}) {
  const { storefront, slug } = await params
  const { i: songIdParam } = await searchParams

  const album = await fetchAlbumBySlug(slug)
  if (!album) notFound()
  const artist = await fetchArtist(album.artist_id)
  if (!artist) notFound()

  const artistName = artist.name
  const url = `${siteUrl}/${storefront}/album/${slug}`
  const artistUrl = `${siteUrl}/${storefront}/reciter/${slugify(artistName)}/${album.artist_id}`

  const tracks = Array.from({ length: album.track_count }, (_, i) => ({
    name: `Track ${i + 1}`,
    durationISO8601: toISO8601Duration(Math.round((album.total_duration_ms || 8000) / album.track_count / 1000) || 8),
    position: i + 1,
  }))

  const jsonLd = albumJsonLd({
    name: album.title,
    url,
    image: album.artwork_url || DEFAULT_ARTWORK,
    datePublished: album.release_date || '',
    artist: { name: artistName, url: artistUrl },
    tracks,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: artistName, href: artistUrl },
          { name: album.title, href: url },
        ]}
      />
      <HomeClient />
    </>
  )
}
