export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME } from '@/lib/configs'
import { buildAlbumMetadata, slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { fetchAlbum, fetchArtist } from '@/lib/data'
import { ChapterClient } from './chapter-client'

const siteUrl = 'https://muslim.opentuwa.com'
const storefront = 'us'
const DEFAULT_ARTWORK = 'https://opentuwa.com/assets/ui/web_1200.png'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const albumId = encodeAlbumId(parseInt(id))
  let album = await fetchAlbum(albumId)
  let artist = album ? await fetchArtist(album.artist_id) : null

  if (!album) {
    const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
    if (!ch) return { title: 'Not Found' }
    const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
    const trackCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0
    return buildAlbumMetadata({
      name: ch.english_name, artistName: ARTIST_NAME, artistSlug: slugify(ARTIST_NAME),
      artistId: 'alafasy', slug: slugify(ch.english_name), id: albumId, storefront,
      artworkUrl: DEFAULT_ARTWORK, trackCount, releaseDate: '', genres: ['Quran', 'Recitation'],
    })
  }

  return buildAlbumMetadata({
    name: album.title, artistName: artist?.name || ARTIST_NAME,
    artistSlug: slugify(artist?.name || ARTIST_NAME),
    artistId: album.artist_id, slug: slugify(album.title), id: albumId, storefront,
    artworkUrl: album.artwork_url || DEFAULT_ARTWORK,
    trackCount: album.track_count, releaseDate: album.release_date || '',
    genres: album.genre ? [album.genre] : ['Quran', 'Recitation'],
  })
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  await cookies()
  const { id: idStr } = await params
  const chapterNum = parseInt(idStr)

  const albumId = encodeAlbumId(chapterNum)
  let album = await fetchAlbum(albumId)
  let artist = album ? await fetchArtist(album.artist_id) : null

  if (!album) {
    const ch = SURAH_METADATA.find(s => s.chapter === chapterNum)
    if (!ch) notFound()

    const surahUrl = `${siteUrl}/${storefront}/album/${slugify(ch.english_name)}/${albumId}`
    const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy`
    const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
    const verseCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0
    const tracks = Array.from({ length: verseCount }, (_, i) => ({
      name: `Track ${i + 1}`,
      durationISO8601: toISO8601Duration(8),
      position: i + 1,
    }))
    const jsonLd = albumJsonLd({
      name: ch.english_name, url: surahUrl, image: DEFAULT_ARTWORK, datePublished: '',
      artist: { name: ARTIST_NAME, url: reciterUrl }, tracks,
    })

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Breadcrumb items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: ARTIST_NAME, href: reciterUrl },
          { name: ch.english_name, href: surahUrl },
        ]} />
        <ChapterClient chapterId={chapterNum} />
      </>
    )
  }

  const artistName = artist?.name || ARTIST_NAME
  const surahUrl = `${siteUrl}/${storefront}/album/${slugify(album.title)}/${albumId}`
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(artistName)}/${album.artist_id}`
  const tracks = Array.from({ length: album.track_count }, (_, i) => ({
    name: `Track ${i + 1}`,
    durationISO8601: toISO8601Duration(Math.round((album.total_duration_ms || 8000) / Math.max(1, album.track_count) / 1000) || 8),
    position: i + 1,
  }))
  const jsonLd = albumJsonLd({
    name: album.title, url: surahUrl, image: album.artwork_url || DEFAULT_ARTWORK,
    datePublished: album.release_date || '',
    artist: { name: artistName, url: reciterUrl }, tracks,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[
        { name: 'Home', href: `${siteUrl}/${storefront}` },
        { name: artistName, href: reciterUrl },
        { name: album.title, href: surahUrl },
      ]} />
      <ChapterClient chapterId={chapterNum} />
    </>
  )
}
