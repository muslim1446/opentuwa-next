import type { Metadata } from 'next'

export const runtime = 'edge'

const siteUrl = 'https://muslim.opentuwa.com'

export async function generateMetadata({ params }: { params: Promise<{ storefront: string }> }): Promise<Metadata> {
  const { storefront } = await params
  const localeName = new Intl.DisplayNames([storefront], { type: 'language' }).of(storefront) || storefront

  return {
    title: {
      default: `Tuwa - Quran Audio in ${localeName}`,
      template: `%s | Tuwa ${localeName}`,
    },
    description: `Listen to the Quran with verse-by-verse translation in ${localeName}. Premium audio streaming by multiple reciters.`,
    alternates: {
      canonical: `${siteUrl}/${storefront}`,
      languages: {
        en: `${siteUrl}/us`,
        ar: `${siteUrl}/sa`,
        ms: `${siteUrl}/my`,
        id: `${siteUrl}/id`,
      },
    },
  }
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ storefront: string }>
}) {
  return <>{children}</>
}
