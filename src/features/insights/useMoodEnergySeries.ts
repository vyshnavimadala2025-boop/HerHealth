import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getCheckInsInRange } from '@/features/checkins/checkinService'
import { getLocalDateString } from '@/features/checkins/types'
import { addDays } from '@/features/periods/dateUtils'
import {
  buildLifestyleTimeline,
  type TimelineRange,
  type TimelinePoint,
} from '@/features/lifestyleIntelligence/lifestyleCalculations'

const RANGE_WINDOW_DAYS: Record<TimelineRange, number> = {
  today: 1,
  week: 7,
  month: 30,
  '3months': 90,
}

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Small, focused hook whose only job is fetching the raw check-ins a mood/
 * energy mini-chart needs and handing them to the exact same
 * buildLifestyleTimeline() pure function already built and tested for
 * Lifestyle Intelligence — not a second bucketing implementation. Reuses
 * the existing getCheckInsInRange() service; no new Supabase query shape.
 */
export function useMoodEnergySeries(range: TimelineRange) {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [points, setPoints] = useState<TimelinePoint[]>([])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const today = getLocalDateString()
      const windowStart = addDays(today, -(RANGE_WINDOW_DAYS[range] - 1))
      const checkIns = await getCheckInsInRange(user.id, { startDate: windowStart, endDate: today })
      setPoints(buildLifestyleTimeline(checkIns, today, range))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user, range])

  useEffect(() => {
    load()
  }, [load])

  return { status, points, refresh: load }
}
