# Apple Music (music.apple.com) SEO & Metadata Architecture — Next.js Implementation Guide

> **Scope & honesty note:** `music.apple.com` blocks automated fetching via `robots.txt`, so the exact byte-for-byte HTML of a live page can't be pulled and reproduced here. What follows is reconstructed from **verifiable, documented sources**: Apple's own Performance Partners linking docs, Apple Developer Forums (confirmed URL/ID formats), the Apple Music API schema, and the schema.org/Open Graph specs that Apple (and every major music platform — Spotify, YouTube Music, Tidal) implements against. Anywhere a value is a *convention* rather than something Apple has publicly confirmed verbatim, it's marked **(inferred best practice)**. Treat the URL structures and ID formats as ground truth — those are confirmed in Apple's own dev forums and partner docs. Treat the meta-tag *content templates* as the industry-standard pattern you should replicate, not a leaked Apple source file.

---

## 1. Apple Music URL Architecture (confirmed)

Apple Music's web app uses a flat, locale-prefixed, slug+ID hybrid routing scheme. The numeric ID is the canonical identifier; the slug is decorative/SEO-only and Apple's router ignores it (you can swap the slug for garbage text and the page still resolves by ID).

```
https://music.apple.com/{storefront}/{resource}/{slug}/{id}[?i={subResourceId}][&l={lyricsLocale}]
```

| Resource | Pattern | Real confirmed example |
|---|---|---|
| Album | `/{cc}/album/{slug}/{albumId}` | `music.apple.com/us/album/1989-taylors-version/1713845538` |
| Song (track within an album — the canonical song link form) | `/{cc}/album/{slug}/{albumId}?i={songId}` | `music.apple.com/us/album/take-on-me-1985-12-mix-2015-remastered/1035047659?i=1035048414` |
| Song (standalone single, no `i` param needed) | `/{cc}/song/{slug}/{songId}` | — |
| Artist | `/{cc}/artist/{slug}/{artistId}` | — |
| Playlist | `/{cc}/playlist/{slug}/{playlistId}` | — |
| Music Video | `/{cc}/music-video/{slug}/{videoId}` | — |
| Station (radio) | `/{cc}/station/{slug}/{stationId}` | — |
| Search | `/{cc}/search?term={query}` | `music.apple.com/us/search` |
| Genre / Browse category | folded into Search since the 2023+ redesign — no longer a standalone indexable path | — |
| Subscribe / marketing | `/subscribe` | `music.apple.com/subscribe` |

**Key confirmed mechanics:**
- `{cc}` is a two-letter ISO storefront code (`us`, `gb`, `jp`, `my`, …) — this is Apple Music's locale/region prefix, equivalent to Next.js's `[locale]` segment.
- The numeric ID maps 1:1 to the Apple Music **Catalog API** resource ID — i.e. `GET https://api.music.apple.com/v1/catalog/{cc}/albums/{id}` returns the data backing that exact page. **Design your own platform the same way: the URL ID should be the same primary key your API/database uses, never a derived or rotating value.**
- The slug carries zero routing weight but full SEO weight — it's where your keyword equity lives. Apple slugifies as: lowercase, ASCII-transliterate diacritics, strip punctuation, collapse whitespace to single hyphens.
- A song's "real" address is its *parent album* with an `?i=` query parameter pointing at the track — Apple deliberately does **not** fragment song pages away from the album entity. This keeps backlink/ranking equity consolidated on the album page rather than splitting it across every track.
- Affiliate/partner links append `?at={affiliateToken}&ct={campaign}&app=music` and **must** carry `rel="nofollow"` — confirmed in Apple's Performance Partners linking guide. Replicate this for any outbound monetized links on your own platform.

---

## 2. Next.js Route Architecture (App Router translation)

```
app/
  [locale]/
    layout.tsx                      → sets <html lang>, hreflang alternates
    page.tsx                        → home / browse
    search/
      page.tsx                      → ?term= search results
    album/
      [slug]/
        [id]/
          page.tsx                  → album page; reads ?i= for active track
    song/
      [slug]/
        [id]/
          page.tsx                  → standalone single
    artist/
      [slug]/
        [id]/
          page.tsx
    playlist/
      [slug]/
        [id]/
          page.tsx
    music-video/
      [slug]/
        [id]/
          page.tsx
    station/
      [slug]/
        [id]/
          page.tsx
  sitemap.ts
  robots.ts
  opengraph-image.tsx               → fallback OG image generator (per-route overrides allowed)
```

