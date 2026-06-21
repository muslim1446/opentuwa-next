export const runtime = 'edge'

import type { Metadata } from 'next'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { ARTIST_NAME, PLATFORM_NAME } from '@/lib/configs'
import { decodeSongId } from '@/lib/entity-ids'

const siteUrl = 'https://muslim.opentuwa.com'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const decoded = decodeSongId(id)
  const chNum = decoded?.chapter || 1
  const ch = SURAH_METADATA.find(s => s.chapter === chNum)
  const title = ch ? `${ARTIST_NAME} — ${ch.english_name}` : `${PLATFORM_NAME} Audio`

  return {
    title,
    description: ch?.description || 'Audio playback',
    openGraph: {
      title,
      description: ch?.description,
      siteName: PLATFORM_NAME,
      images: [{ url: 'https://opentuwa.com/assets/ui/web_1200.png', width: 1200, height: 1200 }],
    },
    twitter: {
      card: 'player',
      title,
      description: ch?.description || 'Audio playback',
      images: ['https://opentuwa.com/assets/ui/web_1200.png'],
      players: {
        playerUrl: `${siteUrl}/embed/song/${id}`,
        streamUrl: `https://hosting.opentuwa.com/${String(chNum).padStart(3, '0')}.wav`,
        width: 480,
        height: 180,
      },
    },
    robots: { index: false, follow: true },
  }
}

export default async function EmbedSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const decoded = decodeSongId(id)
  const chNum = decoded?.chapter || 1
  const ch = SURAH_METADATA.find(s => s.chapter === chNum)
  const padCh = String(chNum).padStart(3, '0')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1C1C1E',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      padding: 20,
      boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.4, marginBottom: 8 }}>
        Track {chNum}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>
        {ch?.english_name || `Chapter ${chNum}`}
      </div>
      <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 20 }}>
        {ARTIST_NAME}
      </div>
      <audio
        src={`https://hosting.opentuwa.com/${padCh}.wav`}
        controls
        autoPlay
        style={{ width: '100%', maxWidth: 420 }}
      />
    </div>
  )
}
