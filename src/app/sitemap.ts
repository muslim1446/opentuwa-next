import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'

const siteUrl = 'https://muslim.opentuwa.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const chapterUrls: MetadataRoute.Sitemap = SURAH_METADATA.map((ch) => ({
    url: `${siteUrl}/chapter/${ch.chapter}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...chapterUrls,
  ]
}
