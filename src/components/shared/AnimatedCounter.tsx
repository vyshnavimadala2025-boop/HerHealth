import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  durationMs?: number
  className?: string
}

/**
 * Counts up from 0 to `value` once on mount/value-change. Respects
 * prefers-reduced-motion by jumping straight to the final value instead of
 * animating — checked once via matchMedia rather than a CSS transition, since
 * the displayed text itself needs to change, not just move.
 */
function AnimatedCounter({ value, suffix = '', durationMs = 800, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const startTime = performance.now()
    const startValue = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplay(Math.round(startValue + (value - startValue) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [value, durationMs])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}

export default AnimatedCounter
