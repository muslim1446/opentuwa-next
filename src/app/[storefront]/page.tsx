export const runtime = 'edge'

import Link from 'next/link'
import { PLATFORM_NAME } from '@/lib/configs'
import { slugify } from '@/lib/metadata'
import { encodeAlbumId } from '@/lib/entity-ids'
import { Breadcrumb } from '@/components/Breadcrumb'
import { fetchArtists, fetchAlbums } from '@/lib/data'

const siteUrl = 'https://muslim.opentuwa.com'

export default async function StorefrontHome({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params

  const artists = await fetchArtists()
  const albums = await fetchAlbums()

  return (
    <>
      <Breadcrumb items={[{ name: 'Home', href: `${siteUrl}/${storefront}` }]} />

      <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.03em' }}>
          {PLATFORM_NAME}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 17 }}>
          Premium Audio Streaming
        </p>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Artists
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/${storefront}/reciter/${slugify(artist.name)}/${artist.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 15,
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
              >
                {artist.name}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Albums
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/${storefront}/album/${slugify(album.title)}/${album.id}`}
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
                  {album.track_count}
                </span>
                <span>{album.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
