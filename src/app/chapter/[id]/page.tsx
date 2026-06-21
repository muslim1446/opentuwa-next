import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, ALBUM_NAME } from '@/lib/configs'
import { buildAlbumMetadata, slugify } from '@/lib/metadata'
import { albumJsonLd, toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ChapterClient } from './chapter-client'

export const runtime = 'edge'

const siteUrl = 'https://muslim.opentuwa.com'
const storefront = 'en'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  if (!ch) return { title: 'Chapter Not Found' }

  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const trackCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  return buildAlbumMetadata({
    name: ch.english_name,
    artistName: ARTIST_NAME,
    artistSlug: slugify(ARTIST_NAME),
    artistId: 'alafasy',
    slug: slugify(ch.english_name),
    id: String(ch.chapter),
    storefront,
    artworkUrl: 'https://opentuwa.com/assets/ui/web_1200.png',
    trackCount,
    releaseDate: '',
    genres: ['Quran', 'Recitation'],
  })
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  await cookies()
  const { id: idStr } = await params
  const chapterNum = parseInt(idStr)
  const ch = SURAH_METADATA.find(s => s.chapter === chapterNum)
  if (!ch) notFound()

  const url = `${siteUrl}/chapter/${chapterNum}`
  const surahUrl = `${siteUrl}/${storefront}/surah/${slugify(ch.english_name)}/${chapterNum}`
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy`
  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const verseCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  const tracks = Array.from({ length: verseCount }, (_, i) => ({
    name: `Verse ${i + 1}`,
    durationISO8601: toISO8601Duration(8),
    position: i + 1,
  }))

  const jsonLd = albumJsonLd({
    name: ch.english_name,
    url: surahUrl,
    image: 'https://opentuwa.com/assets/ui/web_1200.png',
    datePublished: '',
    artist: { name: ARTIST_NAME, url: reciterUrl },
    tracks,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: ARTIST_NAME, href: reciterUrl },
          { name: ch.english_name, href: surahUrl },
        ]}
      />
      <ChapterClient chapterId={chapterNum} />
    </>
  )
}
