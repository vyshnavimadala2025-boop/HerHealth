import type { EnergyLevel, Mood, Wellbeing } from '@/features/checkins/types'

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'mixed'

export type MoodTrendResult = 'Improving' | 'Stable' | 'Mixed' | 'Limited data'
export type EnergyTrendResult = 'Improving' | 'Stable' | 'Mixed' | 'Decreasing' | 'Limited data'

export interface WeeklyCheckInSummary {
  count: number
  consistencyPercent: number
  mostCommonMood: Mood | null
  mostCommonEnergyLevel: EnergyLevel | null
  mostCommonWellbeing: Wellbeing | null
}

export type InsightCategory = 'checkin' | 'mood' | 'energy' | 'cycle' | 'general'
export type InsightPriority = 'info' | 'encouragement' | 'attention'

export interface Insight {
  id: string
  title: string
  message: string
  category: InsightCategory
  priority: InsightPriority
}
