import { useCallback, useEffect, useState } from 'react'
import { listAdminUsers } from '@/features/admin/users/adminUsersService'
import type { ActivityFilter, AdminUserRow, OnboardingFilter, UsersSort } from '@/features/admin/users/types'

export type AdminUsersStatus = 'loading' | 'ready' | 'error'

export const USERS_PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 350

export function useAdminUsers() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [onboarding, setOnboarding] = useState<OnboardingFilter>('all')
  const [activity, setActivity] = useState<ActivityFilter>('all')
  const [sort, setSort] = useState<UsersSort>('newest')
  const [page, setPage] = useState(1)

  const [status, setStatus] = useState<AdminUsersStatus>('loading')
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, onboarding, activity, sort])

  const load = useCallback(() => {
    setStatus('loading')
    listAdminUsers({
      search: debouncedSearch,
      onboarding,
      activity,
      sort,
      page,
      pageSize: USERS_PAGE_SIZE,
    })
      .then((result) => {
        setRows(result.rows)
        setTotalCount(result.totalCount)
        setStatus('ready')
      })
      .catch(() => {
        setRows([])
        setTotalCount(0)
        setStatus('error')
      })
  }, [debouncedSearch, onboarding, activity, sort, page])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(totalCount / USERS_PAGE_SIZE))

  return {
    status,
    rows,
    totalCount,
    totalPages,
    page,
    setPage,
    searchInput,
    setSearchInput,
    onboarding,
    setOnboarding,
    activity,
    setActivity,
    sort,
    setSort,
    pageSize: USERS_PAGE_SIZE,
    refresh: load,
  }
}
