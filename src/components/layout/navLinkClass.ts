import { cn } from '@/lib/utils'

/**
 * Shared active/inactive styling for top-level NavLink items, reused by
 * both navbars. Active state pairs a subtle background pill with a color
 * shift, rather than color alone, so the current section reads at a
 * glance without relying on a loud accent color.
 */
export function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground hover:bg-muted',
    isActive ? 'bg-accent/60 text-foreground' : 'text-muted-foreground',
  )
}

/**
 * Same shape as navLinkClass, styled for the premium violet-glass navbar
 * theme (dark hero-panel background) used by both PublicNavbar and
 * AuthenticatedNav, instead of the original light popover-style navbar.
 * The active pill carries a soft violet glow so the current section reads
 * clearly against the dark surface.
 */
export function heroNavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-200 hover:text-hero-panel-foreground hover:bg-hero-panel-foreground/8',
    isActive
      ? 'bg-hero-panel-foreground/12 text-hero-panel-foreground shadow-[0_0_16px_rgba(168,120,255,0.18)]'
      : 'text-hero-panel-foreground/75',
  )
}
