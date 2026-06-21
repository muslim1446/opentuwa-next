export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME } from '@/lib/configs'
import { buildAlbumMetadata, slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'
import { GraphSchema } from '@/components/GraphSchema'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ChapterClient } from './chapter-client'

const siteUrl = 'https://muslim.opentuwa.com'
const storefront = 'us'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  if (!ch) return { title: 'Not Found' }

  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const trackCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  return buildAlbumMetadata({
    name: ch.english_name,
    artistName: ARTIST_NAME,
    artistSlug: slugify(ARTIST_NAME),
    artistId: 'alafasy',
    slug: slugify(ch.english_name),
    id: encodeAlbumId(ch.chapter),
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

  const albumId = encodeAlbumId(chapterNum)
  const surahUrl = `${siteUrl}/${storefront}/album/${slugify(ch.english_name)}/${albumId}`
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy`
  const verseCountMatch = ch.description?.match(/\((\d+) verses?\)/)
  const verseCount = verseCountMatch ? parseInt(verseCountMatch[1]) : 0

  return (
    <>
      <GraphSchema
        type="chapter"
        data={{ chapter: ch, verseCount, url: surahUrl, reciterUrl }}
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
