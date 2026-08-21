import { cn } from '@/lib/utils'

interface RhythmVisualizationProps {
  dwells: number[]
  flights: number[]
  /** "inline" sits inside the phone screen and is the accessible, labeled version. "ambient" floats decoratively around the phone on larger screens and is purely visual. */
  variant?: 'inline' | 'ambient'
  className?: string
}

/**
 * Renders real interaction timing as bars (dwell) and connected dots
 * (flight) — every value here comes from the caller's actual
 * `computeTimingSamples` output, never a random/fake number. The
 * "ambient" variant is the same data, just skinned as floating nodes
 * around the phone for the desktop hero presentation; both read from the
 * same samples so the visualization never runs independently of real
 * interaction events.
 */
function RhythmVisualization({ dwells, flights, variant = 'inline', className }: RhythmVisualizationProps) {
  const maxDwell = Math.max(60, ...dwells)
  const maxFlight = Math.max(80, ...flights)
  const isAmbient = variant === 'ambient'

  return (
    <div className={cn('flex flex-col gap-2', className)} {...(isAmbient ? { 'aria-hidden': true } : {})}>
      <div
        className={cn('flex items-end justify-center gap-1.5', isAmbient ? 'h-10' : 'h-16')}
        {...(!isAmbient
          ? {
              role: 'img',
              'aria-label':
                'Live rhythm visualization: bar height reflects how long each tap or key press was held',
            }
          : {})}
      >
        {dwells.length === 0 ? (
          !isAmbient && <p className="pb-4 text-caption text-hero-panel-foreground/40">Start tapping or typing above</p>
        ) : (
          dwells.map((dwell, index) => {
            const isLast = index === dwells.length - 1
            return (
              <div
                key={index}
                className={cn(
                  'w-2.5 rounded-full bg-peach/70 transition-all duration-200 motion-reduce:transition-none sm:w-3',
                  isAmbient && 'w-1.5 bg-peach/50 sm:w-2',
                  isLast && 'animate-rhythm-pulse',
                )}
                style={{ height: `${Math.max(6, (dwell / maxDwell) * (isAmbient ? 32 : 64))}px` }}
              />
            )
          })
        )}
      </div>

      {flights.length > 0 && (
        <div
          className="flex items-center justify-center gap-1 overflow-x-auto py-1"
          {...(!isAmbient
            ? {
                role: 'img',
                'aria-label':
                  'Live rhythm visualization: spacing between dots reflects the gap between interactions',
              }
            : {})}
        >
          {flights.map((flight, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span
                  className="h-px bg-hero-panel-foreground/25"
                  style={{ width: `${8 + (flight / maxFlight) * 32}px` }}
                />
              )}
              <span className={cn('size-1.5 shrink-0 rounded-full bg-peach', isAmbient && 'size-1 bg-peach/60')} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RhythmVisualization
