export const runtime = 'edge'

import type { Metadata } from 'next'
import { buildSearchMetadata } from '@/lib/metadata'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ term?: string }> }): Promise<Metadata> {
  const { term } = await searchParams
  return buildSearchMetadata(term)
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  const { term } = await searchParams
  return (
    <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.03em' }}>
        {term ? `Search results for "${term}"` : 'Search'}
      </h1>
    </div>
  )
}
