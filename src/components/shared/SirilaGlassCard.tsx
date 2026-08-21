import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SirilaGlassCardProps {
  children: ReactNode
  /** "dark" for panels sitting on a hero-panel/dark surface, "light" for panels sitting on the normal light page background. */
  tone?: 'dark' | 'light'
  /** Adds the hover lift + edge glow used for clickable/hoverable cards. Off by default for static surfaces (e.g. the auth form panel). */
  interactive?: boolean
  className?: string
}

/**
 * Shared glass surface — semi-transparent background, backdrop blur, thin
 * border, soft shadow, and (opt-in) a violet edge glow + lift on hover.
 * Two tones cover both halves of the site: dark hero-panel sections
 * (reusing the bg-hero-panel-foreground/[x%] pattern already established
 * in HeroSection/InteractionIntelligenceSection) and the normal light
 * page background (a translucent card surface instead of a flat
 * `bg-card`).
 */
function SirilaGlassCard({ children, tone = 'light', interactive = false, className }: SirilaGlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl backdrop-blur-md transition-all duration-200',
        tone === 'dark'
          ? 'border border-hero-panel-foreground/12 bg-hero-panel-foreground/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'border border-border/70 bg-card/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]',
        interactive &&
          (tone === 'dark'
            ? 'hover:-translate-y-1 hover:border-peach/30 hover:bg-hero-panel-foreground/[0.07] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4),0_0_28px_-6px_color-mix(in_oklch,var(--peach),transparent_55%)]'
            : 'hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_32px_-10px_rgba(76,29,149,0.25)]'),
        className,
      )}
    >
      {children}
    </div>
  )
}

export default SirilaGlassCard