The `[slug]/[id]` double-segment is intentional — it mirrors Apple's pattern exactly. The route handler should resolve by `id` only and **301-redirect** to the canonical slug if the slug in the URL doesn't match the current canonical slug (handles renamed titles without breaking old links):

```ts
// app/[locale]/album/[slug]/[id]/page.tsx
import { redirect, notFound } from 'next/navigation';
import { getAlbum } from '@/lib/catalog';
import { slugify } from '@/lib/slugify';

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; id: string }>;
}) {
  const { locale, slug, id } = await params;
  const album = await getAlbum(id, locale);
  if (!album) notFound();

  const canonicalSlug = slugify(album.title);
  if (slug !== canonicalSlug) {
    redirect(`/${locale}/album/${canonicalSlug}/${id}`);
  }

  return <AlbumView album={album} />;
}
```

---

## 3. `generateMetadata` per Resource Type

Next.js's `generateMetadata` is the direct equivalent of what Apple's server-rendered `<head>` does per route. Below are the field-by-field templates, modeled on what every major music platform (and Apple specifically, per its documented OG/Twitter card behavior on shared links) emits.

### 3.1 Album page

```ts
// app/[locale]/album/[slug]/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string; id: string }> }
): Promise<Metadata> {
  const { locale, id } = await params;
  const album = await getAlbum(id, locale);
  if (!album) return {};

  const title = `${album.title} by ${album.artistName} on [YourPlatform]`;
  const description = `Listen to ${album.title} by ${album.artistName}. ${album.trackCount} ${
    album.trackCount === 1 ? 'song' : 'songs'
  }. Released ${album.releaseDate}.${album.label ? ` ${album.label}.` : ''}`;
  const canonical = `https://yourplatform.com/${locale}/album/${slugify(album.title)}/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildHreflangMap(`/album/${slugify(album.title)}/${id}`),
    },
    openGraph: {
      type: 'music.album',
      url: canonical,
      title,
      description,
      siteName: 'YourPlatform',
      images: [{ url: album.artworkUrl(1200, 1200), width: 1200, height: 1200, alt: album.title }],
      // music.album-specific OG properties (industry convention, supported by FB/Twitter parsers)
      // music:musician, music:release_date, music:song, music:song:disc, music:song:track
    } as any,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [album.artworkUrl(1200, 1200)],
    },
    robots: { index: true, follow: true },
  };
}
```

**`music.album` Open Graph extension tags** (not core OG, but a documented convention major music sites emit and that Facebook's/Twitter's parsers honor):

```html
<meta property="og:type" content="music.album" />
<meta property="music:musician" content="https://yourplatform.com/en/artist/artist-slug/123" />
<meta property="music:release_date" content="2024-10-27" />
<meta property="music:song" content="https://yourplatform.com/en/album/.../1?i=2" />
<meta property="music:song:track" content="1" />
<meta property="music:song:disc" content="1" />
```

### 3.2 Song page (or album page with `?i=` active track)

```ts
export async function generateMetadata(
  { params, searchParams }: {
    params: Promise<{ locale: string; slug: string; id: string }>;
    searchParams: Promise<{ i?: string }>;
  }
): Promise<Metadata> {
  const { locale, id } = await params;
  const { i: trackId } = await searchParams;
  const album = await getAlbum(id, locale);
  const track = trackId ? album.tracks.find(t => t.id === trackId) : null;

  const entity = track ?? album; // fall back to album-level metadata
  const title = track
    ? `${track.title} — ${album.artistName} | ${album.title}`
    : `${album.title} by ${album.artistName}`;
  const description = track
    ? `Listen to "${track.title}" by ${album.artistName} from the album ${album.title}. Duration ${formatDuration(track.durationMs)}.`
    : `${album.trackCount} songs by ${album.artistName}.`;

  return {
    title,
    description,
    alternates: { canonical: track
      ? `https://yourplatform.com/${locale}/album/${slugify(album.title)}/${id}?i=${track.id}`
      : `https://yourplatform.com/${locale}/album/${slugify(album.title)}/${id}` },
    openGraph: {
      type: 'music.song',
      title,
      description,
      images: [{ url: album.artworkUrl(1200, 1200) }],
    } as any,
  };
}
```

**`music.song` OG tags (industry convention):**
```html
<meta property="og:type" content="music.song" />
<meta property="music:duration" content="213" />
<meta property="music:album" content="https://yourplatform.com/en/album/slug/123" />
<meta property="music:album:disc" content="1" />
<meta property="music:album:track" content="4" />
<meta property="music:musician" content="https://yourplatform.com/en/artist/slug/456" />
```

### 3.3 Artist page

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale, id } = await params;
  const artist = await getArtist(id, locale);

  const title = `${artist.name} — Songs, Albums, Reviews | YourPlatform`;
  const description = `Listen to ${artist.name} on YourPlatform. ${artist.albumCount} albums, ${artist.songCount} songs. ${artist.bio?.slice(0, 100) ?? ''}`;

  return {
    title,
    description,
    alternates: { canonical: `https://yourplatform.com/${locale}/artist/${slugify(artist.name)}/${id}` },
    openGraph: {
      type: 'profile',
      title,
      description,
      images: [{ url: artist.imageUrl(1200, 1200) }],
    },
  };
}
```

### 3.4 Playlist page

```ts
const title = `${playlist.name} — Playlist by ${playlist.curatorName} | YourPlatform`;
const description = `${playlist.trackCount} songs. ${playlist.description ?? ''}`.trim();
// openGraph.type: 'music.playlist'
```

### 3.5 Search page

```ts
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ term?: string }> }
): Promise<Metadata> {
  const { term } = await searchParams;
  return {
    title: term ? `"${term}" — Search Results | YourPlatform` : 'Search | YourPlatform',
    // Search result pages are almost universally noindex — infinite query-string
    // permutations create duplicate-content / crawl-budget waste. Apple's own
    // /search route is excluded from its sitemap for this reason.
    robots: { index: false, follow: true },
  };
}
```

---

## 4. JSON-LD Structured Data (schema.org)

Inject via a small server component that renders a `<script type="application/ld+json">`. This is what enables rich results (album art carousels, song snippets, sitelinks search box) in Google.

```tsx
// components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 4.1 `MusicAlbum` (album page)

