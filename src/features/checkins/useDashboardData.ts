import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getRecentCheckIns, getTodayCheckIn } from '@/features/checkins/checkinService'
import type { CheckIn } from '@/features/checkins/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useDashboardData() {
  const { user } = useAuth()
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null)
  const [todayStatus, setTodayStatus] = useState<LoadStatus>('loading')
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([])
  const [recentStatus, setRecentStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setTodayStatus('loading')
    setRecentStatus('loading')

    const [todayResult, recentResult] = await Promise.allSettled([
      getTodayCheckIn(user.id),
      getRecentCheckIns(user.id),
    ])

    if (todayResult.status === 'fulfilled') {
      setTodayCheckIn(todayResult.value)
      setTodayStatus('ready')
    } else {
      setTodayStatus('error')
    }

    if (recentResult.status === 'fulfilled') {
      setRecentCheckIns(recentResult.value)
      setRecentStatus('ready')
    } else {
      setRecentStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { todayCheckIn, todayStatus, recentCheckIns, recentStatus, refresh: load }
}
