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
 * and lifestyle features. Every entry is a real, complete page.
 * 'preventive-reminders' is the same real reminders feature (see
 * features/reminders/) already embedded in the Goals and Preventive
 * Screening Planner pages, now also available as its own standalone
 * destination (Stage 4B) — the embedded sections on those two pages are
 * unchanged and still work exactly as before.
 *
 * `group` (UI/UX Phase 2) is a presentational-only label rendered by
 * CategoryDropdownMenu — it groups the 9 real items into "Daily Wellness"
 * (things you log regularly) and "Plan & Prevent" (forward-looking
 * tools), so the dropdown reads as organized categories instead of one
 * flat list of 9. It changes no route and adds no new destination.
 */
export interface LifestyleCatalogItem {
  key: string
  name: string
  description: string
  href: string
  icon: LucideIcon
  group: 'Daily Wellness' | 'Plan & Prevent'
}

export const LIFESTYLE_ITEMS: LifestyleCatalogItem[] = [
  {
    key: 'sleep-intelligence',
    name: 'Sleep Intelligence',
    description: 'Understand patterns in your rest and recovery over time.',
    href: '/sleep-intelligence',
    icon: Moon,
    group: 'Daily Wellness',
  },
  {
    key: 'nutrition-companion',
    name: 'Nutrition Companion',
    description: 'Gentle, educational awareness of everyday nutrition habits.',
    href: '/nutrition-companion',
    icon: Salad,
    group: 'Daily Wellness',
  },
  {
    key: 'stress-recovery',
    name: 'Stress & Recovery',
    description: 'Track how stress and recovery relate over time.',
    href: '/stress-recovery',
    icon: Brain,
    group: 'Daily Wellness',
  },
  {
    key: 'lifestyle-intelligence',
    name: 'Lifestyle Intelligence',
    description: 'Discover how your daily lifestyle may influence your wellness.',
    href: '/lifestyle-intelligence',
    icon: Compass,
    group: 'Daily Wellness',
  },
  {
    key: 'environmental-wellness',
    name: 'Environmental Wellness',
    description: 'Understand how your surroundings may influence your wellness.',
    href: '/environmental-wellness',
    icon: Wind,
    group: 'Daily Wellness',
  },
  {
    key: 'recovery-planner',
    name: 'Recovery Planner',
    description: 'Plan gentle recovery time around your own wellness patterns.',
    href: '/recovery-planner',
    icon: Feather,
    group: 'Plan & Prevent',
  },
  {
    key: 'preventive-reminders',
    name: 'Preventive Reminders',
    description: 'Gentle nudges for your preventive wellness habits.',
    href: '/preventive-reminders',
    icon: BellRing,
    group: 'Plan & Prevent',
  },
  {
    key: 'preventive-screening-planner',
    name: 'Preventive Screening Planner',
    description: 'Stay organized around routine preventive care.',
    href: '/preventive-screening-planner',
    icon: ClipboardList,
    group: 'Plan & Prevent',
  },
  {
    key: 'wellness-score',
    name: 'Wellness Score',
    description: 'A holistic, evolving view of your recorded wellness over time.',
    href: '/wellness-score',
    icon: Target,
    group: 'Plan & Prevent',
  },
]
