export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, PLATFORM_NAME } from '@/lib/configs'
import { buildSongMetadata, slugify } from '@/lib/metadata'
import { toISO8601Duration } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { GraphSchema } from '@/components/GraphSchema'
import { decodeSongId, encodeAlbumId } from '@/lib/entity-ids'
import HomeClient from '@/app/home-client'

const siteUrl = 'https://muslim.opentuwa.com'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const decoded = decodeSongId(id)
  if (!decoded) return {}
  const ch = SURAH_METADATA.find(s => s.chapter === decoded.chapter)
  if (!ch) return {}

  return buildSongMetadata({
    name: ch.english_name,
    artistName: ARTIST_NAME,
    artistSlug: slugify(ARTIST_NAME),
    artistId: 'alafasy',
    albumName: ch.english_name,
    albumSlug: slugify(ch.english_name),
    albumId: encodeAlbumId(decoded.chapter),
    slug: slugify(ch.english_name),
    id,
    storefront,
    artworkUrl: 'https://opentuwa.com/assets/ui/web_1200.png',
    durationSeconds: 8,
    previewUrl: `https://hosting.opentuwa.com/${String(decoded.chapter).padStart(3, '0')}.wav`,
    trackNumber: decoded.verse,
  })
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
}) {
  const { storefront, slug: paramSlug, id } = await params

  const decoded = decodeSongId(id)
  if (!decoded) notFound()
  const ch = SURAH_METADATA.find(s => s.chapter === decoded.chapter)
  if (!ch) notFound()

  const correctSlug = slugify(ch.english_name)
  if (paramSlug !== correctSlug) {
    redirect(`/${storefront}/song/${correctSlug}/${id}`)
  }

  const url = `${siteUrl}/${storefront}/song/${correctSlug}/${id}`
  const albumId = encodeAlbumId(decoded.chapter)
  const reciterUrl = `${siteUrl}/${storefront}/reciter/${slugify(ARTIST_NAME)}/alafasy`
  const albumUrl = `${siteUrl}/${storefront}/album/${correctSlug}/${albumId}`

  return (
    <>
      <GraphSchema
        type="song"
        data={{
          chapter: ch,
          url,
          reciterUrl,
          albumUrl,
          albumChapterUrl: albumUrl,
          verseNum: decoded.verse,
          durationISO: toISO8601Duration(8),
        }}
        storefront={storefront}
      />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: ARTIST_NAME, href: reciterUrl },
          { name: ch.english_name, href: albumUrl },
          { name: `Verse ${decoded.verse}`, href: url },
        ]}
      />
      <HomeClient />
    </>
  )
}
