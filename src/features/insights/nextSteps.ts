import { ClipboardCheck, NotebookPen, Target, HeartPulse, type LucideIcon } from 'lucide-react'

export interface NextStep {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

export interface GenerateNextStepsInput {
  hasCheckedInToday: boolean
  journalCountInRange: number
  periodRecordCount: number
  activeGoalCount: number | null
  goalProgressEntriesInRange: number | null
}

/**
 * Contextual "suggested next step" list, derived entirely from real
 * activity signals already available elsewhere (today's check-in status,
 * journal/goal counts from the same timeline/summary used across
 * Insights). Deterministic — the same input always produces the same
 * suggestions, in priority order, capped at 4 so the list stays scannable.
 */
export function generateNextSteps(input: GenerateNextStepsInput): NextStep[] {
  const steps: NextStep[] = []

  if (!input.hasCheckedInToday) {
    steps.push({ id: 'checkin', label: 'Complete today’s check-in', icon: ClipboardCheck, href: '/dashboard#checkin' })
  }

  if (input.journalCountInRange === 0) {
    steps.push({ id: 'journal', label: 'Write a journal reflection', icon: NotebookPen, href: '/journal' })
  }

  if (input.periodRecordCount === 0) {
    steps.push({ id: 'cycle', label: 'Track your cycle', icon: HeartPulse, href: '/cycle-tracker' })
  }

  if (input.activeGoalCount !== null) {
    if (input.activeGoalCount === 0) {
      steps.push({ id: 'set-goal', label: 'Set a wellness goal', icon: Target, href: '/goals' })
    } else if (input.goalProgressEntriesInRange === 0) {
      steps.push({ id: 'goal-progress', label: 'Log progress on a wellness goal', icon: Target, href: '/goals' })
    }
  }

  if (steps.length === 0) {
    steps.push({ id: 'review', label: 'Review this week’s report', icon: ClipboardCheck, href: '/insights/weekly' })
  }

  return steps.slice(0, 4)
}
