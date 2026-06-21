export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME } from '@/lib/configs'
import { buildAlbumMetadata, buildSongMetadata, slugify } from '@/lib/metadata'
import { Breadcrumb } from '@/components/Breadcrumb'
import { GraphSchema } from '@/components/GraphSchema'
import { decodeAlbumId, decodeSongId } from '@/lib/entity-ids'
import HomeClient from '@/app/home-client'

const siteUrl = 'https://muslim.opentuwa.com'

export const revalidate = 86400

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
  searchParams: Promise<{ i?: string }>
}): Promise<Metadata> {
  const { storefront, id } = await params
  const { i: songId } = await searchParams

  const decoded = decodeAlbumId(id)
  if (!decoded) return {}
  const ch = SURAH_METADATA.find(s => s.chapter === decoded.chapter)
  if (!ch) return {}

  // When ?i= is present (deep-link to a specific track), canonical points to the song page
  // and we set noindex to avoid duplicate-content dilution (see guide §1)
  if (songId) {
    const songDecoded = decodeSongId(songId)
    if (songDecoded) {
      const songSlug = slugify(ch.english_name)
      const meta = buildSongMetadata({
        name: ch.english_name,
        artistName: ARTIST_NAME,
        artistSlug: slugify(ARTIST_NAME),
        artistId: 'alafasy',
        albumName: ch.english_name,
        albumSlug: songSlug,
        albumId: id,
        slug: songSlug,
        id: songId,
        storefront,
        artworkUrl: 'https://opentuwa.com/assets/ui/web_1200.png',
        durationSeconds: 8,
        trackNumber: songDecoded.verse,
      })
      return { ...meta, robots: { index: false, follow: true } }
    }
  }

  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const trackCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  return buildAlbumMetadata({
    name: ch.english_name,
    artistName: ARTIST_NAME,
    artistSlug: slugify(ARTIST_NAME),
    artistId: 'alafasy',
    slug: slugify(ch.english_name),
    id,
    storefront,
    artworkUrl: 'https://opentuwa.com/assets/ui/web_1200.png',
    trackCount,
    releaseDate: '',
    genres: ['Quran', 'Recitation'],
  })
}

export default async function AlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
  searchParams: Promise<{ i?: string; reciter?: string; trans?: string; audio_trans?: string }>
}) {
  const { storefront, slug: paramSlug, id } = await params
  const { i: songIdParam, reciter: reciterParam, trans: transParam, audio_trans: audioTransParam } = await searchParams

  const decoded = decodeAlbumId(id)
  if (!decoded) notFound()
  const chNum = decoded.chapter
  const ch = SURAH_METADATA.find(s => s.chapter === chNum)
  if (!ch) notFound()

  const correctSlug = slugify(ch.english_name)
  if (paramSlug !== correctSlug) {
    const target = `/${storefront}/album/${correctSlug}/${id}`
    const qs = new URLSearchParams()
    if (songIdParam) qs.set('i', songIdParam)
    if (reciterParam) qs.set('reciter', reciterParam)
    if (transParam) qs.set('trans', transParam)
    if (audioTransParam) qs.set('audio_trans', audioTransParam)
    const qstr = qs.toString()
    redirect(target + (qstr ? `?${qstr}` : ''))
  }

  const url = `${siteUrl}/${storefront}/album/${correctSlug}/${id}`
  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const verseCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy`

  return (
    <>
      <GraphSchema
        type="album"
        data={{ chapter: ch, verseCount, url, reciterUrl }}
        storefront={storefront}
      />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: ARTIST_NAME, href: reciterUrl },
          { name: ch.english_name, href: url },
        ]}
      />
      <HomeClient />
    </>
  )
}
