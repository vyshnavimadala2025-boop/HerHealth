import { Heart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { HormoneSuggestion } from '@/features/hormoneBalance/hormoneInsightEngine'

interface WellnessSuggestionsProps {
  status: 'loading' | 'ready' | 'error'
  suggestions: HormoneSuggestion[]
}

/**
 * "AI Wellness Suggestions" per the spec — gentle, generic lifestyle
 * nudges only. Never diagnoses, never names a condition, never claims to
 * treat anything. Framed the same honest, rule-based way as every other
 * "AI"-labeled surface in SIRILA.
 */
function WellnessSuggestions({ status, suggestions }: WellnessSuggestionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blush text-blush-foreground">
            <Heart className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>AI Wellness Suggestions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {status !== 'loading' && (
          <>
            <ul className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-foreground">{suggestion.message}</p>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              Gentle, general suggestions only — never a diagnosis or treatment plan. This is not
              medical advice.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default WellnessSuggestions
