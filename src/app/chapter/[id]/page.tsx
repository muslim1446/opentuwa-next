import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ChapterClient } from './chapter-client'

export const runtime = 'edge'

const siteUrl = 'https://muslim.opentuwa.com'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  if (!ch) return { title: 'Chapter Not Found' }

  const title = `${ch.english_name} (${ch.chapter}) - Tuwa Quran Audio Player`
  const description = ch.description
  const url = `${siteUrl}/chapter/${ch.chapter}`

  return {
    title,
    description,
    openGraph: {
      siteName: 'Tuwa',
      title,
      description,
      type: 'website',
      locale: 'en_US',
      url,
      images: [{ url: `${siteUrl}/assets/ui/web_1200.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@opentuwa',
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  }
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  await cookies()
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const ch = SURAH_METADATA.find(s => s.chapter === id)
  if (!ch) notFound()

  const url = `${siteUrl}/chapter/${id}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${ch.english_name} - Tuwa`,
    description: ch.description,
    url,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: `${ch.english_name} (${id})`, item: url },
      ],
    },
    mainEntity: {
      '@type': 'AudioObject',
      name: `Surah ${ch.english_name} (${id})`,
      description: ch.description,
      url,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChapterClient chapterId={id} />
    </>
  )
}
