import { cn } from '@/lib/utils'

interface AmbientOrbProps {
  /** Any valid CSS color, typically one of the SIRILA tokens (e.g. "var(--primary)", "var(--hero-panel-accent)", "var(--lavender)"). */
  color: string
  /** Diameter in pixels before blur. Orbs are meant to be large and soft, not small dots. */
  size?: number
  top?: string
  left?: string
  right?: string
  bottom?: string
  /** 0–1, kept low (default 0.35) since these blend into the page, not sit on top of it. */
  opacity?: number
  drift?: boolean
  className?: string
}

/**
 * A single large, extremely blurred glow — the reusable primitive behind
 * every page's atmosphere. Purely decorative: aria-hidden, pointer-events
 * disabled, absolutely positioned within whatever `relative` ancestor the
 * caller provides. Reused instead of the one-off inline
 * `style={{ background: 'radial-gradient(...)' }}` divs that a few
 * marketing sections already had, so page atmospheres share one
 * implementation rather than N slightly-different copies.
 */
function AmbientOrb({ color, size = 520, top, left, right, bottom, opacity = 0.35, drift = true, className }: AmbientOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute rounded-full blur-3xl motion-reduce:animate-none', drift && 'animate-orb-drift', className)}
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
      }}
    />
  )
}

export default AmbientOrb
