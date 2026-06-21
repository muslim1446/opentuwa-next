import type { Metadata } from 'next'
import { buildSearchMetadata } from '@/lib/metadata'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muslim.opentuwa.com'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ storefront: string }>
  searchParams: Promise<{ term?: string }>
}): Promise<Metadata> {
  const { storefront } = await params
  const sp = await searchParams
  return buildSearchMetadata({ term: sp.term, storefront })
}

export default async function SearchPage({ params, searchParams }: {
  params: Promise<{ storefront: string }>
  searchParams: Promise<{ term?: string }>
}) {
  const { storefront } = await params
  const sp = await searchParams
  const term = sp.term ?? ''

  return <div id="search-root" data-storefront={storefront} data-term={term} />
}
