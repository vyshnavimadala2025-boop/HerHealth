import { useCallback, useEffect, useState } from 'react'
import { runAdminHealthChecks } from '@/features/admin/health/adminHealthService'
import { deriveOverallStatus, type AdminHealthSnapshot } from '@/features/admin/health/types'

export type AdminHealthPageStatus = 'loading' | 'ready' | 'error'

export function useAdminHealth() {
  const [pageStatus, setPageStatus] = useState<AdminHealthPageStatus>('loading')
  const [snapshot, setSnapshot] = useState<AdminHealthSnapshot | null>(null)

  const runChecks = useCallback(() => {
    setPageStatus('loading')
    runAdminHealthChecks()
      .then((result) => {
        setSnapshot(result)
        setPageStatus('ready')
      })
      .catch(() => {
        setSnapshot(null)
        setPageStatus('error')
      })
  }, [])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  return { pageStatus, snapshot, overallStatus: deriveOverallStatus(snapshot), refresh: runChecks }
}
