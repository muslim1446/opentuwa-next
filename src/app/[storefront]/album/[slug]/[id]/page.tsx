export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG, ARTIST_NAME, PLATFORM_NAME, DEFAULT_STOREFRONT } from '@/lib/configs'
import { buildAlbumMetadata, slugify } from '@/lib/metadata'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { decodeAlbumId, decodeSongId, encodeAlbumId } from '@/lib/entity-ids'
import HomeClient from '@/app/home-client'

const siteUrl = 'https://muslim.opentuwa.com'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const decoded = decodeAlbumId(id)
  if (!decoded) return {}
  const ch = SURAH_METADATA.find(s => s.chapter === decoded.chapter)
  if (!ch) return {}

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

  const tracks = Array.from({ length: verseCount }, (_, i) => ({
    name: `Verse ${i + 1}`,
    durationISO8601: toISO8601Duration(8),
    position: i + 1,
  }))

  const jsonLd = albumJsonLd({
    name: ch.english_name,
    url,
    image: 'https://opentuwa.com/assets/ui/web_1200.png',
    datePublished: '',
    artist: { name: ARTIST_NAME, url: `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy` },
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
          { name: ARTIST_NAME, href: `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy` },
          { name: ch.english_name, href: url },
        ]}
      />
      <HomeClient />
    </>
  )
}
