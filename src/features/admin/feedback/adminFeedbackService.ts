import { supabase } from '@/lib/supabaseClient'
import type {
  AdminFeedbackDetail,
  AdminFeedbackKpis,
  AdminFeedbackListItem,
  AdminFeedbackQuery,
  AdminFeedbackUpdateInput,
} from '@/features/admin/feedback/types'
import type { FeedbackCategory, FeedbackType } from '@/features/feedback/types'
import type { FeedbackPriority, FeedbackStatus } from '@/features/admin/feedback/types'

interface KpisRpcRow {
  total: number
  new_count: number
  open_count: number
  in_progress_count: number
  resolved_count: number
  closed_count: number
  bugs_count: number
  feature_requests_count: number
  critical_count: number
}

interface ListRpcRow {
  id: string
  type: FeedbackType
  description: string
  category: FeedbackCategory | null
  status: FeedbackStatus
  priority: FeedbackPriority | null
  created_at: string
  updated_at: string
  total_count: number
}

interface DetailRpcRow {
  id: string
  user_id: string
  submitter_email: string | null
  submitter_name: string | null
  type: FeedbackType
  description: string
  category: FeedbackCategory | null
  status: FeedbackStatus
  priority: FeedbackPriority | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

/** Calls public.admin_feedback_kpis() — see supabase/migrations/0027_admin_feedback.sql. */
export async function getAdminFeedbackKpis(): Promise<AdminFeedbackKpis> {
  const { data, error } = await supabase.rpc('admin_feedback_kpis').single<KpisRpcRow>()
  if (error) throw error

  return {
    total: data.total,
    newCount: data.new_count,
    openCount: data.open_count,
    inProgressCount: data.in_progress_count,
    resolvedCount: data.resolved_count,
    closedCount: data.closed_count,
    bugsCount: data.bugs_count,
    featureRequestsCount: data.feature_requests_count,
    criticalCount: data.critical_count,
  }
}

export interface AdminFeedbackListResult {
  items: AdminFeedbackListItem[]
  totalCount: number
}

/** Calls public.admin_list_feedback() — see supabase/migrations/0027_admin_feedback.sql. */
export async function listAdminFeedback(query: AdminFeedbackQuery): Promise<AdminFeedbackListResult> {
  const { data, error } = await supabase.rpc('admin_list_feedback', {
    p_search: query.search.trim() || null,
    p_status: query.status,
    p_type: query.type,
    p_priority: query.priority,
    p_category: query.category,
    p_page: query.page,
    p_page_size: query.pageSize,
  })
  if (error) throw error

  const rows = (data ?? []) as ListRpcRow[]
  return {
    items: rows.map((row) => ({
      id: row.id,
      type: row.type,
      description: row.description,
      category: row.category,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    totalCount: rows[0]?.total_count ?? 0,
  }
}

/** Calls public.admin_get_feedback_detail() — see supabase/migrations/0027_admin_feedback.sql. */
export async function getAdminFeedbackDetail(feedbackId: string): Promise<AdminFeedbackDetail | null> {
  const { data, error } = await supabase.rpc('admin_get_feedback_detail', { p_feedback_id: feedbackId })
  if (error) throw error

  const rows = (data ?? []) as DetailRpcRow[]
  const row = rows[0]
  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    submitterEmail: row.submitter_email,
    submitterName: row.submitter_name,
    type: row.type,
    description: row.description,
    category: row.category,
    status: row.status,
    priority: row.priority,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Calls public.admin_update_feedback() — see supabase/migrations/0027_admin_feedback.sql. Full-replace semantics. */
export async function updateAdminFeedback(feedbackId: string, input: AdminFeedbackUpdateInput): Promise<void> {
  const { error } = await supabase.rpc('admin_update_feedback', {
    p_feedback_id: feedbackId,
    p_status: input.status,
    p_priority: input.priority,
    p_category: input.category,
    p_admin_notes: input.adminNotes,
  })
  if (error) throw error
}
