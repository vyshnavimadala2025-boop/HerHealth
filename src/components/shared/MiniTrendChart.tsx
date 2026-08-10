export interface MiniTrendPoint {
  label: string
  value: number | null
}

interface MiniTrendChartProps {
  points: MiniTrendPoint[]
  maxValue: number
  colorClassName?: string
  ariaLabel: string
}

/**
 * Generic single-series mini bar chart — the reusable chart primitive
 * behind every Trend card on /insights/trends. Deliberately simple (plain
 * div bars, no charting library) so it can plot any bounded numeric
 * series (mood/energy 1–5 scores, weekly entry counts, and so on) without
 * a bespoke chart per metric.
 */
function MiniTrendChart({ points, maxValue, colorClassName = 'bg-primary', ariaLabel }: MiniTrendChartProps) {
  return (
    <div className="flex items-end gap-1.5 overflow-x-auto pb-2" role="img" aria-label={ariaLabel}>
      {points.map((point, index) => (
        <div key={`${point.label}-${index}`} className="flex min-w-[1.25rem] flex-1 flex-col items-center gap-1">
          <div className="flex h-14 w-full items-end">
            <div
              className={`w-full rounded-t-sm transition-all duration-500 motion-reduce:transition-none ${colorClassName}`}
              style={{
                height: point.value !== null ? `${Math.max(4, (point.value / maxValue) * 100)}%` : '4%',
                opacity: point.value !== null ? 1 : 0.2,
              }}
              title={point.value !== null ? `${point.label}: ${point.value}` : `${point.label}: no data`}
            />
          </div>
          <p className="text-center text-[0.65rem] whitespace-nowrap text-muted-foreground">{point.label}</p>
        </div>
      ))}
    </div>
  )
}

export default MiniTrendChart
