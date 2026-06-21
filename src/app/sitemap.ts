import type { MetadataRoute } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { RECITERS_CONFIG } from '@/lib/configs'
import { slugify } from '@/lib/metadata'

const siteUrl = 'https://muslim.opentuwa.com'
const PER_SITEMAP = 5000

export async function generateSitemaps() {
  const totalSurahs = SURAH_METADATA.length
  const totalReciters = Object.keys(RECITERS_CONFIG).length
  const total = totalSurahs + totalReciters + 1
  const count = Math.ceil(total / PER_SITEMAP)
  return Array.from({ length: count }, (_, id) => ({ id }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const allUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  for (const reciter of Object.entries(RECITERS_CONFIG)) {
    allUrls.push({
      url: `${siteUrl}/en/reciter/${slugify(reciter[1].name)}/${reciter[0]}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const surah of SURAH_METADATA) {
    allUrls.push({
      url: `${siteUrl}/en/surah/${slugify(surah.english_name)}/${surah.chapter}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  const start = id * PER_SITEMAP
  const end = start + PER_SITEMAP
  return allUrls.slice(start, end)
}
