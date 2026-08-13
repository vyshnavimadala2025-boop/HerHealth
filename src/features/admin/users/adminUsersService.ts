import { supabase } from '@/lib/supabaseClient'
import type { AdminUserDetail, AdminUserRow, AdminUsersPageResult, AdminUsersQuery } from '@/features/admin/users/types'

interface AdminUserRowFields {
  id: string
  full_name: string
  email: string
  created_at: string
  onboarding_completed: boolean
  onboarding_completed_at: string | null
  last_active_at: string | null
}

interface AdminListUsersRow extends AdminUserRowFields {
  total_count: number
}

interface AdminUserDetailRow extends AdminUserRowFields {
  is_admin: boolean
}

function mapRow(row: AdminUserRowFields): AdminUserRow {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    createdAt: row.created_at,
    onboardingCompleted: row.onboarding_completed,
    onboardingCompletedAt: row.onboarding_completed_at,
    lastActiveAt: row.last_active_at,
  }
}

/**
 * Calls the admin-gated public.admin_list_users() RPC (see
 * supabase/migrations/0022_admin_list_users.sql). Server-side search,
 * filter, sort, and pagination — never fetches the full user base.
 */
export async function listAdminUsers(query: AdminUsersQuery): Promise<AdminUsersPageResult> {
  const { data, error } = await supabase.rpc('admin_list_users', {
    p_search: query.search.trim() || null,
    p_onboarding: query.onboarding,
    p_activity: query.activity,
    p_sort: query.sort,
    p_page: query.page,
    p_page_size: query.pageSize,
  })
  if (error) throw error

  const rows = (data ?? []) as AdminListUsersRow[]
  return {
    rows: rows.map(mapRow),
    totalCount: rows[0]?.total_count ?? 0,
  }
}

/**
 * Calls the admin-gated public.admin_user_detail() RPC (see
 * supabase/migrations/0023_admin_user_detail.sql). Returns null if no
 * profile matches the id (not an error — a legitimately "not found" case).
 */
export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const { data, error } = await supabase.rpc('admin_user_detail', { p_user_id: userId })
  if (error) throw error

  const rows = (data ?? []) as AdminUserDetailRow[]
  const row = rows[0]
  if (!row) return null

  return { ...mapRow(row), isAdmin: row.is_admin }
}
