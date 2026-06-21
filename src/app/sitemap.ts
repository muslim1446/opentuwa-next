export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG } from '@/lib/configs'
import { slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'

const siteUrl = 'https://muslim.opentuwa.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  for (const [id, reciter] of Object.entries(RECITERS_CONFIG)) {
    urls.push({
      url: `${siteUrl}/us/reciter/${slugify(reciter.name)}/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const surah of SURAH_METADATA) {
    const albumId = encodeAlbumId(surah.chapter)
    urls.push({
      url: `${siteUrl}/us/album/${slugify(surah.english_name)}/${albumId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return urls
}
