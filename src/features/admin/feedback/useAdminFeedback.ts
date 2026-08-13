import { useCallback, useEffect, useState } from 'react'
import { getAdminFeedbackKpis, listAdminFeedback } from '@/features/admin/feedback/adminFeedbackService'
import type {
  AdminFeedbackKpis,
  AdminFeedbackListItem,
  FeedbackCategoryFilter,
  FeedbackPriorityFilter,
  FeedbackStatusFilter,
  FeedbackTypeFilter,
} from '@/features/admin/feedback/types'

export type AdminFeedbackStatus = 'loading' | 'ready' | 'error'

export const FEEDBACK_PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 350

export function useAdminFeedback() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FeedbackStatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<FeedbackTypeFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriorityFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategoryFilter>('all')
  const [page, setPage] = useState(1)

  const [status, setStatus] = useState<AdminFeedbackStatus>('loading')
  const [items, setItems] = useState<AdminFeedbackListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [kpis, setKpis] = useState<AdminFeedbackKpis | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, typeFilter, priorityFilter, categoryFilter])

  const load = useCallback(() => {
    setStatus('loading')
    Promise.all([
      listAdminFeedback({
        search: debouncedSearch,
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter,
        category: categoryFilter,
        page,
        pageSize: FEEDBACK_PAGE_SIZE,
      }),
      getAdminFeedbackKpis(),
    ])
      .then(([listResult, kpisResult]) => {
        setItems(listResult.items)
        setTotalCount(listResult.totalCount)
        setKpis(kpisResult)
        setStatus('ready')
      })
      .catch(() => {
        setItems([])
        setTotalCount(0)
        setKpis(null)
        setStatus('error')
      })
  }, [debouncedSearch, statusFilter, typeFilter, priorityFilter, categoryFilter, page])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(totalCount / FEEDBACK_PAGE_SIZE))

  return {
    status,
    items,
    totalCount,
    totalPages,
    page,
    setPage,
    kpis,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    pageSize: FEEDBACK_PAGE_SIZE,
    refresh: load,
  }
}
