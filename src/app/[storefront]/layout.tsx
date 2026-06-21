import type { Metadata } from 'next'

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
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
        es: `${siteUrl}/es`,
        fr: `${siteUrl}/fr`,
        he: `${siteUrl}/he`,
        zh: `${siteUrl}/zh`,
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
