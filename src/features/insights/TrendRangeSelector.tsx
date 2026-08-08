import { cn } from '@/lib/utils'
import { HEALTH_TREND_RANGES, type HealthTrendRangeKey } from '@/features/insights/healthTrendsCalculations'

interface TrendRangeSelectorProps {
  value: HealthTrendRangeKey
  onChange: (value: HealthTrendRangeKey) => void
}

/** Segmented time-range control for Health Trends — same button-group visual and keyboard pattern as DateRangeSelector's presets. */
function TrendRangeSelector({ value, onChange }: TrendRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trend time range">
      {HEALTH_TREND_RANGES.map((range) => {
        const isActive = range.key === value
        return (
          <button
            key={range.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(range.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
              isActive
                ? 'border-primary bg-accent/40 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}

export default TrendRangeSelector
