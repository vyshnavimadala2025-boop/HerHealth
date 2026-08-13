import { useCallback, useEffect, useState } from 'react'
import { getAdminOverviewMetrics } from '@/features/admin/overview/adminOverviewService'
import type { AdminOverviewMetrics } from '@/features/admin/overview/types'

export type AdminOverviewStatus = 'loading' | 'ready' | 'error'

export function useAdminOverviewMetrics() {
  const [status, setStatus] = useState<AdminOverviewStatus>('loading')
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    getAdminOverviewMetrics()
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
