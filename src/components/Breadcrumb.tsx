import Link from 'next/link'
import { breadcrumbJsonLd } from '@/lib/json-ld'

type Crumb = { name: string; href: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const jsonLd = breadcrumbJsonLd(items.map((i) => ({ name: i.name, url: i.href })))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-secondary)] px-4 py-2">
        <ol className="flex items-center gap-1.5">
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {isLast ? (
                  <span aria-current="page" className="font-medium text-[var(--text-primary)]">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:underline">
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
