import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { AiInsightCategory, ConfidenceLevel } from '@/features/insights/aiInsightCategories'

function confidenceBadgeClassName(confidence: ConfidenceLevel): string {
  if (confidence === 'High consistency') return 'bg-support text-support-foreground'
  if (confidence === 'Moderate consistency') return 'bg-lavender text-lavender-foreground'
  if (confidence === 'Not tracked yet') return 'bg-muted text-muted-foreground'
  return 'bg-attention text-attention-foreground'
}

interface AiInsightCardProps {
  category: AiInsightCategory
}

/**
 * One AI Health Insight category card: title, icon, observation, wellness
 * interpretation, suggested next habit, confidence indicator, and last
 * updated date. Every field is populated by aiInsightCategories.ts from
 * real signals or an honest "not tracked yet" state — this component only
 * renders, it never computes.
 */
function AiInsightCard({ category }: AiInsightCardProps) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-9 items-center justify-center rounded-full ${
                category.tracked ? 'bg-lavender text-lavender-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <category.icon className="size-4" aria-hidden="true" />
            </div>
            <CardTitle>{category.label}</CardTitle>
          </div>
          <Badge className={confidenceBadgeClassName(category.confidence)}>{category.confidence}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 text-sm">
        <div>
          <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Observation</p>
          <p className="text-foreground">{category.observation}</p>
        </div>
        <div>
          <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
            Wellness interpretation
          </p>
          <p className="text-muted-foreground">{category.wellnessInterpretation}</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-support/25 p-2.5">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <p className="text-foreground">
            <span className="font-medium">Suggested next habit: </span>
            {category.suggestedNextHabit}
          </p>
        </div>
        <p className="border-t border-border pt-2 text-caption text-muted-foreground">
          Last updated: {category.lastUpdated ? formatFriendlyDate(category.lastUpdated) : 'Not yet recorded'}
        </p>
      </CardContent>
    </Card>
  )
}

export default AiInsightCard
