# Apple Music Web Architecture → Next.js Implementation Guide

**Purpose:** This document maps the technical patterns Apple Music's web app (`music.apple.com`) is built on — URL/directory structure, SEO metadata, Open Graph, JSON-LD structured data, breadcrumbs, sitemap/robots — into concrete Next.js (App Router) code, so you can apply the same architecture to a music/audio platform of your own.

> \*\*A note on sourcing, read this first:\*\* Web search/fetch tooling was unavailable while building this doc (timing out on every query, including trivial ones — a tool-side outage, not a content restriction), so none of the snippets below are scraped verbatim from a live `music.apple.com` page. Everything here is built from three things I'm highly confident about because they're public, stable, documented specs rather than scraped guesses:
> 1. The \*\*Open Graph music object spec\*\* (ogp.me) — official, hasn't changed in years.
> 2. \*\*schema.org\*\* vocab (`MusicGroup`, `MusicAlbum`, `MusicRecording`, `BreadcrumbList`) — official, stable.
> 3. The \*\*public Apple Music API\*\* field schema (developer.apple.com) and Apple Music's URL routing pattern, which has been consistent (`/{storefront}/{type}/{slug}/{id}`) for years.
>
> Field names, exact title-tag wording, and meta-description copy are presented as \*\*patterns to implement\*\*, not byte-exact quotes pulled from the live site. Before shipping, pop open DevTools → "View Page Source" (not just Inspect, since the SPA shell can differ from what crawlers see) on a real `music.apple.com/us/album/...` page and diff it against this doc — I'll flag the spots most worth double-checking.

\---

## Table of Contents

