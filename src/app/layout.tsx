import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Tuwa - Premium Quran Audio Player',
  description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
  authors: [{ name: 'Tuwa Media' }],
  manifest: '/manifest.json',
  openGraph: {
    siteName: 'Tuwa',
    title: 'Tuwa - Premium Quran Audio Player',
    description: 'Distraction-free Quran streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuwa - Premium Quran Audio Player',
    description: 'Distraction-free Quran streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="auto" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="https://opentuwa.com/assets/ui/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="https://opentuwa.com/assets/ui/favicon.svg" />
        <link rel="shortcut icon" href="https://opentuwa.com/assets/ui/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="preconnect" href="https://everyayah.com" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'Tuwa',
                  url: 'https://opentuwa.com/',
                  description: 'Premium distraction-free Quran audio streaming',
                  inLanguage: 'en-US',
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'Tuwa',
                  applicationCategory: 'MusicApplication',
                  operatingSystem: 'Web, iOS, tvOS, Android',
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="home">
        <Providers>
          {children}
        </Providers>
        <div id="transition-fade-layer" />
      </body>
    </html>
  )
}