```json
{
  "@context": "https://schema.org",
  "@type": "MusicAlbum",
  "@id": "https://yourplatform.com/en/album/album-slug/123",
  "name": "Album Title",
  "byArtist": {
    "@type": "MusicGroup",
    "name": "Artist Name",
    "url": "https://yourplatform.com/en/artist/artist-slug/456"
  },
  "datePublished": "2024-10-27",
  "genre": ["Pop"],
  "numTracks": 13,
  "image": "https://cdn.yourplatform.com/art/123/1200x1200.jpg",
  "url": "https://yourplatform.com/en/album/album-slug/123",
  "track": {
    "@type": "ItemList",
    "numberOfItems": 13,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "MusicRecording",
          "name": "Track One",
          "url": "https://yourplatform.com/en/album/album-slug/123?i=124",
          "duration": "PT3M42S"
        }
      }
    ]
  }
}
```

### 4.2 `MusicRecording` (song / track page)

```json
{
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  "@id": "https://yourplatform.com/en/album/album-slug/123?i=124",
  "name": "Track Title",
  "byArtist": { "@type": "MusicGroup", "name": "Artist Name" },
  "duration": "PT3M42S",
  "inAlbum": {
    "@type": "MusicAlbum",
    "name": "Album Title",
    "url": "https://yourplatform.com/en/album/album-slug/123"
  },
  "isrcCode": "USRC11700001"
}
```

### 4.3 `MusicGroup` / `Person` (artist page)

```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://yourplatform.com/en/artist/artist-slug/456",
  "name": "Artist Name",
  "genre": ["Pop"],
  "image": "https://cdn.yourplatform.com/artists/456/1200x1200.jpg",
  "url": "https://yourplatform.com/en/artist/artist-slug/456",
  "sameAs": [
    "https://www.instagram.com/artisthandle",
    "https://twitter.com/artisthandle"
  ]
}
```

