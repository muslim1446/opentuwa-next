export const runtime = 'edge'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { RECITERS_CONFIG, PLATFORM_NAME } from '@/lib/configs'
import { buildArtistMetadata, slugify } from '@/lib/metadata'
import { artistJsonLd } from '@/lib/json-ld'
import { Breadcrumb } from '@/components/Breadcrumb'
import { encodeAlbumId } from '@/lib/entity-ids'
import { fetchArtist, fetchAlbums } from '@/lib/data'

const siteUrl = 'https://muslim.opentuwa.com'
const DEFAULT_ARTWORK = 'https://opentuwa.com/assets/ui/web_1200.png'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ storefront: string; slug: string; id: string }> }): Promise<Metadata> {
  const { storefront, id } = await params
  const artist = await fetchArtist(id)
  if (!artist) return {}

  const albums = await fetchAlbums(artist.id)

  return buildArtistMetadata({
    name: artist.name,
    slug: slugify(artist.name),
    id: artist.id,
    storefront,
    artworkUrl: artist.artwork_url || DEFAULT_ARTWORK,
    genres: artist.genre ? [artist.genre] : ['Quran', 'Recitation'],
    topTracks: albums.slice(0, 5).map(a => a.title),
  })
}

export default async function ReciterPage({
  params,
}: {
  params: Promise<{ storefront: string; slug: string; id: string }>
}) {
  const { storefront, slug: paramSlug, id } = await params

  const artist = await fetchArtist(id)
  if (!artist) notFound()

  const correctSlug = slugify(artist.name)
  if (paramSlug !== correctSlug) {
    redirect(`/${storefront}/reciter/${correctSlug}/${id}`)
  }

  const albums = await fetchAlbums(artist.id)
  const url = `${siteUrl}/${storefront}/reciter/${correctSlug}/${id}`

  const jsonLd = artistJsonLd({
    name: artist.name,
    url,
    image: artist.artwork_url || DEFAULT_ARTWORK,
    genres: artist.genre ? [artist.genre] : ['Quran', 'Recitation'],
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
          { name: artist.name, href: url },
        ]}
      />

      <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.03em' }}>
          {artist.name}
        </h1>
        {artist.bio && (
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
            {artist.bio}
          </p>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>
          Albums ({albums.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/${storefront}/album/${slugify(album.title)}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: 16,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.8)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.2)',
              }}>
                {(album.artwork_url || artist.artwork_url) ? (
                  <img src={album.artwork_url || artist.artwork_url || DEFAULT_ARTWORK} alt={album.title}
                    style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <span>{album.track_count}</span>
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{album.title}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{album.track_count} tracks</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
