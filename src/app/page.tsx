import type { Metadata } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { cookies } from 'next/headers'
import HomeClient from './home-client'

export const runtime = 'edge'

const siteUrl = 'https://muslim.opentuwa.com'

const description = 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations. Built for deep focus.'

export const metadata: Metadata = {
  title: 'Tuwa - Premium Quran Audio Player',
  description,
  authors: [{ name: 'Tuwa Media' }],
  manifest: '/manifest.json',
  openGraph: {
    siteName: 'Tuwa',
    title: 'Tuwa - Premium Quran Audio Player',
    description,
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    images: [{ url: `https://opentuwa.com/assets/ui/web_1200.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuwa - Premium Quran Audio Player',
    description,
    site: '@opentuwa',
  },
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
}

export default async function HomePage() {
  await cookies()
  const surahCount = SURAH_METADATA.length
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tuwa - Premium Quran Audio Player',
    description,
    url: siteUrl,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Quran Surahs',
      itemListElement: SURAH_METADATA.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'AudioObject',
          name: `${s.english_name} (${s.chapter})`,
          description: s.description,
          url: `${siteUrl}/chapter/${s.chapter}`,
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  )
}
