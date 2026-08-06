import type { LucideIcon } from 'lucide-react'

/**
 * Hormone Balance is a presentation-layer feature: it reuses existing,
 * already-tracked HerHealth data (daily check-ins, period records) for the
 * fields that data genuinely supports, and clearly marks the remaining
 * fields as not yet tracked rather than inventing values or new schema.
 */
export interface HormoneWellnessCard {
  key: string
  icon: LucideIcon
  label: string
  value: string
  caption: string
  accentClassName: string
  tracked: boolean
}

export interface LifestyleFactor {
  key: string
  icon: LucideIcon
  title: string
  summary: string
  detail: string
}

export interface LearningTopic {
  key: string
  title: string
  summary: string
  body: string[]
}
