import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getActivityCounts } from '@/features/goals/progressService'
import type { ActivityCounts } from '@/features/goals/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Fetches only the three all-time activity counts, independent of the
 * goals list — active/completed goal counts are derived directly from
 * useGoalsData's already-loaded goals in the page, not refetched here.
 */
export function useProgressSummary() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<ActivityCounts | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getActivityCounts(user.id)
      setCounts(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { counts, status, retry: load }
}