### 4.4 `MusicPlaylist`

```json
{
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": "Playlist Name",
  "numTracks": 50,
  "url": "https://yourplatform.com/en/playlist/playlist-slug/789",
  "track": { "@type": "ItemList", "numberOfItems": 50, "itemListElement": [] }
}
```

### 4.5 `BreadcrumbList` (every non-home page)

This is the schema that produces the breadcrumb trail under the blue link in Google search results. Apple Music's web app itself shows a visual breadcrumb (Home › Artist › Album) — pair it with this structured equivalent:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yourplatform.com/en" },
    { "@type": "ListItem", "position": 2, "name": "Artist Name", "item": "https://yourplatform.com/en/artist/artist-slug/456" },
    { "@type": "ListItem", "position": 3, "name": "Album Title", "item": "https://yourplatform.com/en/album/album-slug/123" }
  ]
}
```

```tsx
// components/Breadcrumb.tsx
type Crumb = { name: string; href?: string };

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `https://yourplatform.com${c.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          {trail.map((c, i) => (
            <li key={i}>
              {c.href && i < trail.length - 1 ? <a href={c.href}>{c.name}</a> : <span aria-current="page">{c.name}</span>}
              {i < trail.length - 1 && <span aria-hidden="true"> › </span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

### 4.6 `WebSite` + `SearchAction` (root layout — enables Google's sitelinks search box)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "YourPlatform",
  "url": "https://yourplatform.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yourplatform.com/en/search?term={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

Place this once, in `app/[locale]/layout.tsx`.

---

## 5. Sitemap & Robots (Next.js native file conventions)

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/search', '/api/'] },
    ],
    sitemap: 'https://yourplatform.com/sitemap.xml',
  };
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getAllAlbumIds, getAllArtistIds, getAllPlaylistIds } from '@/lib/catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [albums, artists, playlists] = await Promise.all([
    getAllAlbumIds(), getAllArtistIds(), getAllPlaylistIds(),
  ]);

  return [
    { url: 'https://yourplatform.com', changeFrequency: 'daily', priority: 1 },
    ...albums.map(a => ({
      url: `https://yourplatform.com/en/album/${a.slug}/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...artists.map(a => ({
      url: `https://yourplatform.com/en/artist/${a.slug}/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...playlists.map(p => ({
      url: `https://yourplatform.com/en/playlist/${p.slug}/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
  ];
}
```

> Apple's own `/search` route carries no indexable canonical and is excluded above for the same reason — query-string search pages create unbounded duplicate-content surfaces. For large catalogs (50k+ URLs), split into `sitemap-albums.xml`, `sitemap-artists.xml`, etc., and serve a `sitemap-index.xml` — Next.js supports this via `generateSitemaps()`.

---

## 6. Locale / hreflang (storefront equivalent)

Apple Music's `{cc}` storefront prefix is functionally identical to a Next.js `[locale]` segment with `i18n` routing. Implement reciprocal hreflang tags so Google knows the `/us/`, `/gb/`, `/my/` versions are alternates, not duplicates:

```ts
function buildHreflangMap(path: string) {
  const locales = ['en', 'ar', 'ms', 'id']; // adapt to your storefronts
  return Object.fromEntries([
    ...locales.map(l => [l, `https://yourplatform.com/${l}${path}`]),
    ['x-default', `https://yourplatform.com/en${path}`],
  ]);
}
```

```ts
// used inside generateMetadata:
alternates: {
  canonical: `https://yourplatform.com/${locale}${path}`,
  languages: buildHreflangMap(path),
}
```

---

## 7. Dynamic Open Graph Image Generation

Apple Music's shared links render the album/playlist artwork directly as the OG image (no overlay graphics — they let 1:1 cover art do the work). Replicate with `next/og`:

```tsx
// app/[locale]/album/[slug]/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getAlbum } from '@/lib/catalog';

