import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getPeriodRecords } from '@/features/periods/periodService'
import type { PeriodRecord } from '@/features/periods/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useCycleTrackerData() {
  const { user } = useAuth()
  const [records, setRecords] = useState<PeriodRecord[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getPeriodRecords(user.id)
      setRecords(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { records, status, refresh: load }
}
