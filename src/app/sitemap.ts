export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG } from '@/lib/configs'
import { slugify } from '@/lib/metadata'

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
      url: `${siteUrl}/en/reciter/${slugify(reciter.name)}/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const surah of SURAH_METADATA) {
    urls.push({
      url: `${siteUrl}/en/surah/${slugify(surah.english_name)}/${surah.chapter}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return urls
}
