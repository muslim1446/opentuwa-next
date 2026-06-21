import type { Metadata } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME } from '@/lib/configs'
import { siteSearchJsonLd } from '@/lib/json-ld'
import HomeClient from '@/app/home-client'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'

const description = 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations. Built for deep focus.'

export async function generateMetadata({ params }: { params: Promise<{ storefront: string }> }): Promise<Metadata> {
  const { storefront } = await params
  const url = `${siteUrl}/${storefront}`

  return {
    title: 'Tuwa - Web Player',
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      siteName: 'Tuwa',
      locale: storefront === 'ar' ? 'ar_SA' : 'en_US',
      url,
      title: 'Tuwa - Web Player',
      description,
      images: [{
        url: 'https://opentuwa.com/assets/ui/web_1200.png',
        width: 1200,
        height: 630,
        alt: 'Tuwa - Quran Audio Player',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tuwa - Web Player',
      description,
      site: '@opentuwa',
      images: ['https://opentuwa.com/assets/ui/web_1200.png'],
    },
    robots: { index: true, follow: true },
  }
}

export default async function StorefrontHomePage() {
  const searchLd = siteSearchJsonLd(siteUrl)

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
        url: `${siteUrl}/${surahSlug(s.english_name)}/${s.chapter}`,
        position: s.chapter,
        byArtist: {
          '@type': 'MusicGroup',
          name: ARTIST_NAME,
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
    itemListElement: [{
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    }],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <HomeClient />
    </>
  )
}

function surahSlug(name: string): string {
  return `surah/${name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
}
