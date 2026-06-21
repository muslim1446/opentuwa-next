import type { Metadata } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'
const SITE_NAME = 'Tuwa'

const STOREFRONTS = ['en', 'ar', 'fr', 'es', 'id', 'tr', 'ur', 'bn', 'fa', 'ru', 'de', 'zh']

function buildHreflangMap(pathTemplate: string): Record<string, string> {
  return Object.fromEntries(
    STOREFRONTS.map((sf) => [sf, `${SITE}/${sf}${pathTemplate}`])
  )
}

export function buildSurahMetadata(params: {
  chapter: number
  surahName: string
  reciterName: string
  riwayahName: string
  reciterSlug: string
  reciterId: string
  description: string
  storefront: string
}): Metadata {
  const { chapter, surahName, reciterName, riwayahName, reciterSlug, reciterId, description, storefront } = params
  const slug = surahName.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const url = `${SITE}/${storefront}/surah/${slug}/${chapter}`
  const title = `${surahName} — Surah by ${reciterName} on ${SITE_NAME}`
  const desc = `Listen to ${surahName} (Surah ${chapter}) recited by ${reciterName} from ${riwayahName} on ${SITE_NAME}. ${description}`
  const artistUrl = `${SITE}/${storefront}/reciter/${reciterSlug}/${reciterId}`
  const albumUrl = `${SITE}/${storefront}/riwayah/${riwayahName.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/${reciterId}`

  return {
    title,
    description: desc,
    metadataBase: new URL(SITE),
    alternates: {
      canonical: url,
      languages: buildHreflangMap(`/surah/${slug}/${chapter}`),
    },
    openGraph: {
      type: 'music.song',
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      images: [{
        url: `${SITE}/assets/ui/web_1200.png`,
        width: 1200,
        height: 1200,
        alt: `${surahName} — ${reciterName}`,
      }],
      musicians: [artistUrl],
      album: albumUrl,
    } as Metadata['openGraph'] & { album?: string; musicians?: string[] },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [`${SITE}/assets/ui/web_1200.png`],
    },
    robots: { index: true, follow: true },
  }
}

export function buildReciterMetadata(params: {
  reciterName: string
  reciterSlug: string
  reciterId: string
  surahCount: number
  storefront: string
}): Metadata {
  const { reciterName, reciterSlug, reciterId, surahCount, storefront } = params
  const url = `${SITE}/${storefront}/reciter/${reciterSlug}/${reciterId}`
  const title = `${reciterName} on ${SITE_NAME}`
  const desc = `Listen to ${reciterName} on ${SITE_NAME}. Stream ${surahCount} surahs of Quran recitation.`

  return {
    title,
    description: desc,
    metadataBase: new URL(SITE),
    alternates: {
      canonical: url,
      languages: buildHreflangMap(`/reciter/${reciterSlug}/${reciterId}`),
    },
    openGraph: {
      type: 'profile',
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      images: [{
        url: `${SITE}/assets/ui/web_1200.png`,
        width: 1200,
        height: 1200,
        alt: reciterName,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [`${SITE}/assets/ui/web_1200.png`],
    },
    robots: { index: true, follow: true },
  }
}

export function buildRiwayahMetadata(params: {
  riwayahName: string
  riwayahSlug: string
  riwayahId: string
  reciterName: string
  reciterSlug: string
  reciterId: string
  surahCount: number
  storefront: string
}): Metadata {
  const { riwayahName, riwayahSlug, riwayahId, reciterName, reciterSlug, reciterId, surahCount, storefront } = params
  const url = `${SITE}/${storefront}/riwayah/${riwayahSlug}/${riwayahId}`
  const title = `${riwayahName} by ${reciterName} on ${SITE_NAME}`
  const desc = `Listen to ${riwayahName} by ${reciterName} on ${SITE_NAME}. ${surahCount} surahs.`
  const artistUrl = `${SITE}/${storefront}/reciter/${reciterSlug}/${reciterId}`

  return {
    title,
    description: desc,
    metadataBase: new URL(SITE),
    alternates: {
      canonical: url,
      languages: buildHreflangMap(`/riwayah/${riwayahSlug}/${riwayahId}`),
    },
    openGraph: {
      type: 'music.album',
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      images: [{
        url: `${SITE}/assets/ui/web_1200.png`,
        width: 1200,
        height: 1200,
        alt: `${riwayahName} by ${reciterName}`,
      }],
      musicians: [artistUrl],
    } as Metadata['openGraph'] & { musicians?: string[] },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [`${SITE}/assets/ui/web_1200.png`],
    },
    robots: { index: true, follow: true },
  }
}

export function buildSearchMetadata(params: {
  term?: string
  storefront: string
}): Metadata {
  const { term, storefront } = params
  const url = `${SITE}/${storefront}/search`

  return {
    title: term ? `${term} — Search Results on ${SITE_NAME}` : `Search — ${SITE_NAME}`,
    description: term ? `Search results for "${term}" on ${SITE_NAME}.` : `Search ${SITE_NAME}.`,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
  }
}