1. [URL \& Directory Structure](#1-url--directory-structure)
2. [Next.js App Router File Mapping](#2-nextjs-app-router-file-mapping)
3. [Core `<head>` Metadata](#3-core-head-metadata)
4. [Open Graph (music namespace) \& Twitter Cards](#4-open-graph-music-namespace--twitter-cards)
5. [JSON-LD Structured Data](#5-json-ld-structured-data)
6. [Breadcrumbs (visual + structured)](#6-breadcrumbs-visual--structured)
7. [Sitemap \& robots.txt](#7-sitemap--robotstxt)
8. [Search Page Architecture](#8-search-page-architecture)
9. [Entity Field Reference (Song / Album / Artist / Playlist)](#9-entity-field-reference)
10. [Images: Apple's Artwork URL Template Pattern](#10-images-apples-artwork-url-template-pattern)
11. [Rendering Strategy: ISR vs SSR vs Static](#11-rendering-strategy-isr-vs-ssr-vs-static)

\---

## 1\. URL \& Directory Structure

Apple Music's URL scheme is storefront-first, then entity-type, then a human-readable slug, then a numeric ID. This pattern has been stable across the catalog for years:

```
https://music.apple.com/{storefront}/{entity-type}/{slug}/{id}
```

|Segment|Example|Notes|
|-|-|-|
|`storefront`|`us`, `gb`, `sa`, `ae`, `my`, `jp`|2-letter country/region code, \~165 storefronts|
|`entity-type`|`artist`, `album`, `song`, `playlist`, `station`, `curator`, `label`, `music-video`|Singular noun, kebab-case for multi-word types|
|`slug`|`taylor-swift`, `1989-taylors-version`|SEO slug derived from the entity name, ASCII-transliterated|
|`id`|`159260351`|Apple's numeric catalog ID for that entity|

**Worked examples (illustrative — verify exact current slugs/IDs live, since catalog entries get re-released and IDs aren't something I can promise are still attached to the same title):**

```
/us/artist/taylor-swift/159260351
/us/album/1989-taylors-version/1713845538
/us/album/1989-taylors-version/1713845538?i=1713845544   ← a specific song, addressed as a query param ON the album route
/us/song/some-track-name/1234567890                      ← standalone song route also exists
/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb
/us/search?term=taylor+swift
```

Two routing details worth deliberately copying:

* **Songs are dual-addressable.** A track has its own canonical `/song/{slug}/{id}` route *and* is reachable as `?i={songId}` on its parent album's route (so a shared link can deep-link straight into album context with that one track highlighted/playing). Decide early whether you want this dual model or just one canonical route per song — dual-addressing is good for UX (share a track, land in full album context) but means you need a canonical tag pointing the `?i=` variant back at the song's own URL to avoid duplicate-content dilution.
* **The slug is decorative, the ID is canonical.** Slugs can drift (re-releases, title changes) without breaking the URL, because routing resolves on the trailing ID. Build your matcher so `/artist/wrong-slug-here/159260351` still resolves and 301-redirects to the correct current slug — don't 404 on slug mismatch.

\---

## 2\. Next.js App Router File Mapping

```
app/
├── \[storefront]/
│   ├── page.tsx                        → home/browse (storefront landing)
│   ├── layout.tsx                      → storefront-level layout (locale, nav)
│   ├── artist/
│   │   └── \[slug]/\[id]/
│   │       └── page.tsx                → artist page
│   ├── album/
│   │   └── \[slug]/\[id]/
│   │       └── page.tsx                → album page (reads ?i= for active track)
│   ├── song/
│   │   └── \[slug]/\[id]/
│   │       └── page.tsx                → standalone song page
│   ├── playlist/
│   │   └── \[slug]/\[id]/
│   │       └── page.tsx
│   └── search/
│       └── page.tsx                    → reads ?term=
├── sitemap.ts                          → built-in Next.js sitemap route
├── robots.ts                           → built-in Next.js robots route
└── opengraph-image.tsx                 → optional dynamic OG image fallback

lib/
├── metadata.ts                         → generateMetadata() builders per entity type
├── json-ld.ts                          → schema.org object builders
└── api/                                → your data layer (fetch artists/albums/songs)

components/
└── Breadcrumb.tsx
```

Notice the **`\[storefront]` segment wraps everything** — this is what lets one Next.js deployment serve locale/region variants without separate apps, and it's what the `hreflang` alternates in Section 3 point between.

\---

## 3\. Core `<head>` Metadata

### Title \& description patterns

Apple Music (and music platforms generally) construct titles compositionally rather than hand-writing one per entity — the formula is what scales to a catalog of hundreds of millions of tracks:

|Page type|Title pattern|Description pattern|
|-|-|-|
|Album|`{Album} by {Artist} on {Platform}`|`Listen to {Album} by {Artist} on {Platform}. {trackCount} songs.`|
|Song|`{Song} — Song by {Artist} on {Platform}`|`Listen to {Song} by {Artist} on {Platform}.`|
|Artist|`{Artist} on {Platform}`|`Listen to {Artist} on {Platform}. Stream songs including {top tracks}.`|
|Playlist|`{Playlist} — Playlist by {Curator} on {Platform}`|Pulls from the playlist's editorial description|
|Search|`{query} — Search Results on {Platform}` (or generic `Search` if no query)|Generic, often `noindex` since it's infinite/parametrized|

### Next.js implementation

```tsx
// lib/metadata.ts
import type { Metadata } from 'next';

const SITE = 'https://openXXX.com';
const SITE\_NAME = 'OpenXXX';

export function buildAlbumMetadata(album: {
  name: string;
  artistName: string;
  artistSlug: string;
  artistId: string;
  slug: string;
  id: string;
  storefront: string;
  artworkUrl: string; // already resolved to a real size, see §10
  trackCount: number;
  releaseDate: string;
  genres: string\[];
}): Metadata {
  const url = `${SITE}/${album.storefront}/album/${album.slug}/${album.id}`;
  const title = `${album.name} by ${album.artistName} on ${SITE\_NAME}`;
  const description = `Listen to ${album.name} by ${album.artistName} on ${SITE\_NAME}. ${album.trackCount} songs.`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildHreflangMap(album), // see helper below
    },
    openGraph: {
      type: 'music.album',
      title,
      description,
      url,
      siteName: SITE\_NAME,
      images: \[{ url: album.artworkUrl, width: 1200, height: 1200, alt: album.name }],
      musicians: \[`${SITE}/${album.storefront}/artist/${album.artistSlug}/${album.artistId}`],
      releaseDate: album.releaseDate,
    },
    twitter: {
      card: 'summary\_large\_image',
      title,
      description,
      images: \[album.artworkUrl],
    },
    robots: { index: true, follow: true },
  };
}

function buildHreflangMap(entity: { slug: string; id: string }) {
  const storefronts = \['us', 'gb', 'ca', 'au', 'sa', 'ae', 'my', 'id'];
  return Object.fromEntries(
    storefronts.map((sf) => \[sf, `${SITE}/${sf}/album/${entity.slug}/${entity.id}`])
  );
}
```

```tsx
// app/\[storefront]/album/\[slug]/\[id]/page.tsx
import { buildAlbumMetadata } from '@/lib/metadata';
import { getAlbum } from '@/lib/api/albums';

export async function generateMetadata({ params }: { params: { storefront: string; slug: string; id: string } }) {
  const album = await getAlbum(params.id, params.storefront);
  if (!album) return {}; // let it 404 downstream
  return buildAlbumMetadata({ ...album, storefront: params.storefront });
}

export default async function AlbumPage({ params, searchParams }: {
  params: { storefront: string; slug: string; id: string };
  searchParams: { i?: string }; // active track id, Apple-style
}) {
  const album = await getAlbum(params.id, params.storefront);
  const activeTrackId = searchParams.i;
  // ... render
}
```

### Other `<head>` tags worth carrying over

```tsx
// app/layout.tsx (or per-page metadata)
export const metadata: Metadata = {
  metadataBase: new URL('https://openXXX.com'),
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OpenXXX',
  },
  // Apple's "Smart App Banner" — prompts iOS Safari users to open your native app
  other: {
    'apple-itunes-app': 'app-id=YOUR\_APP\_ID, app-argument=https://openXXX.com/current/path',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
```

> Worth verifying live: whether Apple sets `noindex` on the `?i=` track-query variant of album URLs (likely, to avoid duplicate content against the standalone song page) and on search result pages beyond a certain depth. I'd implement both as `noindex, follow` defensively.

\---

## 4\. Open Graph (music namespace) \& Twitter Cards

This is the one section I'm most confident is byte-for-byte accurate to spec, because it's the **official Open Graph protocol** (ogp.me), not something Apple invented — `og:type` literally has dedicated `music.song`, `music.album`, `music.playlist`, and `music.radio\_station` types with their own property sets:

|`og:type`|Extra properties|
|-|-|
|`music.song`|`music:duration` (seconds), `music:album`, `music:album:disc`, `music:album:track`, `music:musician`|
|`music.album`|`music:song`, `music:song:disc`, `music:song:track`, `music:musician`, `music:release\_date`|
|`music.playlist`|`music:song`, `music:song:disc`, `music:song:track`, `music:creator`|
|`music.radio\_station`|`music:creator`|

Artist pages typically use `og:type: profile` (artists aren't quite "music" objects in the OGP sense — they're the `music:musician` referent).

Next.js's built-in `Metadata` type already has first-class support for these OGP music literals, so you don't need raw `<meta>` tags:

```tsx
// Song page
openGraph: {
  type: 'music.song',
  title: `${song.name} — Song by ${song.artistName} on ${SITE\_NAME}`,
  url: songUrl,
  images: \[{ url: song.artworkUrl, width: 1200, height: 1200 }],
  musicians: \[artistUrl],
  album: albumUrl,
  duration: song.durationSeconds, // not milliseconds
}
```

```tsx
// Optional: 30-second preview as og:audio, lets some crawlers/embeds inline-play
other: {
  'og:audio': song.previewUrl,
  'og:audio:type': 'audio/mp4',
}
```

```tsx
twitter: {
  card: 'summary\_large\_image', // standard share card
  title,
  description,
  images: \[song.artworkUrl],
}
```

If you want a Twitter/X **inline audio player card** (not just an image), that's `twitter:card = player`, which needs an iframe-embeddable URL you control:

```tsx
other: {
  'twitter:card': 'player',
  'twitter:player': `https://openXXX.com/embed/song/${song.id}`,
  'twitter:player:width': '480',
  'twitter:player:height': '180',
  'twitter:player:stream': song.previewUrl,
  'twitter:player:stream:content\_type': 'audio/mp4',
}
```

(This implies building a lightweight `/embed/\[type]/\[id]` route with no chrome, just a player — mirrors what Apple does with `embed.music.apple.com`.)

\---

## 5\. JSON-LD Structured Data

schema.org has purpose-built music vocab. This is what gets you rich results (artist knowledge panels, track snippets) in search — and it's the section where the **breadcrumb** piece you asked about lives.

```ts
// lib/json-ld.ts
type JsonLd = Record<string, unknown>;

export function artistJsonLd(artist: {
  name: string; url: string; image: string; genres: string\[]; sameAs?: string\[];
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: artist.url,
    image: artist.image,
    genre: artist.genres,
    ...(artist.sameAs ? { sameAs: artist.sameAs } : {}),
  };
}

export function albumJsonLd(album: {
  name: string; url: string; image: string; datePublished: string;
  artist: { name: string; url: string };
  tracks: { name: string; durationISO8601: string; position: number }\[];
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
        duration: t.durationISO8601, // e.g. "PT3M45S"
      })),
    },
  };
}

export function songJsonLd(song: {
  name: string; url: string; image: string; durationISO8601: string;
  isrc?: string;
  artist: { name: string; url: string };
  album: { name: string; url: string };
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
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }\[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Homepage only — enables a Google "sitelinks search box"
export function siteSearchJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://openXXX.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://openXXX.com/search?term={search\_term\_string}',
      'query-input': 'required name=search\_term\_string',
    },
  };
}
```

Duration must be **ISO 8601 duration format**, not raw seconds — `3:45` becomes `"PT3M45S"`:

```ts
export function toISO8601Duration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `PT${m}M${s}S`;
}
```

Injecting it in a Server Component (no `next/script` needed for static JSON-LD — plain `<script>` is correct here since it must be in initial HTML for crawlers):

```tsx
export default async function AlbumPage({ params }: { params: { storefront: string; slug: string; id: string } }) {
  const album = await getAlbum(params.id, params.storefront);
  const jsonLd = albumJsonLd(toAlbumJsonLdInput(album));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ \_\_html: JSON.stringify(jsonLd) }}
      />
      {/\* page content \*/}
    </>
  );
}
```

\---

## 6\. Breadcrumbs (visual + structured)

Two layers, both driven by the same data so they can never drift out of sync: the **visual `<nav>`** users see, and the **`BreadcrumbList` JSON-LD** crawlers read (built above in §5). A music catalog's natural breadcrumb depth is `Home → Artist → Album → Song` (or `Home → Genre → Artist → ...` if you support genre browsing).

```tsx
// components/Breadcrumb.tsx
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/json-ld';

type Crumb = { name: string; href: string };

export function Breadcrumb({ items }: { items: Crumb\[] }) {
  const jsonLd = breadcrumbJsonLd(items.map((i) => ({ name: i.name, url: i.href })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ \_\_html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-\[var(--text-secondary)]">
        <ol className="flex items-center gap-1.5">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 \&\& <span aria-hidden="true">/</span>}
                {isLast ? (
                  <span aria-current="page" className="font-medium text-\[var(--text-primary)]">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
```

```tsx
// usage on an album page
<Breadcrumb
  items={\[
    { name: 'Home', href: '/' },
    { name: album.artistName, href: `/artist/${album.artistSlug}/${album.artistId}` },
    { name: album.name, href: `/album/${album.slug}/${album.id}` },
  ]}
/>
```

Two rules worth keeping: (1) `aria-current="page"` on the last crumb only, never a link to itself; (2) the JSON-LD `item` URLs should be absolute, not relative — `https://openXXX.com/...`, not `/...`.

\---

## 7\. Sitemap \& robots.txt

A catalog this size can't ship one `sitemap.xml` — it needs a **sitemap index** referencing many chunked sitemap files (search engines cap individual sitemaps at 50,000 URLs / 50MB). Next.js's App Router has a built-in mechanism for exactly this via `generateSitemaps()`:

```tsx
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getArtistCount, getArtistsPage } from '@/lib/api/artists';

const PER\_SITEMAP = 5000;

export async function generateSitemaps() {
  const total = await getArtistCount();
  const count = Math.ceil(total / PER\_SITEMAP);
  return Array.from({ length: count }, (\_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const artists = await getArtistsPage({ offset: id \* PER\_SITEMAP, limit: PER\_SITEMAP });
  return artists.map((a) => ({
    url: `https://openXXX.com/artist/${a.slug}/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

This produces `/sitemap/0.xml`, `/sitemap/1.xml`, etc., automatically indexed under `/sitemap.xml`. Repeat the pattern per entity type (`sitemap-albums.ts`, `sitemap-songs.ts` if you split routes, or fold them into one generator that interleaves entity types by priority).

```tsx
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: \[
      {
        userAgent: '\*',
        allow: '/',
        disallow: \[
          '/api/',
          '/\*?\*i=',         // avoid indexing the album?i= track-query duplicate, see §1
          '/search',        // or 'allow with noindex meta' instead — pick one strategy, not both
        ],
      },
    ],
    sitemap: 'https://openXXX.com/sitemap.xml',
    host: 'https://openXXX.com',
  };
}
```

> Worth verifying live: Apple almost certainly disallows crawling of account/library/personalized routes (`/library/`, `/account/`, anything behind auth) and may allow-list specific bots differently (e.g. `Applebot` gets different treatment than generic `\*`). Check for an `Applebot`-specific rule block if you peek at the real file.

\---

## 8\. Search Page Architecture

```tsx
// app/\[storefront]/search/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: { term?: string } }): Promise<Metadata> {
  const term = searchParams.term;
  return {
    title: term ? `${term} — Search Results on OpenXXX` : 'Search — OpenXXX',
    description: term ? `Search results for "${term}" on OpenXXX.` : 'Search OpenXXX.',
    robots: { index: false, follow: true }, // parametrized result pages: keep out of the index
    alternates: { canonical: 'https://openXXX.com/search' }, // canonical points at the bare search page, not each query
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { term?: string } }) {
  const term = searchParams.term ?? '';
  const results = term ? await search(term) : null;
  // ... render results, grouped by entity type (artists / albums / songs), like Apple does
}
```

The **`SearchAction` JSON-LD** lives once on the homepage (§5, `siteSearchJsonLd()`), not on the search page itself — it tells Google "here's the URL template for *your* search box," which is what enables the sitelinks search box in results for your domain.

\---

## 9\. Entity Field Reference

This mirrors the public Apple Music API's resource schema (developer.apple.com/documentation/applemusicapi) — useful as a checklist of fields your own data layer should probably carry, whether or not you consume Apple's API directly.

**Song**

|Field|Type|Notes|
|-|-|-|
|`name`|string||
|`artistName`|string||
|`albumName`|string||
|`artwork`|`{ url, width, height, bgColor, textColor1-4 }`|`url` is a template, see §10|
|`durationInMillis`|number|convert to seconds/ISO8601 for JSON-LD|
|`genreNames`|string\[]||
|`releaseDate`|ISO date string||
|`isrc`|string|International Standard Recording Code|
|`trackNumber` / `discNumber`|number||
|`contentRating`|`"explicit" \| "clean" \| null`||
|`previews`|`\[{ url }]`|short clip, good for `og:audio` / `twitter:player:stream`|
|`composerName`|string||
|`hasLyrics`|boolean||

**Album**

|Field|Type|Notes|
|-|-|-|
|`name`|string||
|`artistName`|string||
|`artwork`|template object||
|`trackCount`|number||
|`releaseDate`|ISO date||
|`genreNames`|string\[]||
|`recordLabel`|string||
|`copyright`|string||
|`editorialNotes`|`{ standard, short }`|great source for meta description|
|`isSingle` / `isComplete`|boolean||

**Artist**

|Field|Type|Notes|
|-|-|-|
|`name`|string||
|`genreNames`|string\[]||
|`artwork`|template object||
|`editorialNotes`|`{ standard, short }`||

**Playlist**

|Field|Type|Notes|
|-|-|-|
|`name`|string||
|`curatorName`|string||
|`description`|`{ standard, short }`||
|`trackCount`|number||
|`lastModifiedDate`|ISO date|feeds `lastModified` in sitemap|
|`playlistType`|string|editorial vs user vs algorithmic|

\---

## 10\. Images: Apple's Artwork URL Template Pattern

Apple Music API artwork comes back as a **template string** with `{w}` / `{h}` placeholders rather than fixed-size URLs, so the client picks the resolution it needs:

```
https://is1-ssl.mzstatic.com/image/thumb/.../{w}x{h}bb.jpg
```

```ts
// lib/artwork.ts
export function resolveArtwork(template: string, size: number): string {
  return template.replace('{w}', String(size)).replace('{h}', String(size));
}
```

```tsx
import Image from 'next/image';
import { resolveArtwork } from '@/lib/artwork';

<Image
  src={resolveArtwork(album.artwork.url, 1200)}
  width={1200}
  height={1200}
  alt={`${album.name} by ${album.artistName}`}
  priority // above-the-fold album art = good LCP candidate
/>
```

Worth copying even if you host your own artwork: **store one template-able source image per asset, generate sizes on demand** (via `next/image` or an image CDN) rather than pre-baking every size — it's what makes the catalog-scale pattern above tractable.

\---

## 11\. Rendering Strategy: ISR vs SSR vs Static

Apple Music's web app behaves like crawler-friendly HTML is server-rendered per entity, with the catalog itself far too large to fully pre-build at deploy time. The Next.js equivalent is **ISR (Incremental Static Regeneration)**: pre-build the head of the catalog (top artists/albums), and lazily generate + cache the long tail on first request.

```tsx
// app/\[storefront]/artist/\[slug]/\[id]/page.tsx
export async function generateStaticParams() {
  const topArtists = await getTopArtists(2000); // pre-build the most-trafficked slice
  return topArtists.map((a) => ({ slug: a.slug, id: a.id }));
}

export const revalidate = 3600; // everything else: render on first hit, cache 1hr, then refresh

export default async function ArtistPage({ params }: { params: { slug: string; id: string; storefront: string } }) {
  const artist = await getArtist(params.id, params.storefront);
  if (!artist) notFound();
  // ...
}
```

For search (`/search?term=`), skip ISR entirely — it's inherently dynamic, so render on demand (`export const dynamic = 'force-dynamic'` or just let the `searchParams` dependency opt you out of static rendering automatically, which it does in App Router).

\---

