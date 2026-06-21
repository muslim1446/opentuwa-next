type JsonLd = Record<string, unknown>

export function reciterJsonLd(reciter: {
  name: string
  url: string
  image?: string
  genres?: string[]
  sameAs?: string[]
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: reciter.name,
    url: reciter.url,
    ...(reciter.image ? { image: reciter.image } : {}),
    ...(reciter.genres ? { genre: reciter.genres } : {}),
    ...(reciter.sameAs ? { sameAs: reciter.sameAs } : {}),
  }
}

export function riwayahJsonLd(album: {
  name: string
  url: string
  image?: string
  datePublished?: string
  artist: { name: string; url: string }
  tracks: { name: string; durationISO8601: string; position: number }[]
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.name,
    url: album.url,
    ...(album.image ? { image: album.image } : {}),
    ...(album.datePublished ? { datePublished: album.datePublished } : {}),
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

export function surahJsonLd(song: {
  name: string
  url: string
  image?: string
  durationISO8601?: string
  artist: { name: string; url: string }
  album: { name: string; url: string }
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.name,
    url: song.url,
    ...(song.image ? { image: song.image } : {}),
    ...(song.durationISO8601 ? { duration: song.durationISO8601 } : {}),
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

export function siteSearchJsonLd(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/en/search?term={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
