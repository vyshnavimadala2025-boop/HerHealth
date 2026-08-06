import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { PregnancyInsight } from '@/features/pregnancy/pregnancyInsightEngine'

interface PregnancyInsightsProps {
  status: 'loading' | 'ready' | 'error'
  insights: PregnancyInsight[]
}

function PregnancyInsights({ status, insights }: PregnancyInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Wellness Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your insights.</p>}

        {status === 'ready' && insights.length === 0 && (
          <p className="text-muted-foreground">Keep tracking, and supportive insights will appear here.</p>
        )}

        {status === 'ready' && insights.length > 0 && (
          <>
            <ul className="flex flex-col gap-2 animate-in fade-in duration-500 motion-reduce:animate-none">
              {insights.map((insight) => (
                <li key={insight.id} className="flex gap-3 rounded-lg border border-border p-3 transition-shadow hover:shadow-sm">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-lavender text-primary">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-muted-foreground">{insight.message}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              Supportive wellness coaching only, based on what you record. Never a diagnosis,
              medical recommendation, or substitute for professional care.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PregnancyInsights
