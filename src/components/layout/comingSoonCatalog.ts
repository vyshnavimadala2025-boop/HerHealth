import {
  BellRing,
  Bookmark,
  BookOpen,
  Brain,
  ClipboardList,
  Feather,
  HelpCircle,
  Mail,
  Moon,
  NotebookPen,
  Salad,
  ScanSearch,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for every "coming soon" destination reachable
 * from navigation (Products mega-menu, Insights hub, Knowledge Hub,
 * Support). Every slug here corresponds to a real, discoverable nav
 * entry that doesn't have a built feature behind it yet — rather than a
 * dead link or a fabricated feature, it resolves to a shared, honest
 * placeholder page. When a feature is later built for real, its nav
 * entry's href simply changes to the real route; no navigation
 * restructuring is required.
 */
export interface ComingSoonEntry {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  category: string
}

export const COMING_SOON_ENTRIES: Record<string, ComingSoonEntry> = {
  'symptom-explorer': {
    slug: 'symptom-explorer',
    title: 'Symptom Explorer',
    description: 'A guided space to explore and reflect on symptoms you’ve noticed, in your own words.',
    icon: ScanSearch,
    category: "Women's Wellness",
  },
  'sleep-intelligence': {
    slug: 'sleep-intelligence',
    title: 'Sleep Intelligence',
    description: 'Understand patterns in your rest and recovery over time.',
    icon: Moon,
    category: 'Preventive Health',
  },
  'nutrition-companion': {
    slug: 'nutrition-companion',
    title: 'Nutrition Companion',
    description: 'Gentle, educational awareness of everyday nutrition habits.',
    icon: Salad,
    category: 'Preventive Health',
  },
  'stress-recovery': {
    slug: 'stress-recovery',
    title: 'Stress & Recovery',
    description: 'Track how stress and recovery relate to each other over time.',
    icon: Brain,
    category: 'Preventive Health',
  },
  'ai-health-insights': {
    slug: 'ai-health-insights',
    title: 'AI Health Insights',
    description: 'Pattern-based, educational observations drawn from your wellness data.',
    icon: Sparkles,
    category: 'Preventive Health',
  },
  'preventive-reminders': {
    slug: 'preventive-reminders',
    title: 'Preventive Reminders',
    description: 'Gentle nudges to support preventive wellness habits.',
    icon: BellRing,
    category: 'Preventive Health',
  },
  'wellness-score': {
    slug: 'wellness-score',
    title: 'Wellness Score',
    description: 'A holistic, evolving view of your recorded wellness over time.',
    icon: Target,
    category: 'Preventive Health',
  },
  'womens-knowledge-hub': {
    slug: 'womens-knowledge-hub',
    title: "Women's Knowledge Hub",
    description: 'Curated, educational content focused on women’s health.',
    icon: BookOpen,
    category: 'Preventive Health',
  },
  'recovery-planner': {
    slug: 'recovery-planner',
    title: 'Recovery Planner',
    description: 'Plan gentle recovery time around your own wellness patterns.',
    icon: Feather,
    category: 'Preventive Health',
  },
  'preventive-screening-planner': {
    slug: 'preventive-screening-planner',
    title: 'Preventive Screening Planner',
    description: 'Stay organized around routine preventive care appointments.',
    icon: ClipboardList,
    category: 'Preventive Health',
  },
  'help-center': {
    slug: 'help-center',
    title: 'Help Center',
    description: 'Answers and guidance for using HerHealth.',
    icon: HelpCircle,
    category: 'Support',
  },
  'contact-support': {
    slug: 'contact-support',
    title: 'Contact Support',
    description: 'Reach the HerHealth team directly.',
    icon: Mail,
    category: 'Support',
  },
  'weekly-summary': {
    slug: 'weekly-summary',
    title: 'Weekly Summary',
    description: 'A dedicated weekly view of your recorded wellness activity.',
    icon: NotebookPen,
    category: 'Insights',
  },
  'monthly-review': {
    slug: 'monthly-review',
    title: 'Monthly Review',
    description: 'A monthly look back at your recorded wellness patterns.',
    icon: Bookmark,
    category: 'Insights',
  },
  'trend-analysis': {
    slug: 'trend-analysis',
    title: 'Trend Analysis',
    description: 'Deeper trend analysis across everything you’ve recorded.',
    icon: TrendingUp,
    category: 'Insights',
  },
  'personalized-recommendations': {
    slug: 'personalized-recommendations',
    title: 'Personalized Recommendations',
    description: 'Gentle, educational suggestions based on your own recorded patterns.',
    icon: Sparkles,
    category: 'Insights',
  },
}

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
