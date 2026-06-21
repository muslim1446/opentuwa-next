import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ClientInit } from './client-init'
import { SITE_URL, PLATFORM_NAME, APPLE_APP_ID } from '@/lib/configs'

const siteUrl = SITE_URL
const platform = PLATFORM_NAME
const appleId = APPLE_APP_ID

export const metadata: Metadata = {
  title: {
    default: `${platform} - Web Player`,
    template: `%s | ${platform}`,
  },
  description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations. Built for deep focus.',
  authors: [{ name: 'Tuwa Media' }],
  creator: 'Tuwa Media',
  publisher: 'Tuwa Media',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
    languages: {
      en: `${siteUrl}/us`,
      ar: `${siteUrl}/sa`,
      ms: `${siteUrl}/my`,
      id: `${siteUrl}/id`,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: platform,
    startupImage: [`${siteUrl}/assets/ui/web_1200.png`],
  },
  icons: {
    icon: [
      { url: 'https://opentuwa.com/assets/ui/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: 'https://opentuwa.com/assets/ui/favicon.svg', type: 'image/svg+xml' },
      { url: 'https://opentuwa.com/assets/ui/favicon.ico' },
    ],
    shortcut: { url: 'https://opentuwa.com/assets/ui/favicon.ico' },
    apple: [
      { url: 'https://opentuwa.com/assets/ui/apple-touch-icon.png', sizes: '180x180' },
      { url: 'https://opentuwa.com/assets/ui/apple-touch-icon.png', sizes: '152x152' },
      { url: 'https://opentuwa.com/assets/ui/apple-touch-icon.png', sizes: '120x120' },
    ],
    other: { rel: 'mask-icon', url: 'https://opentuwa.com/assets/ui/favicon.svg' },
  },
  openGraph: {
    type: 'website',
    siteName: platform,
    locale: 'en_US',
    url: siteUrl,
    title: `${platform} - Web Player`,
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    images: [
      {
        url: 'https://opentuwa.com/assets/ui/web_1200.png',
        width: 1200,
        height: 630,
        alt: `${platform} - Audio Player`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${platform} - Web Player`,
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    site: '@opentuwa',
    images: ['https://opentuwa.com/assets/ui/web_1200.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': platform,
    'mobile-web-app-capable': 'yes',
    'apple-itunes-app': `app-id=${appleId}, app-argument=${siteUrl}`,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: platform,
    alternateName: `${platform} Audio Player`,
    url: siteUrl,
    description: 'Premium distraction-free audio streaming with verse-by-verse navigation and multiple artists.',
    publisher: {
      '@type': 'Organization',
      name: 'Tuwa Media',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://opentuwa.com/assets/ui/favicon-96x96.png',
        width: 96,
        height: 96,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/us/search?term={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  }

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: platform,
    alternateName: `${platform} Audio Player`,
    applicationCategory: 'MusicApplication',
    operatingSystem: 'Web, iOS, tvOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: 'Tuwa Media',
      url: siteUrl,
    },
    description: 'Premium distraction-free audio streaming with verse-by-verse navigation and multiple artists.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '32000000',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <html lang="en" dir="auto" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="application-name" content="Tuwa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tuwa" />
        <meta name="apple-mobile-web-app-orientations" content="portrait-primary" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1C1C1E" />
        <meta name="apple-itunes-app" content={`app-id=${appleId}, app-argument=${siteUrl}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" href="https://opentuwa.com/assets/ui/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="https://opentuwa.com/assets/ui/favicon.svg" />
        <link rel="shortcut icon" href="https://opentuwa.com/assets/ui/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="mask-icon" href="https://opentuwa.com/assets/ui/favicon.svg" color="#1C1C1E" />
        <link type="text/plain" rel="author" href="humans.txt" />
        <link rel="preconnect" href="https://everyayah.com" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <link rel="preconnect" href="https://hosting.opentuwa.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </head>
      <body className="home">
        <Providers>
          <ClientInit />
          {children}
        </Providers>
        <div id="transition-fade-layer" />
      </body>
    </html>
  )
}
