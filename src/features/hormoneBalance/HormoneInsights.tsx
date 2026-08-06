import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { HormoneInsight } from '@/features/hormoneBalance/hormoneInsightEngine'

interface HormoneInsightsProps {
  status: 'loading' | 'ready' | 'error'
  insights: HormoneInsight[]
}

/**
 * "AI Hormone Insights" per the feature spec — in practice, the same
 * honest, deterministic rule-based pattern used everywhere else in
 * HerHealth (Wellness Insights, Fertility Journey, Baby Growth), never a
 * real model call. Every message already ends with "This is not medical
 * advice." from the insight engine itself.
 */
function HormoneInsights({ status, insights }: HormoneInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>AI Hormone Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your insights.</p>}

        {status === 'ready' && (
          <>
            <ul className="flex flex-col gap-2 animate-in fade-in duration-500 motion-reduce:animate-none">
              {insights.map((insight) => (
                <li
                  key={insight.id}
                  className="flex gap-3 rounded-xl border border-border bg-gradient-to-br from-lavender/30 to-transparent p-3.5 transition-shadow hover:shadow-sm"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-primary">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{insight.title}</p>
                    <p className="text-muted-foreground">{insight.message}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              These are gentle, pattern-based observations from the information you&apos;ve
              recorded in HerHealth — not output from a diagnostic or predictive medical tool.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default HormoneInsights
