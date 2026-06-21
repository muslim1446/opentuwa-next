import { SITE_URL, PLATFORM_NAME, ARTIST_NAME, ALBUM_NAME } from '@/lib/configs'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'

const SITE = SITE_URL
const NAME = PLATFORM_NAME

type JsonLd = Record<string, unknown>

function orgNode(storefront: string): JsonLd {
  return {
    '@type': 'Organization',
    '@id': `${SITE}/${storefront}/#organization`,
    name: NAME,
    alternateName: `${NAME} Audio Player`,
    url: `${SITE}/${storefront}`,
    logo: {
      '@type': 'ImageObject',
      url: 'https://opentuwa.com/assets/ui/favicon-96x96.png',
      width: 96,
      height: 96,
    },
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
  }
}

function websiteNode(storefront: string): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/${storefront}/#website`,
    url: `${SITE}/${storefront}`,
    name: NAME,
    alternateName: `${NAME} Audio Player`,
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    publisher: { '@id': `${SITE}/${storefront}/#organization` },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE}/${storefront}/search?term={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

function artistNode(reciter: { name: string }, url: string): JsonLd {
  return {
    '@type': 'MusicGroup',
    name: reciter.name,
    url,
    image: 'https://opentuwa.com/assets/ui/web_1200.png',
    genre: ['Quran', 'Recitation'],
  }
}

function albumNode(chapter: { english_name: string; description: string }, url: string, reciterUrl: string, verseCount: number): JsonLd {
  return {
    '@type': 'MusicAlbum',
    name: chapter.english_name,
    url,
    image: 'https://opentuwa.com/assets/ui/web_1200.png',
    byArtist: { '@type': 'MusicGroup', name: ARTIST_NAME, url: reciterUrl },
    numTracks: verseCount,
    track: {
      '@type': 'ItemList',
      itemListElement: Array.from({ length: verseCount }, (_, i) => ({
        '@type': 'MusicRecording',
        position: i + 1,
        name: `Verse ${i + 1}`,
      })),
    },
  }
}

function recordingNode(chapter: { english_name: string }, url: string, reciterUrl: string, albumUrl: string, durationISO?: string): JsonLd {
  return {
    '@type': 'MusicRecording',
    name: chapter.english_name,
    url,
    image: 'https://opentuwa.com/assets/ui/web_1200.png',
    ...(durationISO ? { duration: durationISO } : {}),
    byArtist: { '@type': 'MusicGroup', name: ARTIST_NAME, url: reciterUrl },
    inAlbum: { '@type': 'MusicAlbum', name: chapter.english_name, url: albumUrl },
  }
}

function itemListChapterNode(storefront: string): JsonLd {
  return {
    '@type': 'ItemList',
    name: `${ALBUM_NAME} by ${ARTIST_NAME}`,
    description: 'Complete collection of 114 chapters.',
    numberOfItems: 114,
    url: `${SITE}/${storefront}`,
    itemListElement: SURAH_METADATA.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicRecording',
        name: s.english_name,
        description: s.description,
        url: `${SITE}/${storefront}/album/${slugify(s.english_name)}/${encodeAlbumId(s.chapter)}`,
        byArtist: { '@type': 'MusicGroup', name: ARTIST_NAME },
        inAlbum: { '@type': 'MusicAlbum', name: ALBUM_NAME, numTracks: 114 },
      },
    })),
  }
}

function homeBreadcrumbNode(storefront: string): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/${storefront}` },
    ],
  }
}

function albumBreadcrumbNode(storefront: string, chapter: { english_name: string }, chapterUrl: string): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/${storefront}` },
      { '@type': 'ListItem', position: 2, name: ARTIST_NAME, item: `${SITE}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy` },
      { '@type': 'ListItem', position: 3, name: chapter.english_name, item: chapterUrl },
    ],
  }
}

function songBreadcrumbNode(storefront: string, chapter: { english_name: string }, chapterUrl: string, songUrl: string, verseNum: number): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/${storefront}` },
      { '@type': 'ListItem', position: 2, name: ARTIST_NAME, item: `${SITE}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy` },
      { '@type': 'ListItem', position: 3, name: chapter.english_name, item: chapterUrl },
      { '@type': 'ListItem', position: 4, name: `Verse ${verseNum}`, item: songUrl },
    ],
  }
}

function artistBreadcrumbNode(storefront: string, reciter: { name: string }, url: string): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/${storefront}` },
      { '@type': 'ListItem', position: 2, name: reciter.name, item: url },
    ],
  }
}

interface GraphSchemaProps {
  type: 'homepage' | 'chapter' | 'album' | 'song' | 'reciter'
  data?: Record<string, unknown>
  storefront?: string
}

export function GraphSchema({ type, data, storefront = 'us' }: GraphSchemaProps) {
  let graph: JsonLd[]

  switch (type) {
    case 'homepage':
      graph = [orgNode(storefront), websiteNode(storefront), itemListChapterNode(storefront), homeBreadcrumbNode(storefront)]
      break

    case 'chapter':
    case 'album': {
      const d = data as { chapter: { english_name: string; description: string }; verseCount: number; url: string; reciterUrl: string } | undefined
      if (!d) return null
      graph = [
        orgNode(storefront),
        albumNode(d.chapter, d.url, d.reciterUrl, d.verseCount),
        albumBreadcrumbNode(storefront, d.chapter, d.url),
      ]
      break
    }

    case 'song': {
      const d = data as { chapter: { english_name: string }; url: string; reciterUrl: string; albumUrl: string; verseNum: number; albumChapterUrl?: string; durationISO?: string } | undefined
      if (!d) return null
      graph = [
        orgNode(storefront),
        recordingNode(d.chapter, d.url, d.reciterUrl, d.albumUrl, d.durationISO),
        songBreadcrumbNode(storefront, d.chapter, d.albumChapterUrl || d.albumUrl, d.url, d.verseNum),
      ]
      break
    }

    case 'reciter': {
      const d = data as { reciter: { name: string }; url: string } | undefined
      if (!d) return null
      graph = [
        orgNode(storefront),
        artistNode(d.reciter, d.url),
        artistBreadcrumbNode(storefront, d.reciter, d.url),
      ]
      break
    }

    default:
      graph = [orgNode(storefront)]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  )
}
