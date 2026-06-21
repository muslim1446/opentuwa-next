export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG } from '@/lib/configs'
import { slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'
import { fetchAlbums, fetchArtists } from '@/lib/data'

const siteUrl = 'https://muslim.opentuwa.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  let artistsList: { id: string; name: string }[]
  try {
    const a = await fetchArtists()
    artistsList = a.map(x => ({ id: x.id, name: x.name }))
  } catch {
    artistsList = Object.entries(RECITERS_CONFIG).map(([id, rc]) => ({ id, name: rc.name }))
  }

  for (const artist of artistsList) {
    urls.push({
      url: `${siteUrl}/us/reciter/${slugify(artist.name)}/${artist.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  let albumsList: { id: string; title: string; slug: string }[]
  try {
    const a = await fetchAlbums()
    albumsList = a.map(x => ({ id: x.id, title: x.title, slug: slugify(x.title) }))
  } catch {
    albumsList = SURAH_METADATA.map(s => ({
      id: encodeAlbumId(s.chapter),
      title: s.english_name,
      slug: slugify(s.english_name),
    }))
  }

  for (const album of albumsList) {
    urls.push({
      url: `${siteUrl}/us/album/${album.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return urls
}
