import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CardLinkItem {
  key: string
  icon: LucideIcon
  title: string
  description: string
  href: string
  comingSoon?: boolean
}

interface CardLinkGridProps {
  items: CardLinkItem[]
  searchable?: boolean
  searchPlaceholder?: string
}

/**
 * Shared premium card grid for hub pages (Insights, Knowledge Hub) that
 * link out to either a real page or a shared coming-soon placeholder.
 * Optional client-side search filters the already-loaded item list —
 * no network request, so it's safe to enable anywhere.
 */
function CardLinkGrid({ items, searchable = false, searchPlaceholder = 'Search…' }: CardLinkGridProps) {
  const [query, setQuery] = useState('')

  const filtered = searchable
    ? items.filter((item) => {
        const haystack = `${item.title} ${item.description}`.toLowerCase()
        return haystack.includes(query.trim().toLowerCase())
      })
    : items

  return (
    <div className="flex flex-col gap-5">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search topics"
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                'group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
                'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
                  <item.icon className="size-4" aria-hidden="true" />
                </div>
                {item.comingSoon && (
                  <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    Coming soon
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-caption text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default CardLinkGrid
