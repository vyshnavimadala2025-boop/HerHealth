import { Baby, HeartPulse, Leaf, ScanSearch, Sparkles, Waves, type LucideIcon } from 'lucide-react'

/**
 * Single source of truth for the "Wellness" nav dropdown — reproductive
 * health features. Split out of the old combined Products mega-menu so
 * each dropdown stays compact (see lifestyleCatalog.ts for the sibling
 * "Lifestyle" dropdown, and comingSoonCatalog.ts for shared placeholder
 * metadata).
 */
export interface WellnessCatalogItem {
  key: string
  name: string
  description: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
}

export const WELLNESS_ITEMS: WellnessCatalogItem[] = [
  {
    key: 'cycle-tracker',
    name: 'Cycle Tracker',
    description: 'Record period dates and review your cycle history.',
    href: '/cycle-tracker',
    icon: HeartPulse,
  },
  {
    key: 'pcos-wellness',
    name: 'PCOS / PCOD Wellness',
    description: 'Optional, private wellness observations.',
    href: '/wellness-tracker',
    icon: Leaf,
  },
  {
    key: 'fertility-journey',
    name: 'Fertility Journey',
    description: 'A supportive fertility wellness companion.',
    href: '/fertility-journey',
    icon: Sparkles,
  },
  {
    key: 'baby-growth',
    name: 'Baby Growth',
    description: 'A week-by-week pregnancy wellness companion.',
    href: '/baby-growth',
    icon: Baby,
  },
  {
    key: 'hormone-balance',
    name: 'Hormone Balance',
    description: 'Understand your body’s natural hormonal patterns.',
    href: '/hormone-balance',
    icon: Waves,
  },
  {
    key: 'symptom-explorer',
    name: 'Symptom Explorer',
    description: 'Explore and reflect on symptoms you’ve noticed.',
    href: '/coming-soon/symptom-explorer',
    icon: ScanSearch,
    comingSoon: true,
  },
]
