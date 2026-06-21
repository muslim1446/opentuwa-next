import Link from 'next/link'
import { breadcrumbJsonLd } from '@/lib/json-ld'

type Crumb = { name: string; href: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const jsonLd = breadcrumbJsonLd(items.map((i) => ({ name: i.name, url: i.href })))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <ol className="flex items-center gap-1.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true" style={{ opacity: 0.4 }}>/</span>}
                {isLast ? (
                  <span aria-current="page" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
