import {
  BellRing,
  Brain,
  ClipboardList,
  Compass,
  Feather,
  Moon,
  Salad,
  Target,
  Wind,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for the "Lifestyle" nav dropdown — preventive
 * and lifestyle features. Lifestyle Intelligence and Environmental
 * Wellness are real, complete pages. The other seven are named,
 * discoverable destinations that don't have a built page yet — each
 * points at the shared /coming-soon/:slug placeholder (see
 * comingSoonCatalog.ts) rather than a route that doesn't exist, so no
 * nav path is ever a dead link. When each one is built for real in a
 * later stage, only its `href` here needs to change.
 */
export interface LifestyleCatalogItem {
  key: string
  name: string
  description: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
}

export const LIFESTYLE_ITEMS: LifestyleCatalogItem[] = [
  {
    key: 'sleep-intelligence',
    name: 'Sleep Intelligence',
    description: 'Understand patterns in your rest and recovery over time.',
    href: '/coming-soon/sleep-intelligence',
    icon: Moon,
    comingSoon: true,
  },
  {
    key: 'nutrition-companion',
    name: 'Nutrition Companion',
    description: 'Gentle, educational awareness of everyday nutrition habits.',
    href: '/coming-soon/nutrition-companion',
    icon: Salad,
    comingSoon: true,
  },
  {
    key: 'stress-recovery',
    name: 'Stress & Recovery',
    description: 'Track how stress and recovery relate over time.',
    href: '/coming-soon/stress-recovery',
    icon: Brain,
    comingSoon: true,
  },
  {
    key: 'lifestyle-intelligence',
    name: 'Lifestyle Intelligence',
    description: 'Discover how your daily lifestyle may influence your wellness.',
    href: '/lifestyle-intelligence',
    icon: Compass,
  },
  {
    key: 'recovery-planner',
    name: 'Recovery Planner',
    description: 'Plan gentle recovery time around your own wellness patterns.',
    href: '/coming-soon/recovery-planner',
    icon: Feather,
    comingSoon: true,
  },
  {
    key: 'preventive-reminders',
    name: 'Preventive Reminders',
    description: 'Gentle nudges for your preventive wellness habits.',
    href: '/coming-soon/preventive-reminders',
    icon: BellRing,
    comingSoon: true,
  },
  {
    key: 'preventive-screening-planner',
    name: 'Preventive Screening Planner',
    description: 'Stay organized around routine preventive care.',
    href: '/coming-soon/preventive-screening-planner',
    icon: ClipboardList,
    comingSoon: true,
  },
  {
    key: 'environmental-wellness',
    name: 'Environmental Wellness',
    description: 'Understand how your surroundings may influence your wellness.',
    href: '/environmental-wellness',
    icon: Wind,
  },
  {
    key: 'wellness-score',
    name: 'Wellness Score',
    description: 'A holistic, evolving view of your recorded wellness over time.',
    href: '/coming-soon/wellness-score',
    icon: Target,
    comingSoon: true,
  },
]
