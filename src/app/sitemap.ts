export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG, SUPPORTED_LOCALES, ARTIST_NAME } from '@/lib/configs'
import { slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'

const siteUrl = 'https://muslim.opentuwa.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = []

  // Root homepage
  urls.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  })

  // Per-locale storefront homepages
  for (const locale of SUPPORTED_LOCALES) {
    urls.push({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  // All 114 chapter pages (standalone /chapter/[id] routes)
  for (const surah of SURAH_METADATA) {
    urls.push({
      url: `${siteUrl}/chapter/${surah.chapter}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  }

  // Per-locale reciter pages
  for (const locale of SUPPORTED_LOCALES) {
    for (const [id, reciter] of Object.entries(RECITERS_CONFIG)) {
      urls.push({
        url: `${siteUrl}/${locale}/reciter/${slugify(reciter.name)}/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Per-locale album (chapter) pages for default reciter
  for (const locale of SUPPORTED_LOCALES) {
    for (const surah of SURAH_METADATA) {
      const albumId = encodeAlbumId(surah.chapter)
      urls.push({
        url: `${siteUrl}/${locale}/album/${slugify(surah.english_name)}/${albumId}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  return urls
}
