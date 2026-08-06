import { BookOpen, ClipboardList, Sun, Target, type LucideIcon } from 'lucide-react'

/** Single source of truth for the small "Personal Wellness" utility list — reused wherever it's shown. */
export interface PersonalWellnessItem {
  key: string
  name: string
  description: string
  href: string
  icon: LucideIcon
}

export const PERSONAL_WELLNESS_ITEMS: PersonalWellnessItem[] = [
  {
    key: 'daily-checkin',
    name: 'Daily Check-In',
    description: 'Log your mood, energy, and wellbeing each day.',
    href: '/dashboard#checkin',
    icon: Sun,
  },
  {
    key: 'private-journal',
    name: 'Private Journal',
    description: 'A private space for personal reflection.',
    href: '/journal',
    icon: BookOpen,
  },
  {
    key: 'wellness-goals',
    name: 'Wellness Goals',
    description: 'Set and track your own wellness goals.',
    href: '/goals',
    icon: Target,
  },
  {
    key: 'wellness-reports',
    name: 'Wellness Reports',
    description: 'Date-range summaries of what you’ve recorded.',
    href: '/reports',
    icon: ClipboardList,
  },
]
