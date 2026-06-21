import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME, RECITERS_CONFIG } from '@/lib/configs'
import { buildSurahMetadata } from '@/lib/metadata'
import { surahJsonLd, breadcrumbJsonLd } from '@/lib/json-ld'
import { slugify, toISO8601Duration } from '@/lib/artwork'
import { Breadcrumb } from '@/components/Breadcrumb'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'
const DEFAULT_RECITER = 'alafasy'
const DEFAULT_STOREFRONT = 'en'

export const revalidate = 86400

export async function generateStaticParams() {
  const storefronts = ['en', 'ar']
  const params: { storefront: string; slug: string; id: string }[] = []
  for (const sf of storefronts) {
    for (const s of SURAH_METADATA) {
      params.push({ storefront: sf, slug: slugify(s.english_name), id: String(s.chapter) })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  if (!ch) return { title: 'Surah Not Found' }

  return buildSurahMetadata({
    chapter: ch.chapter,
    surahName: ch.english_name,
    reciterName: ARTIST_NAME,
    riwayahName: ALBUM_NAME,
    reciterSlug: slugify(ARTIST_NAME),
    reciterId: DEFAULT_RECITER,
    description: ch.description,
    storefront,
  })
}

export default async function SurahPage({ params, searchParams }: {
  params: Promise<{ storefront: string; slug: string; id: string }>
  searchParams: Promise<{ i?: string; reciter?: string; trans?: string; verse?: string }>
}) {
  const { storefront, slug, id } = await params
  const sp = await searchParams
  const chapter = parseInt(id)
  const ch = SURAH_METADATA.find(s => s.chapter === chapter)

  if (!ch) notFound()

  const correctSlug = slugify(ch.english_name)
  if (slug !== correctSlug) {
    const newUrl = `/${storefront}/surah/${correctSlug}/${id}`
    const qs = new URLSearchParams()
    if (sp.reciter) qs.set('reciter', sp.reciter)
    if (sp.trans) qs.set('trans', sp.trans)
    if (sp.verse) qs.set('verse', sp.verse)
    if (sp.i) qs.set('i', sp.i)
    const q = qs.toString()
    redirect(newUrl + (q ? `?${q}` : ''))
  }

  const activeTrackId = sp.i || sp.verse
  const reciterId = sp.reciter || DEFAULT_RECITER
  const reciterName = RECITERS_CONFIG[reciterId]?.name || ARTIST_NAME

  const surahUrl = `${siteUrl}/${storefront}/surah/${correctSlug}/${id}`
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(reciterName)}/${reciterId}`
  const riwayahUrl = `${siteUrl}/${storefront}/riwayah/${slugify(ALBUM_NAME)}/${reciterId}`

  const estimatedDuration = 480
  const isoDuration = toISO8601Duration(estimatedDuration)

  const songLd = surahJsonLd({
    name: ch.english_name,
    url: surahUrl,
    durationISO8601: isoDuration,
    artist: { name: reciterName, url: reciterUrl },
    album: { name: ALBUM_NAME, url: riwayahUrl },
  })

  const crumbs = [
    { name: 'Home', href: `${siteUrl}/${storefront}` },
    { name: reciterName, href: reciterUrl },
    { name: ALBUM_NAME, href: riwayahUrl },
    { name: ch.english_name, href: surahUrl },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(songLd) }} />
      <Breadcrumb items={crumbs} />
      <div id="chapter-root" data-chapter={chapter} data-reciter={reciterId} data-verse={activeTrackId || '1'} />
    </>
  )
}
