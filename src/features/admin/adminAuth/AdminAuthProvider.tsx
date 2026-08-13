import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { checkIsAdmin } from '@/features/admin/adminAuth/adminAuthService'
import { AdminAuthContext, type AdminAuthStatus } from '@/features/admin/adminAuth/AdminAuthContext'

/**
 * Mounted ONLY as a layout route nested under ProtectedRoute for the
 * /admin subtree (see App.tsx) — never at the app root — so ordinary
 * authenticated pages never trigger an is_admin() call or pay any cost
 * for admin authorization. By the time this renders, ProtectedRoute has
 * already guaranteed an authenticated session.
 *
 * This only reflects the database's answer for routing/UX purposes; the
 * real authorization boundary is public.is_admin() itself, re-checked
 * server-side by every admin-only RPC regardless of what this reports.
 */
function AdminAuthProvider() {
  const { user } = useAuth()
  const [status, setStatus] = useState<AdminAuthStatus>('loading')
  const userId = user?.id ?? null

  const check = useCallback(() => {
    setStatus('loading')
    checkIsAdmin()
      .then((isAdmin) => setStatus(isAdmin ? 'authorized' : 'unauthorized'))
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    check()
  }, [userId, check])

  const value = useMemo(() => ({ status, refresh: check }), [status, check])

  return (
    <AdminAuthContext.Provider value={value}>
      <Outlet />
    </AdminAuthContext.Provider>
  )
}

export default AdminAuthProvider
