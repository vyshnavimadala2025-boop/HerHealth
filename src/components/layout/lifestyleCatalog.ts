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
 * and lifestyle features. Every entry is now a real, complete page except
 * 'preventive-reminders' — reminders are a real, working feature (see
 * features/reminders/), but only as a section embedded in the Goals and
 * Preventive Screening Planner pages, not a standalone destination of
 * their own, so this entry still points at the shared /coming-soon/:slug
 * placeholder (see comingSoonCatalog.ts) rather than a route that doesn't
 * exist. No nav path is ever a dead link either way.
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
    href: '/sleep-intelligence',
    icon: Moon,
  },
  {
    key: 'nutrition-companion',
    name: 'Nutrition Companion',
    description: 'Gentle, educational awareness of everyday nutrition habits.',
    href: '/nutrition-companion',
    icon: Salad,
  },
  {
    key: 'stress-recovery',
    name: 'Stress & Recovery',
    description: 'Track how stress and recovery relate over time.',
    href: '/stress-recovery',
    icon: Brain,
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
    href: '/recovery-planner',
    icon: Feather,
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
    href: '/preventive-screening-planner',
    icon: ClipboardList,
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
    href: '/wellness-score',
    icon: Target,
  },
]
