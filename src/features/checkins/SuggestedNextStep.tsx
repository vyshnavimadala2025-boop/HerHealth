import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import type { CheckIn } from '@/features/checkins/types'
import { formatFriendlyDate as formatJournalDate } from '@/features/journal/types'

type LoadStatus = 'loading' | 'ready' | 'error'

interface SuggestedNextStepProps {
  todayStatus: LoadStatus
  todayCheckIn: CheckIn | null
  journalStatus: LoadStatus
  latestJournalDate: string | null
}

/**
 * Quiet, contextual "one helpful next step" — approved priority order:
 * 1) an incomplete daily check-in, 2) a journal action. Both conditions
 * are backed by data DashboardPage already has (todayCheckIn directly;
 * latestJournalDate lifted from DashboardJournalCard's existing fetch via
 * a callback prop — no new Supabase query). A third tier (goal progress)
 * was intentionally left out of this sub-stage: no goal data is fetched
 * anywhere on the dashboard today, and adding it would mean either a new
 * query or a new dashboard card, neither of which was part of the
 * approved Stage 5b scope — flagged separately for a follow-up decision
 * rather than fabricated here. Renders nothing if no tier's condition is
 * actually met, per instruction: never show an unbacked suggestion.
 */
function SuggestedNextStep({
  todayStatus,
  todayCheckIn,
  journalStatus,
  latestJournalDate,
}: SuggestedNextStepProps) {
  if (todayStatus === 'ready' && !todayCheckIn) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">A helpful next step</p>
          <p className="text-sm text-foreground">
            Your check-in is still open for today.{' '}
            <a href="#checkin-form" className="font-medium underline underline-offset-2">
              Complete it now
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  if (todayStatus === 'ready' && todayCheckIn && journalStatus === 'ready') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">Continue your wellness journey</p>
          <p className="text-sm text-foreground">
            {latestJournalDate ? (
              <>Your last journal entry was {formatJournalDate(latestJournalDate)}. </>
            ) : (
              <>You haven&apos;t written a journal entry yet. </>
            )}
            <Link to="/journal" className="font-medium underline underline-offset-2">
              Open your journal
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default SuggestedNextStep
