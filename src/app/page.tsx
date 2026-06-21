import type { Metadata } from 'next'
import { PLATFORM_NAME, SITE_URL } from '@/lib/configs'
import { cookies } from 'next/headers'
import { GraphSchema } from '@/components/GraphSchema'
import HomeClient from './home-client'

export const runtime = 'edge'

const siteUrl = SITE_URL
const platform = PLATFORM_NAME

const description = `Premium distraction-free audio streaming with verse-by-verse navigation, multiple artists, and 50+ translations. Built for deep focus.`

export const metadata: Metadata = {
  title: `${platform} - Web Player`,
  description,
  authors: [{ name: 'Tuwa Media' }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    siteName: platform,
    locale: 'en_US',
    url: siteUrl,
    title: `${platform} - Web Player`,
    description,
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
    description,
    site: '@opentuwa',
    images: ['https://opentuwa.com/assets/ui/web_1200.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function HomePage() {
  await cookies()

  return (
    <>
      <GraphSchema type="homepage" />
      <HomeClient />
    </>
  )
}
