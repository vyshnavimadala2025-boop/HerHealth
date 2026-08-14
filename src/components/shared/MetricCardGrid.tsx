import type { LucideIcon } from 'lucide-react'
import Skeleton from '@/components/shared/Skeleton'

export interface MetricCard {
  key: string
  icon: LucideIcon
  label: string
  status: string
  trend: string
  caption: string
  accentClassName: string
  tracked: boolean
}

interface MetricCardGridProps {
  status: 'loading' | 'ready' | 'error'
  cards: MetricCard[]
  columnsClassName?: string
}

/**
 * Shared "status + weekly trend + educational caption" card grid, used
 * anywhere SIRILA shows a snapshot of tracked-or-not-yet-tracked
 * lifestyle/environmental metrics (Lifestyle Intelligence, Environmental
 * Wellness). Untracked cards use a calm, premium "Not tracked" treatment
 * rather than looking broken or empty.
 */
function MetricCardGrid({ status, cards, columnsClassName }: MetricCardGridProps) {
  if (status === 'loading') {
    return (
      <div role="status" className={columnsClassName ?? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'}>
        {Array.from({ length: cards.length || 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className={columnsClassName ?? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'}>
      {cards.map((card) => (
        <div
          key={card.key}
          className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
        >
          <div className="flex items-center justify-between">
            <div className={`flex size-9 items-center justify-center rounded-full ${card.accentClassName}`}>
              <card.icon className="size-4" aria-hidden="true" />
            </div>
            {!card.tracked && (
              <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                Not tracked
              </span>
            )}
          </div>
          <div>
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{card.label}</p>
            <p className="text-sm font-medium text-foreground">{card.status}</p>
            <p className="text-caption text-muted-foreground">{card.trend}</p>
          </div>
          <p className="text-caption text-muted-foreground">{card.caption}</p>
        </div>
      ))}
    </div>
  )
}

export default MetricCardGrid
