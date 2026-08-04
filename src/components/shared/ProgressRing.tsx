import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  /** 0–100. Values outside this range are clamped. */
  value: number
  /** Accessible text equivalent — the ring is decorative, this is the real content (e.g. "5 of 7 days, 71%"). */
  label: string
  size?: number
  strokeWidth?: number
  colorClassName?: string
  trackClassName?: string
  children?: ReactNode
  className?: string
}

/**
 * Plain SVG circular progress indicator — no charting library. The value
 * is always exposed as real text via `label` (role="img" + aria-label),
 * never conveyed by the ring's color/fill alone. Animates once on mount;
 * respects prefers-reduced-motion via `motion-reduce:transition-none`.
 */
function ProgressRing({
  value,
  label,
  size = 96,
  strokeWidth = 8,
  colorClassName = 'text-primary',
  trackClassName = 'text-muted',
  children,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div
      role="img"
      aria-label={label}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke="currentColor"
          className={cn(trackClassName, 'opacity-25')}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colorClassName, 'transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none')}
        />
      </svg>
      {children && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

export default ProgressRing
