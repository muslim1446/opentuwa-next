import type { Metadata } from 'next'

const SITE = 'https://muslim.opentuwa.com'
const SITE_NAME = 'Tuwa'

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
  const url = `${SITE}/${album.storefront}/surah/${album.slug}/${album.id}`
  const title = `${album.name} by ${album.artistName} on ${SITE_NAME}`
  const description = `Listen to ${album.name} by ${album.artistName} on ${SITE_NAME}. ${album.trackCount} verses.`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildHreflangMap('surah', album.slug, album.id),
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
  const url = `${SITE}/${song.storefront}/surah/${song.slug}/${song.id}?i=${song.id}`
  const canonicalUrl = `${SITE}/${song.storefront}/surah/${song.slug}/${song.id}`
  const title = `${song.name} — Verse by ${song.artistName} on ${SITE_NAME}`
  const description = `Listen to ${song.name} by ${song.artistName} on ${SITE_NAME}.`
  const artistUrl = `${SITE}/${song.storefront}/reciter/${song.artistSlug}/${song.artistId}`
  const albumUrl = `${SITE}/${song.storefront}/surah/${song.albumSlug}/${song.albumId}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
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
  const description = `Listen to ${artist.name} on ${SITE_NAME}. Recitations including ${artist.topTracks.slice(0, 3).join(', ')}.`
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

export function buildPlaylistMetadata(playlist: {
  name: string
  curatorName: string
  slug: string
  id: string
  storefront: string
  description: string
  artworkUrl: string
}): Metadata {
  const url = `${SITE}/${playlist.storefront}/playlist/${playlist.slug}/${playlist.id}`
  const title = `${playlist.name} — Playlist by ${playlist.curatorName} on ${SITE_NAME}`

  return {
    title,
    description: playlist.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'music.playlist',
      title,
      description: playlist.description,
      url,
      siteName: SITE_NAME,
      images: [{ url: playlist.artworkUrl, width: 1200, height: 1200 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: playlist.description,
      images: [playlist.artworkUrl],
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
  const storefronts = ['en', 'ar', 'es', 'fr', 'he', 'zh']
  return Object.fromEntries(
    storefronts.map((sf) => [sf, `${SITE}/${sf}/${entityType}/${slug}/${id}`])
  )
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
