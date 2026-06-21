import type { Metadata } from 'next'
import { SITE_URL, PLATFORM_NAME } from '@/lib/configs'

const SITE = SITE_URL || 'https://muslim.opentuwa.com'
const SITE_NAME = PLATFORM_NAME || 'Tuwa'

export function buildAlbumMetadata(album: {
  name: string
  artistName: string
  artistSlug: string
  artistId: string
  slug: string
  id: string
  storefront: string
  artworkUrl: string
  trackCount: number
  releaseDate: string
  genres: string[]
}): Metadata {
  const url = `${SITE}/${album.storefront}/album/${album.slug}/${album.id}`
  const title = `${album.name} by ${album.artistName} on ${SITE_NAME}`
  const description = `Listen to ${album.name} by ${album.artistName} on ${SITE_NAME}. ${album.trackCount} songs.`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildHreflangMap('album', album.slug, album.id),
    },
    openGraph: {
      type: 'music.album',
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: album.artworkUrl, width: 1200, height: 1200, alt: album.name }],
      musicians: [`${SITE}/${album.storefront}/reciter/${album.artistSlug}/${album.artistId}`],
      releaseDate: album.releaseDate,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [album.artworkUrl],
    },
    robots: { index: true, follow: true },
  }
}

export function buildSongMetadata(song: {
  name: string
  artistName: string
  artistSlug: string
  artistId: string
  albumName: string
  albumSlug: string
  albumId: string
  slug: string
  id: string
  storefront: string
  artworkUrl: string
  durationSeconds: number
  previewUrl?: string
}): Metadata {
  const url = `${SITE}/${song.storefront}/song/${song.slug}/${song.id}`
  const title = `${song.artistName} — ${song.name} on ${SITE_NAME}`
  const description = `Listen to ${song.name} by ${song.artistName} on ${SITE_NAME}.`
  const artistUrl = `${SITE}/${song.storefront}/reciter/${song.artistSlug}/${song.artistId}`
  const albumUrl = `${SITE}/${song.storefront}/album/${song.albumSlug}/${song.albumId}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'music.song',
      title,
      url,
      description,
      images: [{ url: song.artworkUrl, width: 1200, height: 1200 }],
      musicians: [artistUrl],
      album: albumUrl,
      duration: song.durationSeconds,
    } as any,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [song.artworkUrl],
    },
    other: song.previewUrl ? {
      'og:audio': song.previewUrl,
      'og:audio:type': 'audio/mp4',
    } : {},
    robots: { index: true, follow: true },
  }
}

export function buildArtistMetadata(artist: {
  name: string
  slug: string
  id: string
  storefront: string
  artworkUrl: string
  genres: string[]
  topTracks: string[]
}): Metadata {
  const url = `${SITE}/${artist.storefront}/reciter/${artist.slug}/${artist.id}`
  const title = `${artist.name} on ${SITE_NAME}`
  const description = `Listen to ${artist.name} on ${SITE_NAME}. Songs including ${artist.topTracks.slice(0, 3).join(', ')}.`
  const image = artist.artworkUrl || 'https://opentuwa.com/assets/ui/web_1200.png'

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 1200, alt: artist.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  }
}

export function buildSearchMetadata(term?: string): Metadata {
  if (term) {
    return {
      title: `${term} — Search Results on ${SITE_NAME}`,
      description: `Search results for "${term}" on ${SITE_NAME}.`,
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE}/search` },
    }
  }
  return {
    title: `Search — ${SITE_NAME}`,
    description: `Search ${SITE_NAME}.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE}/search` },
  }
}

function buildHreflangMap(entityType: string, slug: string, id: string): Record<string, string> {
  return {
    en: `${SITE}/us/${entityType}/${slug}/${id}`,
    ar: `${SITE}/sa/${entityType}/${slug}/${id}`,
    ms: `${SITE}/my/${entityType}/${slug}/${id}`,
    id: `${SITE}/id/${entityType}/${slug}/${id}`,
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
