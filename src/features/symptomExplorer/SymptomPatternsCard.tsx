import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import EmptyState from '@/components/shared/EmptyState'
import type { SymptomPattern } from '@/features/symptomExplorer/symptomEducation'
import { symptomLabel } from '@/features/symptomExplorer/symptomEducation'

interface SymptomPatternsCardProps {
  status: 'loading' | 'ready' | 'error'
  patterns: SymptomPattern[]
}

/**
 * "See relevant wellness tracking/context" — a plain, honest frequency
 * count over the recorded entries (buildSymptomPatterns), never a
 * diagnosis or trend claim. Only ever shows a pattern the real data
 * actually supports (see the ≥2-day threshold in buildSymptomPatterns).
 */
function SymptomPatternsCard({ status, patterns }: SymptomPatternsCardProps) {
  if (status !== 'ready') return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <CardTitle>Patterns Worth Noticing</CardTitle>
        </div>
        <CardDescription>Based only on what you&apos;ve recorded in the last 30 days — never a diagnosis.</CardDescription>
      </CardHeader>
      <CardContent>
        {patterns.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Not enough recorded data yet"
            description="Once you've recorded the same symptom on a few different days, a pattern will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {patterns.map((pattern) => (
              <li key={pattern.symptom} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-foreground">
                  You&apos;ve recorded <span className="font-medium">{symptomLabel(pattern.symptom)}</span> on{' '}
                  {pattern.daysRecorded} of the last {pattern.windowDays} days — a pattern that may be worth
                  noticing.
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-caption text-muted-foreground">
          Educational only. Consider discussing persistent or concerning symptoms with a healthcare professional.
        </p>
      </CardContent>
    </Card>
  )
}

export default SymptomPatternsCard
