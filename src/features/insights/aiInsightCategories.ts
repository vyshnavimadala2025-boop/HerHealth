import {
  Brain,
  Compass,
  HeartPulse,
  Leaf,
  Moon,
  NotebookPen,
  Smile,
  Target,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { EnergyTrendResult, MoodTrendResult } from '@/features/insights/types'
import type { GoalProgressReportSummary } from '@/features/reports/types'
import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import type { StressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import type { SourceStatus } from '@/components/shared/dataStateText'
import { capitalize } from '@/components/shared/dataStateText'

export type ConfidenceLevel = 'High consistency' | 'Moderate consistency' | 'Limited data' | 'Not tracked yet'

export interface AiInsightCategory {
  key: string
  label: string
  icon: LucideIcon
  tracked: boolean
  confidence: ConfidenceLevel
  observation: string
  wellnessInterpretation: string
  suggestedNextHabit: string
  /** Date (YYYY-MM-DD) of the most recent real record behind this category, or null if none. */
  lastUpdated: string | null
}

function confidenceFromCount(count: number): ConfidenceLevel {
  if (count >= 10) return 'High consistency'
  if (count >= 3) return 'Moderate consistency'
  return 'Limited data'
}

export interface AiInsightCategoriesInput {
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  weeklyCheckInCount: number
  lastCheckInDate: string | null
  cycleLength: number | null
  estimatedNextPeriod: string | null
  periodRecordCount: number
  lastPeriodStartDate: string | null
  journalCountInRange: number
  lastJournalDate: string | null
  goalsSummary: GoalProgressReportSummary | null
  lastGoalActivityDate: string | null
  pcosEnabled: boolean
  pcosEntryCount: number
  lastPcosEntryDate: string | null
  sleepStatus: SourceStatus
  sleepSummary: SleepSummary
  lastSleepEntryDate: string | null
  stressRecoveryStatus: SourceStatus
  stressRecoverySummary: StressRecoverySummary
  lastStressRecoveryEntryDate: string | null
  /**
   * True when the goals/journal/PCOS summary couldn't be loaded (e.g. a
   * pre-existing environment gap, not user data) — Journal, Goals, and
   * Symptoms then say so honestly instead of presenting a load failure as
   * if it were "nothing recorded yet."
   */
  reportDataUnavailable: boolean
}

/**
 * Builds the 11 AI Health Insight category cards — deterministic and
 * rule-based, reusing only real signals already computed elsewhere
 * (moodTrend/energyTrend from the existing insight engine in
 * useInsightsData, cycle data from the same hook, goal/journal/PCOS
 * counts and dates from useReportData's timeline/summary). Sleep, Stress,
 * and Recovery (Stage 5A) reuse useSleepData()/calculateSleepSummary() and
 * useStressRecoveryData()/calculateStressRecoverySummary() — the same
 * hooks/functions Lifestyle Intelligence already composes (Stage 4C2) —
 * gated on hasSufficientData exactly like Mood/Energy/Cycle above; a
 * failure in either source degrades only its own category via
 * unavailableCard(), never the rest of the page. Environment has no
 * tracked field anywhere in SIRILA yet and is shown honestly as not
 * tracked — never a fabricated observation. Language throughout is
 * deliberately observational ("we noticed", "you may be experiencing"),
 * never diagnostic.
 */
export function buildAiInsightCategories(input: AiInsightCategoriesInput): AiInsightCategory[] {
  const categories: AiInsightCategory[] = []

  // Mood
  categories.push(
    input.moodTrend === 'Limited data'
      ? {
          key: 'mood',
          label: 'Mood',
          icon: Smile,
          tracked: false,
          confidence: 'Limited data',
          observation: 'Not enough recorded check-ins yet to describe a mood pattern.',
          wellnessInterpretation:
            'Once you have a few more check-ins, a gentle mood pattern will appear here.',
          suggestedNextHabit: 'Complete a few more daily check-ins to begin seeing a mood pattern.',
          lastUpdated: input.lastCheckInDate,
        }
      : {
          key: 'mood',
          label: 'Mood',
          icon: Smile,
          tracked: true,
          confidence: confidenceFromCount(input.weeklyCheckInCount),
          observation: `We noticed your recorded mood has been ${input.moodTrend.toLowerCase()} recently.`,
          wellnessInterpretation:
            input.moodTrend === 'Improving'
              ? 'You may be experiencing a gentle upward shift in how you feel day to day.'
              : input.moodTrend === 'Mixed'
                ? 'Your mood may be responding to everyday changes in routine, rest, or stress.'
                : 'Your mood appears to be holding fairly steady, based on what you’ve recorded.',
          suggestedNextHabit: 'Keep completing daily check-ins around the same time each day.',
          lastUpdated: input.lastCheckInDate,
        },
  )

  // Energy
  categories.push(
    input.energyTrend === 'Limited data'
      ? {
          key: 'energy',
          label: 'Energy',
          icon: Zap,
          tracked: false,
          confidence: 'Limited data',
          observation: 'Not enough recorded check-ins yet to describe an energy pattern.',
          wellnessInterpretation:
            'Once you have a few more check-ins, a gentle energy pattern will appear here.',
          suggestedNextHabit: 'Complete a few more daily check-ins to begin seeing an energy pattern.',
          lastUpdated: input.lastCheckInDate,
        }
      : {
          key: 'energy',
          label: 'Energy',
          icon: Zap,
          tracked: true,
          confidence: confidenceFromCount(input.weeklyCheckInCount),
          observation: `We noticed your recorded energy has been ${input.energyTrend.toLowerCase()} recently.`,
          wellnessInterpretation:
            input.energyTrend === 'Improving'
              ? 'You may be experiencing steadier energy day to day.'
              : input.energyTrend === 'Decreasing'
                ? 'You may be experiencing lower energy recently — rest and routine can both play a part.'
                : 'Your energy appears fairly consistent, based on what you’ve recorded.',
          suggestedNextHabit: 'Notice what you did on your highest-energy recorded days.',
          lastUpdated: input.lastCheckInDate,
        },
  )

  // Cycle
  categories.push(
    input.periodRecordCount === 0
      ? {
          key: 'cycle',
          label: 'Cycle',
          icon: HeartPulse,
          tracked: false,
          confidence: 'Limited data',
          observation: 'No period records recorded yet.',
          wellnessInterpretation: 'Once you record a period, cycle observations will appear here.',
          suggestedNextHabit: 'Add a period record in Cycle Tracker to begin a cycle estimate.',
          lastUpdated: null,
        }
      : {
          key: 'cycle',
          label: 'Cycle',
          icon: HeartPulse,
          tracked: true,
          confidence: input.cycleLength ? 'Moderate consistency' : 'Limited data',
          observation: input.cycleLength
            ? `Based on your recent entries, your estimated cycle length is ${input.cycleLength} days.`
            : `You have ${input.periodRecordCount} period record${input.periodRecordCount === 1 ? '' : 's'} logged so far.`,
          wellnessInterpretation: 'This is a personal estimate based only on the dates you’ve recorded, not a prediction.',
          suggestedNextHabit: input.estimatedNextPeriod
            ? 'Keep logging period start dates as they happen for the most accurate estimate.'
            : 'Add one more period record to generate a cycle length estimate.',
          lastUpdated: input.lastPeriodStartDate,
        },
  )

  const unavailableCard = (key: string, label: string, icon: LucideIcon): AiInsightCategory => ({
    key,
    label,
    icon,
    tracked: false,
    confidence: 'Limited data',
    observation: 'We couldn’t load this right now.',
    wellnessInterpretation: 'This is a temporary loading issue, not something about your recorded data.',
    suggestedNextHabit: 'Try refreshing the page in a moment.',
    lastUpdated: null,
  })

  // Symptoms (PCOS/PCOD wellness)
  categories.push(
    input.reportDataUnavailable
      ? unavailableCard('symptoms', 'Symptoms', Leaf)
      : !input.pcosEnabled
      ? {
          key: 'symptoms',
          label: 'Symptoms',
          icon: Leaf,
          tracked: false,
          confidence: 'Not tracked yet',
          observation: 'PCOS/PCOD wellness tracking isn’t turned on for your account.',
          wellnessInterpretation: 'Turning it on in Profile lets you log optional wellness observations privately.',
          suggestedNextHabit: 'Visit PCOS/PCOD Wellness Tracking if this would be useful to you.',
          lastUpdated: null,
        }
      : {
          key: 'symptoms',
          label: 'Symptoms',
          icon: Leaf,
          tracked: input.pcosEntryCount > 0,
          confidence: confidenceFromCount(input.pcosEntryCount),
          observation:
            input.pcosEntryCount > 0
              ? `You’ve recorded ${input.pcosEntryCount} wellness observation${input.pcosEntryCount === 1 ? '' : 's'} in the last 7 days.`
              : 'No wellness observations recorded in the last 7 days.',
          wellnessInterpretation: 'These are your own optional, private observations — not a symptom diagnosis.',
          suggestedNextHabit: 'Add a wellness observation in PCOS/PCOD Wellness Tracking when something stands out.',
          lastUpdated: input.lastPcosEntryDate,
        },
  )

  // Journal
  categories.push(
    input.reportDataUnavailable
      ? unavailableCard('journal', 'Journal', NotebookPen)
      : {
          key: 'journal',
          label: 'Journal',
          icon: NotebookPen,
          tracked: input.journalCountInRange > 0,
          confidence: confidenceFromCount(input.journalCountInRange),
          observation:
            input.journalCountInRange > 0
              ? `You’ve written ${input.journalCountInRange} journal entr${input.journalCountInRange === 1 ? 'y' : 'ies'} in the last 7 days.`
              : 'No journal entries recorded in the last 7 days.',
          wellnessInterpretation:
            'Journaling is a private space for reflection — SIRILA never reads or analyzes its content.',
          suggestedNextHabit: 'Write a brief journal reflection today.',
          lastUpdated: input.lastJournalDate,
        },
  )

  // Goals
  categories.push(
    input.reportDataUnavailable
      ? unavailableCard('goals', 'Goals', Target)
      : !input.goalsSummary
      ? {
          key: 'goals',
          label: 'Goals',
          icon: Target,
          tracked: false,
          confidence: 'Limited data',
          observation: 'No wellness goals recorded yet.',
          wellnessInterpretation: 'Once you set a goal, your progress pattern will appear here.',
          suggestedNextHabit: 'Set a wellness goal to start tracking progress here.',
          lastUpdated: null,
        }
      : {
          key: 'goals',
          label: 'Goals',
          icon: Target,
          tracked: input.goalsSummary.activeGoalCount + input.goalsSummary.completedGoalCount > 0,
          confidence: confidenceFromCount(input.goalsSummary.progressEntriesInRange),
          observation: `You have ${input.goalsSummary.activeGoalCount} active and ${input.goalsSummary.completedGoalCount} completed goal${input.goalsSummary.completedGoalCount === 1 ? '' : 's'} overall.`,
          wellnessInterpretation:
            input.goalsSummary.progressEntriesInRange > 0
              ? 'You’ve been logging progress recently — that consistency itself is worth noticing.'
              : 'You may not have logged goal progress in the last 7 days.',
          suggestedNextHabit: 'Log progress on a wellness goal today.',
          lastUpdated: input.lastGoalActivityDate,
        },
  )

  // Sleep
  categories.push(
    input.sleepStatus === 'error'
      ? unavailableCard('sleep', 'Sleep', Moon)
      : !input.sleepSummary.hasSufficientData || input.sleepSummary.qualityTrend === 'Limited data'
        ? {
            key: 'sleep',
            label: 'Sleep',
            icon: Moon,
            tracked: false,
            confidence: 'Limited data',
            observation: 'Not enough recorded nights yet to describe a sleep pattern.',
            wellnessInterpretation: 'Once you log a few more nights in Sleep Intelligence, a pattern will appear here.',
            suggestedNextHabit: 'Log tonight’s sleep in Sleep Intelligence.',
            lastUpdated: input.lastSleepEntryDate,
          }
        : {
            key: 'sleep',
            label: 'Sleep',
            icon: Moon,
            tracked: true,
            confidence: confidenceFromCount(input.sleepSummary.nightsTracked),
            observation: `We noticed your recorded sleep quality has been ${input.sleepSummary.qualityTrend.toLowerCase()} recently.`,
            wellnessInterpretation:
              input.sleepSummary.qualityTrend === 'Improving'
                ? 'You may be experiencing steadier, more restful nights.'
                : input.sleepSummary.qualityTrend === 'Decreasing'
                  ? 'Your recorded sleep quality has dipped recently — routine and rest can both play a part.'
                  : 'Your recorded sleep quality appears fairly steady.',
            suggestedNextHabit: 'Keep a consistent bedtime — track it in Sleep Intelligence.',
            lastUpdated: input.lastSleepEntryDate,
          },
  )

  // Stress
  categories.push(
    input.stressRecoveryStatus === 'error'
      ? unavailableCard('stress', 'Stress', Brain)
      : !input.stressRecoverySummary.hasSufficientData || input.stressRecoverySummary.stressTrend === 'Limited data'
        ? {
            key: 'stress',
            label: 'Stress',
            icon: Brain,
            tracked: false,
            confidence: 'Limited data',
            observation: 'Not enough recorded days yet to describe a stress pattern.',
            wellnessInterpretation: 'Once you log a few more days in Stress & Recovery, a pattern will appear here.',
            suggestedNextHabit: 'Log today’s stress level in Stress & Recovery.',
            lastUpdated: input.lastStressRecoveryEntryDate,
          }
        : {
            key: 'stress',
            label: 'Stress',
            icon: Brain,
            tracked: true,
            confidence: confidenceFromCount(input.stressRecoverySummary.daysTracked),
            observation: `We noticed your recorded stress has been ${input.stressRecoverySummary.stressTrend.toLowerCase()} recently.`,
            wellnessInterpretation:
              input.stressRecoverySummary.stressTrend === 'Rising'
                ? 'Your recorded stress may be trending upward — small, repeatable moments of calm can help.'
                : input.stressRecoverySummary.stressTrend === 'Easing'
                  ? 'Your recorded stress appears to be easing recently.'
                  : 'Your recorded stress appears fairly steady.',
            suggestedNextHabit: 'Log a recovery action after a stressful moment in Stress & Recovery.',
            lastUpdated: input.lastStressRecoveryEntryDate,
          },
  )

  // Lifestyle — real feature exists with its own deep view; point there rather than duplicate
  categories.push({
    key: 'lifestyle',
    label: 'Lifestyle',
    icon: Compass,
    tracked: true,
    confidence: 'Moderate consistency',
    observation: 'Lifestyle Intelligence has its own dedicated pattern view, built on your check-in history.',
    wellnessInterpretation: 'Rather than duplicate that analysis here, this points you to the real thing.',
    suggestedNextHabit: 'Visit Lifestyle Intelligence for your Lifestyle Score and weekly progress.',
    lastUpdated: null,
  })

  // Environment — not tracked anywhere yet
  categories.push({
    key: 'environment',
    label: 'Environment',
    icon: Wind,
    tracked: false,
    confidence: 'Not tracked yet',
    observation: 'Environmental Wellness doesn’t have tracked data yet.',
    wellnessInterpretation: 'Once environmental tracking is available, observations will appear both there and here.',
    suggestedNextHabit: 'Visit Environmental Wellness to see what’s planned.',
    lastUpdated: null,
  })

  // Recovery
  categories.push(
    input.stressRecoveryStatus === 'error'
      ? unavailableCard('recovery', 'Recovery', Waves)
      : !input.stressRecoverySummary.hasSufficientData ||
          input.stressRecoverySummary.recoveryTrend === 'Limited data' ||
          input.stressRecoverySummary.recentRecoveryLevel === null
        ? {
            key: 'recovery',
            label: 'Recovery',
            icon: Waves,
            tracked: false,
            confidence: 'Limited data',
            observation: 'Not enough recorded days yet to describe a recovery pattern.',
            wellnessInterpretation: 'Once you log a few more days in Stress & Recovery, a pattern will appear here.',
            suggestedNextHabit: 'Log today’s recovery level in Stress & Recovery.',
            lastUpdated: input.lastStressRecoveryEntryDate,
          }
        : {
            key: 'recovery',
            label: 'Recovery',
            icon: Waves,
            tracked: true,
            confidence: confidenceFromCount(input.stressRecoverySummary.daysTracked),
            observation: `Your most recent recorded recovery level was ${capitalize(input.stressRecoverySummary.recentRecoveryLevel)}, trending ${input.stressRecoverySummary.recoveryTrend.toLowerCase()}.`,
            wellnessInterpretation:
              input.stressRecoverySummary.recoveryTrend === 'Improving'
                ? 'You may be experiencing steadier recovery recently.'
                : input.stressRecoverySummary.recoveryTrend === 'Decreasing'
                  ? 'Your recorded recovery has dipped recently — rest and gentle recovery actions can both play a part.'
                  : 'Your recorded recovery appears fairly steady.',
            suggestedNextHabit: 'Visit Recovery Planner to plan a gentle recovery action.',
            lastUpdated: input.lastStressRecoveryEntryDate,
          },
  )

  return categories
}
