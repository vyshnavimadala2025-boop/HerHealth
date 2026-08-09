import { Sparkles, type LucideIcon } from 'lucide-react'

/**
 * Single source of truth for every "coming soon" destination reachable
 * from navigation. As of Stage 4C3, every product and nav entry that
 * used to link here has a real, built destination instead — repo-wide
 * search confirmed zero remaining `/coming-soon/:slug` hrefs anywhere in
 * the app, so COMING_SOON_ENTRIES is intentionally empty. The route and
 * this lookup function are kept (not removed) as honest, permanent
 * fallback infrastructure: a stray or old bookmarked `/coming-soon/*`
 * link still resolves to a real page with a sensible message instead of
 * a broken route.
 */
export interface ComingSoonEntry {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  category: string
}

export const COMING_SOON_ENTRIES: Record<string, ComingSoonEntry> = {}

export function getComingSoonEntry(slug: string | undefined): ComingSoonEntry {
  const fallback: ComingSoonEntry = {
    slug: slug ?? 'coming-soon',
    title: 'Coming Soon',
    description: 'This part of HerHealth is on its way.',
    icon: Sparkles,
    category: 'HerHealth',
  }
  if (!slug) return fallback
  return COMING_SOON_ENTRIES[slug] ?? fallback
}
