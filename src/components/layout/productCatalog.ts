import {
  Bell,
  BookOpen,
  ClipboardList,
  HeartPulse,
  History,
  Leaf,
  LineChart,
  ShieldCheck,
  Sun,
  Target,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for every "product" link shown in the Products
 * mega-menu (public and authenticated navbars) and, later, the landing
 * page's product grid and footer. Every href points to a route that
 * already exists in App.tsx today — several items intentionally share a
 * destination page (with a section anchor) rather than a dedicated route,
 * per the approved Phase-13-era route-mapping decision: Daily Check-In,
 * Wellness Insights, and Personal Progress live on existing pages, not as
 * standalone routes.
 */
export const PRODUCT_CATEGORIES = ['dailyWellness', 'womensWellness', 'personalSpace', 'review'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PUBLIC_CATEGORY_LABELS: Record<ProductCategory, string> = {
  dailyWellness: 'Daily Wellness',
  womensWellness: "Cycle & Women's Wellness",
  personalSpace: 'Personal Reflection',
  review: 'Review & Control',
}

export const AUTHENTICATED_CATEGORY_LABELS: Record<ProductCategory, string> = {
  dailyWellness: 'Daily Wellness',
  womensWellness: "Women's Wellness",
  personalSpace: 'Personal Space',
  review: 'Review',
}

export interface ProductItem {
  category: ProductCategory
  name: string
  description: string
  href: string
  icon: LucideIcon
}

export const PRODUCT_ITEMS: ProductItem[] = [
  {
    category: 'dailyWellness',
    name: 'Daily Check-In',
    description: 'Log your mood, energy, and wellbeing each day.',
    href: '/dashboard#checkin',
    icon: Sun,
  },
  {
    category: 'dailyWellness',
    name: 'Wellness Insights',
    description: 'Review the patterns in what you’ve recorded.',
    href: '/dashboard#insights',
    icon: LineChart,
  },
  {
    category: 'dailyWellness',
    name: 'Personal Progress',
    description: 'See your overall recorded activity at a glance.',
    href: '/goals#progress',
    icon: Target,
  },
  {
    category: 'womensWellness',
    name: 'Cycle Tracker',
    description: 'Record period dates and review your cycle history.',
    href: '/cycle-tracker',
    icon: HeartPulse,
  },
  {
    category: 'womensWellness',
    name: 'PCOS/PCOD Wellness Tracking',
    description: 'Optional, private wellness observations.',
    href: '/wellness-tracker',
    icon: Leaf,
  },
  {
    category: 'personalSpace',
    name: 'Private Journal',
    description: 'A private space for personal reflection.',
    href: '/journal',
    icon: BookOpen,
  },
  {
    category: 'personalSpace',
    name: 'Wellness Goals',
    description: 'Set and track your own wellness goals.',
    href: '/goals',
    icon: Target,
  },
  {
    category: 'personalSpace',
    name: 'Reminders',
    description: 'Manage your personal reminder preferences.',
    href: '/goals#reminders',
    icon: Bell,
  },
  {
    category: 'review',
    name: 'Wellness Reports',
    description: 'Date-range summaries of what you’ve recorded.',
    href: '/reports',
    icon: ClipboardList,
  },
  {
    category: 'review',
    name: 'Personal Timeline',
    description: 'A chronological view of your recorded activity.',
    href: '/reports#timeline',
    icon: History,
  },
  {
    category: 'review',
    name: 'Data & Privacy Controls',
    description: 'Export or delete your recorded data at any time.',
    href: '/profile#privacy',
    icon: ShieldCheck,
  },
]

export interface ProductGroup {
  category: ProductCategory
  label: string
  items: ProductItem[]
}

export function groupProductItems(labels: Record<ProductCategory, string>): ProductGroup[] {
  return PRODUCT_CATEGORIES.map((category) => ({
    category,
    label: labels[category],
    items: PRODUCT_ITEMS.filter((item) => item.category === category),
  }))
}

/**
 * Whether a product item's link corresponds to the currently active route,
 * ignoring any '#section' anchor (a page is "current" regardless of which
 * of its anchors was used to reach it).
 */
export function isProductItemActive(pathname: string, href: string): boolean {
  return pathname === href.split('#')[0]
}
