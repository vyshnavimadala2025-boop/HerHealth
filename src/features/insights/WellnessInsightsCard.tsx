import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Insight } from '@/features/insights/types'

interface WellnessInsightsCardProps {
  status: 'loading' | 'ready' | 'error'
  insights: Insight[]
}

function WellnessInsightsCard({ status, insights }: WellnessInsightsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness Insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your insights…
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your insights.</p>
        )}

        {status === 'ready' && (
          <>
            <ul className="flex flex-col gap-2">
              {insights.map((insight) => (
                <li key={insight.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-muted-foreground">{insight.message}</p>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              These insights are based only on the information you record in HerHealth and are
              not medical advice or a medical diagnosis.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default WellnessInsightsCard
