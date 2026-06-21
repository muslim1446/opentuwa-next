import type { Metadata } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME, PLATFORM_NAME, SITE_URL } from '@/lib/configs'
import { encodeAlbumId } from '@/lib/entity-ids'
import { slugify } from '@/lib/metadata'
import { cookies } from 'next/headers'
import { fetchAlbums, fetchArtists } from '@/lib/data'
import HomeClient from './home-client'

export const runtime = 'edge'

const siteUrl = SITE_URL
const platform = PLATFORM_NAME

const description = `Premium distraction-free audio streaming with verse-by-verse navigation, multiple artists, and 50+ translations. Built for deep focus.`

export const metadata: Metadata = {
  title: `${platform} - Web Player`,
  description,
  authors: [{ name: 'Tuwa Media' }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    siteName: platform,
    locale: 'en_US',
    url: siteUrl,
    title: `${platform} - Web Player`,
    description,
    images: [
      {
        url: 'https://opentuwa.com/assets/ui/web_1200.png',
        width: 1200,
        height: 630,
        alt: `${platform} - Audio Player`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${platform} - Web Player`,
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

  let albums: { chapter: number; english_name: string; description: string }[]
  try {
    const a = await fetchAlbums()
    albums = a.map((x, i) => ({
      chapter: i + 1,
      english_name: x.title,
      description: x.description,
    }))
  } catch {
    albums = SURAH_METADATA
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${ALBUM_NAME} by ${ARTIST_NAME}`,
    description: 'Complete collection of 114 chapters.',
    numberOfItems: albums.length,
    url: siteUrl,
    itemListElement: albums.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicRecording',
        name: s.english_name,
        description: s.description,
        url: `${siteUrl}/us/album/${slugify(s.english_name)}/${encodeAlbumId(s.chapter)}`,
        position: s.chapter,
        byArtist: {
          '@type': 'MusicGroup',
          name: ARTIST_NAME,
        },
        inAlbum: {
          '@type': 'MusicAlbum',
          name: ALBUM_NAME,
          numTracks: albums.length,
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
