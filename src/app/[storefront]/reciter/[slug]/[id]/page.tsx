import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, RECITERS_CONFIG } from '@/lib/configs'
import { buildReciterMetadata } from '@/lib/metadata'
import { reciterJsonLd, breadcrumbJsonLd } from '@/lib/json-ld'
import { slugify } from '@/lib/artwork'
import { Breadcrumb } from '@/components/Breadcrumb'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'

export const revalidate = 86400

export async function generateStaticParams() {
  const storefronts = ['en', 'ar']
  const params: { storefront: string; slug: string; id: string }[] = []
  for (const sf of storefronts) {
    for (const [key, reciter] of Object.entries(RECITERS_CONFIG)) {
      params.push({ storefront: sf, slug: slugify(reciter.name), id: key })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const reciter = RECITERS_CONFIG[id]
  if (!reciter) return { title: 'Reciter Not Found' }

  return buildReciterMetadata({
    reciterName: reciter.name,
    reciterSlug: slugify(reciter.name),
    reciterId: id,
    surahCount: SURAH_METADATA.length,
    storefront,
  })
}

export default async function ReciterPage({ params }: {
  params: Promise<{ storefront: string; slug: string; id: string }>
}) {
  const { storefront, slug, id } = await params
  const reciter = RECITERS_CONFIG[id]

  if (!reciter) notFound()

  const correctSlug = slugify(reciter.name)
  if (slug !== correctSlug) {
    redirect(`/${storefront}/reciter/${correctSlug}/${id}`)
  }

  const reciterUrl = `${siteUrl}/${storefront}/reciter/${correctSlug}/${id}`

  const artistLd = reciterJsonLd({
    name: reciter.name,
    url: reciterUrl,
    genres: ['Quran', 'Recitation'],
  })

  const crumbs = [
    { name: 'Home', href: `${siteUrl}/${storefront}` },
    { name: reciter.name, href: reciterUrl },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(artistLd) }} />
      <Breadcrumb items={crumbs} />
      <div id="reciter-root" data-reciter={id} />
    </>
  )
}
