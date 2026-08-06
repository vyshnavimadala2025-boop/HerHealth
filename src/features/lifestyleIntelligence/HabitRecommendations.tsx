import { Leaf } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { HabitRecommendation } from '@/features/lifestyleIntelligence/lifestyleInsightEngine'

interface HabitRecommendationsProps {
  status: 'loading' | 'ready' | 'error'
  recommendations: HabitRecommendation[]
}

/** Gentle, supportive, never-medical suggestions — see lifestyleInsightEngine for the rules. */
function HabitRecommendations({ status, recommendations }: HabitRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-support text-support-foreground">
            <Leaf className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Healthy Habit Recommendations</CardTitle>
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
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recommendations.map((recommendation) => (
                <li key={recommendation.id} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-foreground">{recommendation.message}</p>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              Gentle, general suggestions only — always supportive, never medical.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default HabitRecommendations
