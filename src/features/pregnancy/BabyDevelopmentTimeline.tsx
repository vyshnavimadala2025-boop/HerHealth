import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { getWeekContent, ALL_WEEKS } from '@/features/pregnancy/weeklyContent'
import { cn } from '@/lib/utils'

interface BabyDevelopmentTimelineProps {
  currentWeek: number
}

/**
 * A week-selector strip (Week 1 → Week 40) plus a detail panel for
 * whichever week is selected — combines "Baby Development Timeline" and
 * "Weekly Journey" from the spec into one component rather than two,
 * since a selected-week detail view *is* the weekly journey page.
 * Defaults to the user's real current week, computed from their entered
 * due date (see pregnancyCalculations.ts) — not a guess.
 */
function BabyDevelopmentTimeline({ currentWeek }: BabyDevelopmentTimelineProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setSelectedWeek(currentWeek)
  }, [currentWeek])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedWeek])

  const content = getWeekContent(selectedWeek)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-primary">
          <Heart className="size-4" aria-hidden="true" />
        </div>
        <p className="font-display text-heading text-foreground">Baby Development Timeline</p>
      </div>

      <div
        role="tablist"
        aria-label="Select a pregnancy week"
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {ALL_WEEKS.map((week) => {
          const isSelected = week.week === selectedWeek
          const isCurrent = week.week === currentWeek
          return (
            <button
              key={week.week}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedWeek(week.week)}
              className={cn(
                'flex min-h-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2 text-caption transition-colors',
                isSelected
                  ? 'border-primary bg-lavender text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/50',
              )}
            >
              <span className="font-medium">Wk {week.week}</span>
              {isCurrent && <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      <div
        key={selectedWeek}
        className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 animate-in fade-in duration-300 motion-reduce:animate-none sm:p-5"
      >
        <div className="flex flex-col gap-1">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">
            Week {content.week} · Trimester {content.trimester}
          </p>
          <p className="font-display text-lg text-foreground">
            About the size of {content.babySize}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-caption font-medium text-foreground">Baby&apos;s development</p>
            <p className="text-caption text-muted-foreground">{content.developmentNote}</p>
          </div>
          <div>
            <p className="text-caption font-medium text-foreground">Your body</p>
            <p className="text-caption text-muted-foreground">{content.momChanges}</p>
          </div>
          <div>
            <p className="text-caption font-medium text-foreground">Wellness focus</p>
            <p className="text-caption text-muted-foreground">{content.wellnessFocus}</p>
          </div>
          <div>
            <p className="text-caption font-medium text-foreground">Nutrition focus</p>
            <p className="text-caption text-muted-foreground">{content.nutritionFocus}</p>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-caption font-medium text-foreground">A gentle reminder</p>
          <p className="text-caption text-muted-foreground">{content.emotionalTip}</p>
        </div>
      </div>

      <p className="text-caption text-muted-foreground">
        General wellness education, not medical guidance — always follow the advice of your own
        healthcare provider.
      </p>
    </div>
  )
}

export default BabyDevelopmentTimeline
