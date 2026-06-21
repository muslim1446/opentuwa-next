export const runtime = 'edge'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RECITERS_CONFIG } from '@/lib/configs'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { buildArtistMetadata, slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'
import { artistJsonLd } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import Link from 'next/link'

const siteUrl = 'https://muslim.opentuwa.com'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const reciter = RECITERS_CONFIG[id]
  if (!reciter) return {}

  return buildArtistMetadata({
    name: reciter.name,
    slug: slugify(reciter.name),
    id,
    storefront,
    artworkUrl: 'https://opentuwa.com/assets/ui/web_1200.png',
    genres: ['Quran', 'Recitation'],
    topTracks: SURAH_METADATA.slice(0, 5).map((s) => s.english_name),
  })
}

export default async function ReciterPage({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }) {
  const { storefront, id } = await params
  const reciter = RECITERS_CONFIG[id]
  if (!reciter) notFound()

  const url = `${siteUrl}/${storefront}/reciter/${slugify(reciter.name)}/${id}`

  const jsonLd = artistJsonLd({
    name: reciter.name,
    url,
    image: 'https://opentuwa.com/assets/ui/web_1200.png',
    genres: ['Quran', 'Recitation'],
    sameAs: ['https://www.youtube.com/@MisharyAlafasy'],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { name: 'Home', href: `${siteUrl}/${storefront}` },
          { name: 'Artists', href: `${siteUrl}/${storefront}` },
          { name: reciter.name, href: url },
        ]}
      />

      <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.03em' }}>
          {reciter.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 17 }}>
          Artist
        </p>

        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Albums
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {SURAH_METADATA.map((surah) => {
              const albumId = encodeAlbumId(surah.chapter)
              return (
                <Link
                  key={surah.chapter}
                  href={`/${storefront}/album/${slugify(surah.english_name)}/${albumId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    textDecoration: 'none',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 14,
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    flexShrink: 0,
                  }}>
                    {surah.chapter}
                  </span>
                  <span>{surah.english_name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
