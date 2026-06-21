export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ARTIST_NAME } from '@/lib/configs'
import { buildAlbumMetadata, slugify } from '@/lib/metadata'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { fetchAlbum, fetchArtist, fetchTracks } from '@/lib/data'
import AlbumDetail from './AlbumDetail'

const siteUrl = 'https://muslim.opentuwa.com'
const DEFAULT_ARTWORK = 'https://opentuwa.com/assets/ui/web_1200.png'

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
}): Promise<Metadata> {
  const { storefront, id } = await params

  const album = await fetchAlbum(id)
  if (!album) return {}
  const artist = await fetchArtist(album.artist_id)
  const artistName = artist?.name || ARTIST_NAME
  const artistSlug = slugify(artistName)

  return buildAlbumMetadata({
    name: album.title,
    artistName,
    artistSlug,
    artistId: album.artist_id,
    slug: slugify(album.title),
    id,
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
  params: Promise<{ storefront: string; slug: string; id: string }>
  searchParams: Promise<{ i?: string; reciter?: string; trans?: string; audio_trans?: string }>
}) {
  const { storefront, id } = await params

  const album = await fetchAlbum(id)
  if (!album) notFound()
  const artist = await fetchArtist(album.artist_id)
  if (!artist) notFound()

  const tracks = await fetchTracks(id)

  const artistName = artist.name
  const correctSlug = slugify(album.title)

  const url = `${siteUrl}/${storefront}/album/${correctSlug}/${id}`
  const artistUrl = `${siteUrl}/${storefront}/reciter/${slugify(artistName)}/${album.artist_id}`

  const jsonLd = albumJsonLd({
    name: album.title,
    url,
    image: album.artwork_url || DEFAULT_ARTWORK,
    datePublished: album.release_date || '',
    artist: { name: artistName, url: artistUrl },
    tracks: tracks.map(t => ({
      name: t.title,
      durationISO8601: toISO8601Duration(Math.round(t.duration_ms / 1000)),
      position: t.track_number,
    })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: artistName, href: artistUrl },
          { name: album.title, href: url },
        ]}
      />
      <AlbumDetail album={album} artist={artist} tracks={tracks} storefront={storefront} />
    </>
  )
}
