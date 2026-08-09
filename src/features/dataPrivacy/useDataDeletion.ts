import { useAuth } from '@/features/auth/useAuth'
import { deleteAllCheckIns } from '@/features/checkins/checkinService'
import { deleteAllPeriodRecords } from '@/features/periods/periodService'
import { deleteAllJournalEntries } from '@/features/journal/journalService'
import { deleteAllPcosWellnessEntries } from '@/features/pcosWellness/pcosWellnessService'
import { deleteAllGoals } from '@/features/goals/goalService'
import { deleteAllReminderPreferences } from '@/features/reminders/reminderService'
import { deleteAllSymptomEntries } from '@/features/symptomExplorer/symptomService'
import { deleteAllSleepEntries } from '@/features/sleepIntelligence/sleepService'
import { deleteAllNutritionEntries } from '@/features/nutritionCompanion/nutritionService'
import { deleteAllStressRecoveryEntries } from '@/features/stressRecovery/stressRecoveryService'
import { deleteAllScreeningItems } from '@/features/screeningPlanner/screeningService'
import { DATA_CATEGORIES } from '@/features/dataPrivacy/types'
import type { DataCategory, DeletionOutcome } from '@/features/dataPrivacy/types'

const CATEGORY_DELETE_FUNCTIONS: Record<DataCategory, (userId: string) => Promise<void>> = {
  checkins: deleteAllCheckIns,
  periods: deleteAllPeriodRecords,
  journal: deleteAllJournalEntries,
  pcosWellness: deleteAllPcosWellnessEntries,
  goals: deleteAllGoals,
  reminders: deleteAllReminderPreferences,
  symptoms: deleteAllSymptomEntries,
  sleep: deleteAllSleepEntries,
  nutrition: deleteAllNutritionEntries,
  stressRecovery: deleteAllStressRecoveryEntries,
  screenings: deleteAllScreeningItems,
}

const CATEGORY_ORDER: DataCategory[] = DATA_CATEGORIES.map((category) => category.value)

/**
 * No read query is performed anywhere in this hook — every action is a
 * direct, on-demand bulk delete scoped by user_id, never preceded by a
 * fetch of entry content or counts.
 */
export function useDataDeletion() {
  const { user } = useAuth()

  const deleteCategory = async (category: DataCategory): Promise<void> => {
    if (!user) throw new Error('You must be signed in to delete your data.')
    await CATEGORY_DELETE_FUNCTIONS[category](user.id)
  }

  /**
   * Runs every category's deletion via Promise.allSettled so one category
   * failing never stops the others from being attempted, then aggregates a
   * per-category outcome so the caller can report exactly which categories
   * succeeded and which didn't — never a false "all deleted" when
   * something actually failed.
   */
  const deleteAllData = async (): Promise<DeletionOutcome[]> => {
    if (!user) throw new Error('You must be signed in to delete your data.')
    const userId = user.id

    const settled = await Promise.allSettled(
      CATEGORY_ORDER.map((category) => CATEGORY_DELETE_FUNCTIONS[category](userId)),
    )

    return settled.map((result, index) => {
      const category = CATEGORY_ORDER[index]
      if (result.status === 'fulfilled') {
        return { category, success: true }
      }
      const error = result.reason instanceof Error ? result.reason.message : 'Something went wrong.'
      return { category, success: false, error }
    })
  }

  return { deleteCategory, deleteAllData }
}
