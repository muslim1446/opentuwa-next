import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ClientInit } from './client-init'

const siteUrl = 'https://muslim.opentuwa.com'

export const metadata: Metadata = {
  title: {
    default: 'Tuwa - Web Player',
    template: '%s | Tuwa',
  },
  description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations. Built for deep focus.',
  authors: [{ name: 'Tuwa Media' }],
  creator: 'Tuwa Media',
  publisher: 'Tuwa Media',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Tuwa',
    locale: 'en_US',
    url: siteUrl,
    title: 'Tuwa - Web Player',
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    images: [
      {
        url: 'https://opentuwa.com/assets/ui/web_1200.png',
        width: 1200,
        height: 630,
        alt: 'Tuwa - Quran Audio Player',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuwa - Web Player',
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
    'apple-mobile-web-app-title': 'Tuwa',
    'mobile-web-app-capable': 'yes',
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
    name: 'Tuwa',
    alternateName: 'Tuwa Quran Audio Player',
    url: siteUrl,
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
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
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  }

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tuwa',
    alternateName: 'Tuwa Quran Audio Player',
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
    description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
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
        <meta name="apple-mobile-web-app-orientations" content="portrait-primary" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" type="image/png" href="https://opentuwa.com/assets/ui/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="https://opentuwa.com/assets/ui/favicon.svg" />
        <link rel="shortcut icon" href="https://opentuwa.com/assets/ui/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="mask-icon" href="https://opentuwa.com/assets/ui/favicon.svg" color="#1C1C1E" />
        <link type="text/plain" rel="author" href="humans.txt" />
        <link rel="preconnect" href="https://everyayah.com" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
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
