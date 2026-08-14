import type { LucideIcon } from 'lucide-react'

/**
 * Lifestyle Intelligence is a presentation-layer feature: it reuses the
 * real, already-tracked SIRILA check-in data (mood, energy, wellbeing,
 * consistency) wherever that data genuinely applies, and clearly marks
 * every metric the schema doesn't capture (sleep quality, hydration,
 * movement, weather, air quality, screen time, and so on) as not yet
 * tracked rather than inventing values or calling a new external service.
 *
 * The card grid itself lives in the shared MetricCardGrid component
 * (src/components/shared/MetricCardGrid.tsx), reused by both Lifestyle
 * Intelligence and Environmental Wellness.
 */
export interface LifestyleFactorCard {
  key: string
  icon: LucideIcon
  title: string
  description: string
  consistency: string
  observation: string
  tracked: boolean
}

export interface LearningTopic {
  key: string
  title: string
  summary: string
  body: string[]
}

export interface ScoreDimension {
  key: string
  label: string
  tracked: boolean
}
