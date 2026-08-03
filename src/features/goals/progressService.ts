import { getCheckInCount } from '@/features/checkins/checkinService'
import { getJournalEntryCount } from '@/features/journal/journalService'
import { getPeriodRecordCount } from '@/features/periods/periodService'
import type { ActivityCounts } from '@/features/goals/types'

/**
 * Total (all-time) recorded-activity counts for the personal progress
 * summary. Only counts are selected — never journal/check-in/period row
 * content. Goal counts (active/completed) are derived separately, from the
 * goals already loaded by useGoalsData, rather than queried again here.
 */
export async function getActivityCounts(userId: string): Promise<ActivityCounts> {
  const [totalCheckIns, totalJournalEntries, totalPeriodRecords] = await Promise.all([
    getCheckInCount(userId),
    getJournalEntryCount(userId),
    getPeriodRecordCount(userId),
  ])

  return { totalCheckIns, totalJournalEntries, totalPeriodRecords }
}
