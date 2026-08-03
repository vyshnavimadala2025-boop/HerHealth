import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { TimelineEntry } from '@/features/reports/types'

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
 */
function PersonalTimeline({ status, entries, onRetry }: PersonalTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personal Timeline</CardTitle>
        <CardDescription>
          A chronological view of your recorded activity in this range. Journal and wellness entry text is
          never shown here — open Journal or Wellness Tracker directly to read your own entries.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm last:border-b-0 last:pb-0">
                <span>{entry.label}</span>
                <span className="shrink-0 text-caption text-muted-foreground">
                  {formatFriendlyDate(entry.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default PersonalTimeline
