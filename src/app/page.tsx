import type { Metadata } from 'next'
import { PLATFORM_NAME, SITE_URL } from '@/lib/configs'
import { fetchAlbums, fetchArtists, fetchTracks } from '@/lib/data'
import MainX from './MainX'

export const runtime = 'edge'

const siteUrl = SITE_URL
const platform = PLATFORM_NAME

export const metadata: Metadata = {
  title: `${platform} — Audio Streaming`,
  description: 'Premium distraction-free audio streaming with curated albums, artists, and high-quality tracks.',
  openGraph: {
    title: `${platform} — Audio Streaming`,
    siteName: platform,
    url: siteUrl,
    images: [{ url: 'https://opentuwa.com/assets/ui/web_1200.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: `${platform} — Audio Streaming`, images: ['https://opentuwa.com/assets/ui/web_1200.png'] },
  robots: { index: true, follow: true },
}

export default async function HomePage() {
  let artists = await fetchArtists()
  let albums = await fetchAlbums()
  let firstAlbumTracks: Awaited<ReturnType<typeof fetchTracks>> = []
  if (albums[0]) firstAlbumTracks = await fetchTracks(albums[0].id)

  return <MainX artists={artists} albums={albums} tracks={firstAlbumTracks} />
}
