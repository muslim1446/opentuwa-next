import { SITE_URL, PLATFORM_NAME } from '@/lib/configs'

const SITE = SITE_URL
const NAME = PLATFORM_NAME

type JsonLd = Record<string, unknown>

function MusicPlatformOrganization(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicPlatform',
    name: NAME,
    alternateName: `${NAME} Audio Player`,
    url: SITE,
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    applicationCategory: 'MusicApplication',
    operatingSystem: 'Web, iOS, tvOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '32000000',
      bestRating: '5',
    },
  }
}

interface StructuredDataProps {
  type: 'music-platform' | 'software-application' | 'video-object'
  data?: Record<string, unknown>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let schema: JsonLd | null = null

  switch (type) {
    case 'music-platform':
      schema = MusicPlatformOrganization()
      break
    case 'software-application':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: NAME,
        alternateName: `${NAME} Audio Player`,
        applicationCategory: 'MusicApplication',
        operatingSystem: 'Web, iOS, tvOS, Android',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '32000000',
          bestRating: '5',
        },
      }
      break
    case 'video-object':
      if (data) {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          ...data,
        }
      }
      break
  }

  if (!schema) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
