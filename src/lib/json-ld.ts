type JsonLd = Record<string, unknown>

export function artistJsonLd(artist: {
  name: string
  url: string
  image: string
  genres: string[]
  sameAs?: string[]
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: artist.url,
    image: artist.image,
    genre: artist.genres,
    ...(artist.sameAs ? { sameAs: artist.sameAs } : {}),
  }
}

export function albumJsonLd(album: {
  name: string
  url: string
  image: string
  datePublished: string
  artist: { name: string; url: string }
  tracks: { name: string; durationISO8601: string; position: number }[]
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.name,
    url: album.url,
    image: album.image,
    datePublished: album.datePublished,
    byArtist: { '@type': 'MusicGroup', name: album.artist.name, url: album.artist.url },
    numTracks: album.tracks.length,
    track: {
      '@type': 'ItemList',
      itemListElement: album.tracks.map((t) => ({
        '@type': 'MusicRecording',
        position: t.position,
        name: t.name,
        duration: t.durationISO8601,
      })),
    },
  }
}

export function songJsonLd(song: {
  name: string
  url: string
  image: string
  durationISO8601: string
  isrc?: string
  artist: { name: string; url: string }
  album: { name: string; url: string }
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.name,
    url: song.url,
    image: song.image,
    duration: song.durationISO8601,
    ...(song.isrc ? { isrcCode: song.isrc } : {}),
    byArtist: { '@type': 'MusicGroup', name: song.artist.name, url: song.artist.url },
    inAlbum: { '@type': 'MusicAlbum', name: song.album.name, url: song.album.url },
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function siteSearchJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://muslim.opentuwa.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://muslim.opentuwa.com/en/search?term={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function toISO8601Duration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `PT${m}M${s}S`
}
