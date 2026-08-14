import {
  CalendarRange,
  Compass,
  Download,
  Feather,
  HeartPulse,
  History,
  LineChart,
  Moon,
  NotebookPen,
  Printer,
  Share2,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  Wind,
  type LucideIcon,
} from 'lucide-react'

export type InsightGroupKey = 'ai' | 'weekly' | 'overview' | 'trends' | 'history' | 'recommendations' | 'reports'

export interface InsightGroup {
  key: InsightGroupKey
  label: string
  description: string
  icon: LucideIcon
  href: string
}

/**
 * Insights' five groups — each is a real, complete page (not 17 separate
 * routes for every card below). A card links to its group page, with an
 * anchor to the specific section within it where one is defined.
 */
export const INSIGHT_GROUPS: InsightGroup[] = [
  {
    key: 'ai',
    label: 'AI Insights',
    description: 'Rule-based, educational observations across every part of SIRILA you use.',
    icon: Sparkles,
    href: '/insights/ai',
  },
  {
    key: 'weekly',
    label: 'Weekly',
    description: 'A premium weekly wellness report — mood, energy, activity, and a rule-based reflection.',
    icon: NotebookPen,
    href: '/insights/weekly',
  },
  {
    key: 'overview',
    label: 'Monthly Summary',
    description: 'A premium, in-depth wellness report for the last 30 days — score, trends, and an AI reflection.',
    icon: CalendarRange,
    href: '/insights/overview',
  },
  {
    key: 'trends',
    label: 'Health Trends',
    description: 'How your mood, cycle, and other recorded signals have moved over time.',
    icon: TrendingUp,
    href: '/insights/trends',
  },
  {
    key: 'history',
    label: 'History',
    description: 'A chronological view of everything you’ve recorded.',
    icon: History,
    href: '/insights/history',
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    description: 'Gentle, educational suggestions based on your own recorded patterns.',
    icon: Feather,
    href: '/insights/recommendations',
  },
  {
    key: 'reports',
    label: 'Reports',
    description: 'Export, share, or print a copy of what you’ve recorded.',
    icon: Download,
    href: '/insights/reports',
  },
]

export interface InsightCardConfig {
  key: string
  name: string
  description: string
  icon: LucideIcon
  group: InsightGroupKey
  anchor?: string
}

/** Single source of truth for every card shown on the Insights landing page, grouped per INSIGHT_GROUPS. */
export const INSIGHT_CARDS: InsightCardConfig[] = [
  // AI Insights
  {
    key: 'ai-health-insights',
    name: 'AI Health Insights',
    description: 'Rule-based observations drawn from your recorded check-ins.',
    icon: Sparkles,
    group: 'ai',
  },
  // Weekly
  {
    key: 'weekly-summary',
    name: 'Weekly Summary',
    description: 'A premium report of your recorded activity over the last 7 days.',
    icon: NotebookPen,
    group: 'weekly',
  },
  // Overview
  {
    key: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'A premium wellness score, trends, and AI reflection for the last 30 days.',
    icon: CalendarRange,
    group: 'overview',
  },
  // Health Trends
  {
    key: 'mood-trends',
    name: 'Mood',
    description: 'How your recorded mood has trended recently.',
    icon: Smile,
    group: 'trends',
    anchor: 'mood',
  },
  {
    key: 'cycle-trends',
    name: 'Cycle',
    description: 'Your estimated cycle length and recent pattern.',
    icon: HeartPulse,
    group: 'trends',
    anchor: 'cycle',
  },
  {
    key: 'sleep-trends',
    name: 'Sleep',
    description: 'Trends from your Sleep Intelligence log.',
    icon: Moon,
    group: 'trends',
    anchor: 'sleep',
  },
  {
    key: 'goal-trends',
    name: 'Goals',
    description: 'Progress across your active wellness goals.',
    icon: Target,
    group: 'trends',
    anchor: 'goals',
  },
  {
    key: 'lifestyle-trends',
    name: 'Lifestyle',
    description: 'Patterns from Lifestyle Intelligence.',
    icon: Compass,
    group: 'trends',
    anchor: 'lifestyle',
  },
  {
    key: 'environment-trends',
    name: 'Environment',
    description: 'Patterns from Environmental Wellness.',
    icon: Wind,
    group: 'trends',
    anchor: 'environment',
  },
  // History
  {
    key: 'wellness-timeline',
    name: 'Wellness Timeline',
    description: 'A chronological view of your recorded activity.',
    icon: LineChart,
    group: 'history',
    anchor: 'timeline',
  },
  {
    key: 'personal-history',
    name: 'Personal History',
    description: 'Filter your history by the kind of activity.',
    icon: History,
    group: 'history',
    anchor: 'timeline',
  },
  // Recommendations
  {
    key: 'personalized-suggestions',
    name: 'Personalized Suggestions',
    description: 'Gentle suggestions based on your recent patterns.',
    icon: Sparkles,
    group: 'recommendations',
    anchor: 'suggestions',
  },
  {
    key: 'habit-improvements',
    name: 'Habit Improvements',
    description: 'Small, everyday habits worth considering.',
    icon: Feather,
    group: 'recommendations',
    anchor: 'habits',
  },
  {
    key: 'wellness-opportunities',
    name: 'Wellness Opportunities',
    description: 'Areas you haven’t explored yet in SIRILA.',
    icon: TrendingUp,
    group: 'recommendations',
    anchor: 'opportunities',
  },
  // Reports
  {
    key: 'export-insights',
    name: 'Export',
    description: 'Download a copy of your recorded data.',
    icon: Download,
    group: 'reports',
    anchor: 'export',
  },
  {
    key: 'share-insights',
    name: 'Share',
    description: 'Share a link back to your Insights.',
    icon: Share2,
    group: 'reports',
    anchor: 'share',
  },
  {
    key: 'print-insights',
    name: 'Print',
    description: 'Print a copy of your reports.',
    icon: Printer,
    group: 'reports',
    anchor: 'print',
  },
]

export function insightCardHref(card: InsightCardConfig): string {
  const group = INSIGHT_GROUPS.find((entry) => entry.key === card.group)
  const base = group?.href ?? '/insights'
  return card.anchor ? `${base}#${card.anchor}` : base
}
