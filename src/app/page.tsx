import type { Metadata } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME } from '@/lib/configs'
import { cookies } from 'next/headers'
import HomeClient from './home-client'

export const runtime = 'edge'

const siteUrl = 'https://muslim.opentuwa.com'

const description = 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations. Built for deep focus.'

export const metadata: Metadata = {
  title: 'Tuwa - Web Player',
  description,
  authors: [{ name: 'Tuwa Media' }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    siteName: 'Tuwa',
    locale: 'en_US',
    url: siteUrl,
    title: 'Tuwa - Web Player',
    description,
    images: [
      {
        url: 'https://opentuwa.com/assets/ui/web_1200.png',
        width: 1200,
        height: 630,
        alt: 'Tuwa - Quran Audio Player',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuwa - Web Player',
    description,
    site: '@opentuwa',
    images: ['https://opentuwa.com/assets/ui/web_1200.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function HomePage() {
  await cookies()

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${ALBUM_NAME} - Recitations by ${ARTIST_NAME}`,
    description: 'Complete collection of 114 Surahs of the Quran recited by Mishari Rashid Alafasy',
    numberOfItems: 114,
    url: siteUrl,
    itemListElement: SURAH_METADATA.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicRecording',
        name: s.english_name,
        alternateName: `Surah ${s.chapter}`,
        description: s.description,
        url: `${siteUrl}/chapter/${s.chapter}`,
        position: s.chapter,
        byArtist: {
          '@type': 'Person',
          name: ARTIST_NAME,
          jobTitle: 'Quran Reciter',
        },
        inAlbum: {
          '@type': 'MusicAlbum',
          name: ALBUM_NAME,
          numTracks: 114,
        },
      },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HomeClient />
    </>
  )
}
