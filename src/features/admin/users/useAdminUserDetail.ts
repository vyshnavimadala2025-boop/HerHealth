import { useCallback, useEffect, useState } from 'react'
import { getAdminUserDetail } from '@/features/admin/users/adminUsersService'
import type { AdminUserDetail } from '@/features/admin/users/types'

export type AdminUserDetailStatus = 'loading' | 'ready' | 'not-found' | 'error'

export function useAdminUserDetail(userId: string | undefined) {
  const [status, setStatus] = useState<AdminUserDetailStatus>('loading')
  const [user, setUser] = useState<AdminUserDetail | null>(null)

  const load = useCallback(() => {
    if (!userId) {
      setStatus('not-found')
      return
    }
    setStatus('loading')
    getAdminUserDetail(userId)
      .then((result) => {
        if (!result) {
          setUser(null)
          setStatus('not-found')
          return
        }
        setUser(result)
        setStatus('ready')
      })
      .catch(() => {
        setUser(null)
        setStatus('error')
      })
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { status, user, refresh: load }
}
