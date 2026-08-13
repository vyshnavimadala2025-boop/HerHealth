import { supabase } from '@/lib/supabaseClient'

/**
 * The only source of truth for admin status: the database's
 * public.is_admin() function (see supabase/migrations/0019_admin_roles.sql).
 * There is no client-side notion of "admin" anywhere else in the app —
 * no email check, no localStorage flag, no frontend constant.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return Boolean(data)
}
