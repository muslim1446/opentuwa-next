import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG } from '@/lib/configs'
import { slugify } from '@/lib/artwork'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'
const STOREFRONTS = ['en', 'ar']

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = []

  for (const sf of STOREFRONTS) {
    urls.push({
      url: `${siteUrl}/${sf}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    })

    for (const ch of SURAH_METADATA) {
      urls.push({
        url: `${siteUrl}/${sf}/surah/${slugify(ch.english_name)}/${ch.chapter}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    for (const [key, reciter] of Object.entries(RECITERS_CONFIG)) {
      urls.push({
        url: `${siteUrl}/${sf}/reciter/${slugify(reciter.name)}/${key}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })

      urls.push({
        url: `${siteUrl}/${sf}/riwayah/the-quran/${key}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  return urls
}
