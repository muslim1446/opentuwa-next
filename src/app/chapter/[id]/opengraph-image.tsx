import { ImageResponse } from 'next/og'
import { SURAH_METADATA } from '@/lib/surah-metadata'
export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 1200,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  const title = ch?.english_name || 'Quran'
  const chapterNum = ch?.chapter || 0

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1C1C1E',
          color: '#FFFFFF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              opacity: 0.15,
              position: 'absolute',
              top: 80,
              right: 80,
            }}
          >
            {chapterNum}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Surah {chapterNum}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              textAlign: 'center',
              maxWidth: 900,
              padding: '0 60px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: 10,
            }}
          >
            Recitation by Mishari Rashid Alafasy
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 30,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              T
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Tuwa Audio
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
