import { useCallback, useEffect, useState } from 'react'
import { getAdminAiSafetyMetrics } from '@/features/admin/aiSafety/adminAiSafetyService'
import type { AdminAiSafetyMetrics } from '@/features/admin/aiSafety/types'

export type AdminAiSafetyStatus = 'loading' | 'ready' | 'error'

export function useAdminAiSafetyMetrics() {
  const [status, setStatus] = useState<AdminAiSafetyStatus>('loading')
  const [metrics, setMetrics] = useState<AdminAiSafetyMetrics | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    getAdminAiSafetyMetrics()
      .then((result) => {
        setMetrics(result)
        setStatus('ready')
      })
      .catch(() => {
        setMetrics(null)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { status, metrics, refresh: load }
}
