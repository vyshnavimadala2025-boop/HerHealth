import { Link } from 'react-router-dom'
import { ChevronRight, Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NextStepTileProps {
  icon: LucideIcon
  label: string
  description: string
  href: string
  isLoading?: boolean
  accentClassName?: string
  className?: string
}

/**
 * Compact horizontal action tile for the dashboard's "Continue your
 * journey" row — replaces full-size cards with a lighter, scannable
 * shortcut. Purely presentational; the caller supplies whatever
 * description text it already has (from its own existing data source).
 */
function NextStepTile({
  icon: Icon,
  label,
  description,
  href,
  isLoading = false,
  accentClassName = 'bg-accent text-accent-foreground',
  className,
}: NextStepTileProps) {
  return (
    <Link
      to={href}
      className={cn(
        'flex min-w-[13rem] flex-1 items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', accentClassName)}>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="truncate text-caption text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Loading…
            </span>
          ) : (
            description
          )}
        </span>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

export default NextStepTile
