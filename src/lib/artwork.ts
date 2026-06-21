export function resolveArtwork(template: string, size: number): string {
  return template.replace('{w}', String(size)).replace('{h}', String(size))
}
