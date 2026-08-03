import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import { filterTimelineByTypes } from '@/features/reports/reportCalculations'
import { TIMELINE_ENTRY_TYPES } from '@/features/reports/types'
import type { TimelineEntry, TimelineEntryType } from '@/features/reports/types'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<TimelineEntryType, string> = {
  checkin: 'Check-ins',
  journal: 'Journal',
  period: 'Periods',
  goal_created: 'Goals created',
  goal_completed: 'Goals completed',
  goal_progress: 'Goal progress',
  pcos_wellness: 'Wellness tracking',
  reminder_updated: 'Reminders',
}

function presentTypesIn(entries: TimelineEntry[]): TimelineEntryType[] {
  return TIMELINE_ENTRY_TYPES.filter((type) => entries.some((entry) => entry.type === type))
}

interface PersonalTimelineProps {
  status: 'loading' | 'ready' | 'error'
  entries: TimelineEntry[]
  onRetry: () => void
}

/**
 * Renders only entry.date and entry.label, both of which are always
 * constructed by reportCalculations.ts's buildTimeline() from fixed text —
 * never from journal title/content or PCOS observations/note. There is no
 * code path here that could render private free text even if the source
 * objects contained it.
 *
 * The record-type filter is a pure client-side operation on the already-
 * fetched `entries` prop (via filterTimelineByTypes) — it never triggers a
 * Supabase query. Selection resets to "everything" whenever a fresh
 * `entries` array arrives (i.e. whenever the report date range changes or
 * data is retried), so a stale filter can never silently hide newly
 * relevant data after the range changes.
 */
function PersonalTimeline({ status, entries, onRetry }: PersonalTimelineProps) {
  const [selectedTypes, setSelectedTypes] = useState<TimelineEntryType[]>(() => presentTypesIn(entries))

  useEffect(() => {
    setSelectedTypes(presentTypesIn(entries))
  }, [entries])

  const toggleType = (type: TimelineEntryType) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    )
  }

  const availableTypes = presentTypesIn(entries)
  const filteredEntries = filterTimelineByTypes(entries, selectedTypes)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personal Timeline</CardTitle>
        <CardDescription>
          A chronological view of your recorded activity in this range. Journal and wellness entry text is
          never shown here — open Journal or Wellness Tracker directly to read your own entries.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === 'loading' && (
          <div role="status" className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your timeline…
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your timeline. Please try again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <p role="status" className="text-sm text-muted-foreground">
            No activity recorded in this range yet.
          </p>
        )}

        {status === 'ready' && entries.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5 print:hidden" role="group" aria-label="Filter timeline by type">
              {availableTypes.map((type) => {
                const isActive = selectedTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggleType(type)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-caption font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
                      isActive
                        ? 'border-primary bg-accent/40 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                )
              })}
            </div>

            {filteredEntries.length === 0 ? (
              <p role="status" className="text-sm text-muted-foreground">
                No activity matches the selected filters.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm last:border-b-0 last:pb-0"
                  >
                    <span>{entry.label}</span>
                    <span className="shrink-0 text-caption text-muted-foreground">
                      {formatFriendlyDate(entry.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PersonalTimeline
