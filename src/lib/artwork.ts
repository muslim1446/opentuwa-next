export function resolveArtwork(url: string, size: number): string {
  return url.replace('{w}', String(size)).replace('{h}', String(size))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toISO8601Duration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `PT${m}M${s}S`
}
