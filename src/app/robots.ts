import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/\*?\*i=',         // avoid indexing ?i= track-query duplicates, see §1
          '/search',      // search result pages are parametrized
        ],
      },
    ],
    sitemap: 'https://muslim.opentuwa.com/sitemap.xml',
  }
}
