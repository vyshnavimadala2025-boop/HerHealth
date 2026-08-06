import { cn } from '@/lib/utils'

/** Shared active/inactive styling for top-level NavLink items, reused by both navbars. */
export function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )
}