export const size = { width: 1200, height: 1200 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string; locale: string } }) {
  const album = await getAlbum(params.id, params.locale);
  return new ImageResponse(
    (
      <img
        src={album.artworkUrl(1200, 1200)}
        width={1200}
        height={1200}
        style={{ objectFit: 'cover' }}
      />
    ),
    size
  );
}
```

For artist pages, a square crop of the artist image at 1200×1200 follows the same pattern Apple uses for artist avatar shares.

---

## 8. Title-tag & meta-description templates — quick reference

| Page | `<title>` template | `<meta name="description">` template |
|---|---|---|
| Album | `{Album} by {Artist} on {Platform}` | `Listen to {Album} by {Artist}. {N} songs. Released {date}.` |
| Song | `{Song} — {Artist} \| {Album}` | `Listen to "{Song}" by {Artist} from {Album}. Duration {mm:ss}.` |
| Artist | `{Artist} — Songs, Albums \| {Platform}` | `Listen to {Artist} on {Platform}. {N} albums, {N} songs.` |
| Playlist | `{Playlist} — Playlist by {Curator} \| {Platform}` | `{N} songs. {playlist description}` |
| Search | `"{term}" — Search Results \| {Platform}` | *(noindex — description optional)* |
| Home | `{Platform} — {tagline}` | `{1–2 sentence platform value prop}` |

Title length budget: keep to **≤60 characters** so it doesn't truncate in SERPs; description **≤155 characters**.

---

## 9. Mapping this to OpenTuwa (Quran audio domain)

Your catalog maps cleanly onto Apple Music's entity model — reuse the exact same architecture, just relabel the resources:

| Apple Music concept | OpenTuwa equivalent | Notes |
|---|---|---|
| Artist (`MusicGroup`) | **Reciter** (`Person`, not `MusicGroup` — schema.org has no group concept here) | `/{locale}/reciter/{slug}/{id}` |
| Album (`MusicAlbum`) | **Riwayah / Collection** (e.g. "Hafs an Asim — Full Quran") | `/{locale}/collection/{slug}/{id}` |
| Song (`MusicRecording`) | **Surah recitation** | `/{locale}/collection/{slug}/{id}?i={surahId}`, or standalone `/{locale}/surah/{slug}/{id}` |
| Track number | **Surah number (1–114)** | maps directly to `music:album:track` / `position` |
| Playlist (`MusicPlaylist`) | **Juz' / thematic playlist** (e.g. "Last 10 Surahs", "Ramadan Night Prayers") | `/{locale}/playlist/{slug}/{id}` |
| ISRC code | *(no direct equivalent)* — use your own internal `surah_id + reciter_id` composite as the stable identifier | |
| `music:duration` | recitation duration in seconds | unchanged |
| Genre | **Qira'ah style** (Hafs, Warsh, etc.) — could double as `schema.org` `genre` field | |

`MusicRecording` is actually schema.org-valid for non-music spoken audio too (it's used broadly for "recorded audio item"), so you don't need a custom schema — it will validate and is eligible for the same rich-result treatment Google gives song results. For the `Person` (reciter) entity, add `"jobTitle": "Quran Reciter"` and `"sameAs"` links to any official reciter profile if available, mirroring how Apple links artist `sameAs` to verified social profiles.

---

## 10. Checklist before shipping

- [ ] Canonical URL always points to the **ID-stable** route, even when the slug is stale (301 redirect old slugs)
- [ ] Every entity page emits exactly one matching JSON-LD block (`MusicAlbum`, `MusicRecording`, `MusicGroup`/`Person`, `MusicPlaylist`)
- [ ] `BreadcrumbList` JSON-LD matches the *visible* breadcrumb UI 1:1 — mismatches get structured data flagged/ignored by Google
- [ ] `WebSite` + `SearchAction` declared once at root layout for sitelinks search box eligibility
- [ ] `/search` and any internal filter/query routes are `noindex, follow`
- [ ] `sitemap.xml` excludes noindexed routes, includes `lastModified`
- [ ] hreflang reciprocity verified (each locale variant links to all others + `x-default`)
- [ ] OG image is square 1200×1200 cover art, no platform watermark overlay (matches Apple/Spotify convention — keeps shares looking native on iMessage/WhatsApp link previews)
- [ ] Validate every JSON-LD block with Google's [Rich Results Test](https://search.google.com/test/rich-results) before deploy
