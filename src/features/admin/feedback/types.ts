import type { FeedbackCategory, FeedbackType } from '@/features/feedback/types'

export type FeedbackStatus = 'new' | 'open' | 'in_progress' | 'resolved' | 'closed'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'

export const FEEDBACK_STATUSES: { value: FeedbackStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const FEEDBACK_PRIORITIES: { value: FeedbackPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export type FeedbackStatusFilter = FeedbackStatus | 'all'
export type FeedbackTypeFilter = FeedbackType | 'all'
export type FeedbackPriorityFilter = FeedbackPriority | 'all'
export type FeedbackCategoryFilter = FeedbackCategory | 'all'

export interface AdminFeedbackKpis {
  total: number
  newCount: number
  openCount: number
  inProgressCount: number
  resolvedCount: number
  closedCount: number
  bugsCount: number
  featureRequestsCount: number
  criticalCount: number
}

export interface AdminFeedbackListItem {
  id: string
  type: FeedbackType
  description: string
  category: FeedbackCategory | null
  status: FeedbackStatus
  priority: FeedbackPriority | null
  createdAt: string
  updatedAt: string
}

export interface AdminFeedbackDetail {
  id: string
  userId: string
  submitterEmail: string | null
  submitterName: string | null
  type: FeedbackType
  description: string
  category: FeedbackCategory | null
  status: FeedbackStatus
  priority: FeedbackPriority | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminFeedbackQuery {
  search: string
  status: FeedbackStatusFilter
  type: FeedbackTypeFilter
  priority: FeedbackPriorityFilter
  category: FeedbackCategoryFilter
  page: number
  pageSize: number
}

export interface AdminFeedbackUpdateInput {
  status: FeedbackStatus
  priority: FeedbackPriority | null
  category: FeedbackCategory | null
  adminNotes: string | null
}
