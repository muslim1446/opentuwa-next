export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, PLATFORM_NAME } from '@/lib/configs'
import { buildSongMetadata, slugify } from '@/lib/metadata'
import { songJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { decodeSongId, encodeAlbumId } from '@/lib/entity-ids'
import { fetchAlbum, fetchArtist, fetchTrack, fetchTracks } from '@/lib/data'
import HomeClient from '@/app/home-client'

const siteUrl = 'https://muslim.opentuwa.com'
const DEFAULT_ARTWORK = 'https://opentuwa.com/assets/ui/web_1200.png'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const decoded = decodeSongId(id)
  if (!decoded) return {}

  const track = await fetchTrack(id)
  const album = track ? await fetchAlbum(track.album_id) : null
  const artist = track ? await fetchArtist(track.artist_id) : null

  const songName = track?.title || (() => {
    const ch = SURAH_METADATA.find(s => s.chapter === decoded.chapter)
    return ch?.english_name || ''
  })()
  const artistName = artist?.name || ARTIST_NAME
  const artistSlug = slugify(artistName)
  const albumName = album?.title || songName
  const albumSlug = slugify(albumName)
  const albumId = album?.id || encodeAlbumId(decoded.chapter)
  const artworkUrl = album?.artwork_url || DEFAULT_ARTWORK
  const durationMs = track?.duration_ms || 8000

  return buildSongMetadata({
    name: songName,
    artistName,
    artistSlug,
    artistId: track?.artist_id || 'alafasy',
    albumName,
    albumSlug,
    albumId,
    slug: slugify(songName),
    id,
    storefront,
    artworkUrl,
    durationSeconds: Math.round(durationMs / 1000),
    trackNumber: decoded.verse,
  })
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
}) {
  const { storefront, slug: paramSlug, id } = await params

  const decoded = decodeSongId(id)
  if (!decoded) notFound()

  const track = await fetchTrack(id)
  const album = track ? await fetchAlbum(track.album_id) : null
  const artist = track ? await fetchArtist(track.artist_id) : null

  const songName = track?.title || (() => {
    const ch = SURAH_METADATA.find(s => s.chapter === decoded.chapter)
    return ch?.english_name || ''
  })()
  const artistName = artist?.name || ARTIST_NAME
  const albumName = album?.title || songName
  const correctSlug = slugify(songName)

  if (paramSlug !== correctSlug) {
    redirect(`/${storefront}/song/${correctSlug}/${id}`)
  }

  const url = `${siteUrl}/${storefront}/song/${correctSlug}/${id}`
  const albumId = album?.id || encodeAlbumId(decoded.chapter)
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(artistName)}/${track?.artist_id || 'alafasy'}`
  const albumUrl = `${siteUrl}/${storefront}/album/${slugify(albumName)}/${albumId}`

  const jsonLd = songJsonLd({
    name: songName,
    url,
    image: album?.artwork_url || DEFAULT_ARTWORK,
    durationISO8601: toISO8601Duration(Math.round((track?.duration_ms || 8000) / 1000)),
    artist: { name: artistName, url: reciterUrl },
    album: { name: albumName, url: albumUrl },
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
          { name: artistName, href: reciterUrl },
          { name: albumName, href: albumUrl },
          { name: songName, href: url },
        ]}
      />
      <HomeClient />
    </>
  )
}
