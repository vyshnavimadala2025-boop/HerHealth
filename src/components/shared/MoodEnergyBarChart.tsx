import type { TimelinePoint } from '@/features/lifestyleIntelligence/lifestyleCalculations'

const MAX_SCORE = 5

interface MoodEnergyBarChartProps {
  points: TimelinePoint[]
  ariaLabel: string
}

/**
 * Shared mood/energy bar chart — the same visual pattern used by Hormone
 * Balance's Progress Timeline and Lifestyle Intelligence's Environmental
 * Timeline, extracted here so a third usage (Insights' Trend Analysis)
 * doesn't duplicate it a third time. Values are real, derived only from
 * the user's own recorded check-ins.
 */
function MoodEnergyBarChart({ points, ariaLabel }: MoodEnergyBarChartProps) {
  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2" role="img" aria-label={ariaLabel}>
      {points.map((point, index) => (
        <div key={`${point.label}-${index}`} className="flex min-w-[2.75rem] flex-1 flex-col items-center gap-1.5">
          <div className="flex h-28 w-full items-end justify-center gap-1">
            <div
              className="w-2.5 rounded-t-full bg-blush transition-all duration-500 motion-reduce:transition-none"
              style={{
                height: point.moodAverage ? `${(point.moodAverage / MAX_SCORE) * 100}%` : '4%',
                opacity: point.moodAverage ? 1 : 0.25,
              }}
              title={point.moodAverage ? `Mood ${point.moodAverage}/5` : 'No entries'}
            />
            <div
              className="w-2.5 rounded-t-full bg-lavender transition-all duration-500 motion-reduce:transition-none"
              style={{
                height: point.energyAverage ? `${(point.energyAverage / MAX_SCORE) * 100}%` : '4%',
                opacity: point.energyAverage ? 1 : 0.25,
              }}
              title={point.energyAverage ? `Energy ${point.energyAverage}/5` : 'No entries'}
            />
          </div>
          <p className="text-center text-caption whitespace-nowrap text-muted-foreground">{point.label}</p>
        </div>
      ))}
    </div>
  )
}

export default MoodEnergyBarChart
