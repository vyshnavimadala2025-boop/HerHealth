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
