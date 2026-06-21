import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME, RECITERS_CONFIG } from '@/lib/configs'
import { buildRiwayahMetadata } from '@/lib/metadata'
import { riwayahJsonLd, breadcrumbJsonLd } from '@/lib/json-ld'
import { slugify, toISO8601Duration } from '@/lib/artwork'
import { Breadcrumb } from '@/components/Breadcrumb'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'
const DEFAULT_RECITER = 'alafasy'

export const revalidate = 86400

export async function generateStaticParams() {
  const storefronts = ['en', 'ar']
  const params: { storefront: string; slug: string; id: string }[] = []
  for (const sf of storefronts) {
    for (const [key] of Object.entries(RECITERS_CONFIG)) {
      params.push({ storefront: sf, slug: slugify(ALBUM_NAME), id: key })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const reciter = RECITERS_CONFIG[id]
  if (!reciter) return { title: 'Collection Not Found' }

  return buildRiwayahMetadata({
    riwayahName: ALBUM_NAME,
    riwayahSlug: slugify(ALBUM_NAME),
    riwayahId: id,
    reciterName: reciter.name,
    reciterSlug: slugify(reciter.name),
    reciterId: id,
    surahCount: SURAH_METADATA.length,
    storefront,
  })
}

export default async function RiwayahPage({ params, searchParams }: {
  params: Promise<{ storefront: string; slug: string; id: string }>
  searchParams: Promise<{ i?: string }>
}) {
  const { storefront, slug, id } = await params
  const sp = await searchParams
  const reciter = RECITERS_CONFIG[id]

  if (!reciter) notFound()

  const correctSlug = slugify(ALBUM_NAME)
  if (slug !== correctSlug) {
    const qs = sp.i ? `?i=${sp.i}` : ''
    redirect(`/${storefront}/riwayah/${correctSlug}/${id}${qs}`)
  }

  const activeTrackId = sp.i
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(reciter.name)}/${id}`
  const riwayahUrl = `${siteUrl}/${storefront}/riwayah/${correctSlug}/${id}`

  const tracks = SURAH_METADATA.map((s) => ({
    name: s.english_name,
    durationISO8601: toISO8601Duration(480),
    position: s.chapter,
  }))

  const albumLd = riwayahJsonLd({
    name: ALBUM_NAME,
    url: riwayahUrl,
    artist: { name: reciter.name, url: reciterUrl },
    tracks,
  })

  const crumbs = [
    { name: 'Home', href: `${siteUrl}/${storefront}` },
    { name: reciter.name, href: reciterUrl },
    { name: ALBUM_NAME, href: riwayahUrl },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(albumLd) }} />
      <Breadcrumb items={crumbs} />
      <div id="riwayah-root" data-album={id} data-active-track={activeTrackId || ''} />
    </>
  )
}
