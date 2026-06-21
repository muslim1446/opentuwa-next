import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME, RECITERS_CONFIG } from '@/lib/configs'
import { buildAlbumMetadata, slugify } from '@/lib/metadata'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import HomeClient from '@/app/home-client'

const siteUrl = 'https://muslim.opentuwa.com'

export async function generateStaticParams() {
  return SURAH_METADATA.map((s) => ({
    slug: slugify(s.english_name),
    id: String(s.chapter),
  }))
}

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, slug: paramSlug, id } = await params
  const chNum = parseInt(id)
  const ch = SURAH_METADATA.find(s => s.chapter === chNum)
  if (!ch) return {}

  const correctSlug = slugify(ch.english_name)
  const artistSlug = slugify(ARTIST_NAME)
  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const trackCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  return buildAlbumMetadata({
    name: ch.english_name,
    artistName: ARTIST_NAME,
    artistSlug,
    artistId: 'alafasy',
    slug: correctSlug,
    id: String(chNum),
    storefront,
    artworkUrl: 'https://opentuwa.com/assets/ui/web_1200.png',
    trackCount,
    releaseDate: '',
    genres: ['Quran', 'Recitation'],
  })
}

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
  searchParams: Promise<{ i?: string; reciter?: string; trans?: string; audio_trans?: string }>
}) {
  const { storefront, slug: paramSlug, id } = await params
  const { i: verseParam, reciter, trans, audio_trans } = await searchParams
  const chNum = parseInt(id)
  const ch = SURAH_METADATA.find(s => s.chapter === chNum)
  if (!ch) notFound()

  const correctSlug = slugify(ch.english_name)
  if (paramSlug !== correctSlug) {
    const target = `/${storefront}/surah/${correctSlug}/${chNum}`
    const qs = new URLSearchParams()
    if (verseParam) qs.set('i', verseParam)
    if (reciter) qs.set('reciter', reciter)
    if (trans) qs.set('trans', trans)
    if (audio_trans) qs.set('audio_trans', audio_trans)
    const qstr = qs.toString()
    redirect(target + (qstr ? `?${qstr}` : ''))
  }

  const url = `${siteUrl}/${storefront}/surah/${correctSlug}/${chNum}`
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

  const defaultReciter = reciter && RECITERS_CONFIG[reciter] ? reciter : 'alafasy'
  const defaultTrans = trans || 'en'
  const defaultAudioTrans = audio_trans || 'none'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: ARTIST_NAME, href: `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/${defaultReciter}` },
          { name: ch.english_name, href: url },
        ]}
      />
      <HomeClient />
    </>
  )
}
