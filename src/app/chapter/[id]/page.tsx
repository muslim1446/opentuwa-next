import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME } from '@/lib/configs'
import { ChapterClient } from './chapter-client'

export const runtime = 'edge'

const siteUrl = 'https://muslim.opentuwa.com'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  if (!ch) return { title: 'Chapter Not Found' }

  const title = `${ch.english_name} - Recitation by ${ARTIST_NAME}`
  const description = `Listen to ${ch.english_name} (Surah ${ch.chapter}) recited by ${ARTIST_NAME} from ${ALBUM_NAME}. ${ch.description}`
  const url = `${siteUrl}/chapter/${ch.chapter}`
  const ogImage = `https://opentuwa.com/assets/ui/web_1200.png`

  return {
    title,
    description,
    authors: [{ name: 'Tuwa Media' }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'music.song',
      siteName: 'Tuwa',
      locale: 'en_US',
      url,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${ch.english_name} - ${ARTIST_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@opentuwa',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  await cookies()
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const ch = SURAH_METADATA.find(s => s.chapter === id)
  if (!ch) notFound()

  const url = `${siteUrl}/chapter/${id}`
  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const verseCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  const musicRecordingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    '@id': url,
    name: ch.english_name,
    alternateName: `Surah ${ch.chapter}`,
    description: ch.description,
    url,
    position: ch.chapter,
    byArtist: {
      '@type': 'Person',
      name: ARTIST_NAME,
      jobTitle: 'Quran Reciter',
      url: siteUrl,
    },
    inAlbum: {
      '@type': 'MusicAlbum',
      name: ALBUM_NAME,
      url: siteUrl,
      numTracks: 114,
      byArtist: {
        '@type': 'Person',
        name: ARTIST_NAME,
        jobTitle: 'Quran Reciter',
      },
    },
    genre: ['Quran', 'Recitation'],
    isPartOf: {
      '@type': 'WebSite',
      name: 'Tuwa',
      url: siteUrl,
    },
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
      {
        '@type': 'ListItem',
        position: 2,
        name: ch.english_name,
        item: url,
      },
    ],
  }

  const audioObjectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: `${ch.english_name} - Recitation by ${ARTIST_NAME}`,
    description: ch.description,
    url,
    duration: verseCount > 0 ? `PT${Math.round(verseCount * 8)}S` : undefined,
    encodingFormat: 'audio/wav',
    inLanguage: 'ar',
    publisher: {
      '@type': 'Organization',
      name: 'Tuwa',
      url: siteUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(musicRecordingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(audioObjectJsonLd) }}
      />
      <ChapterClient chapterId={id} />
    </>
  )
}
