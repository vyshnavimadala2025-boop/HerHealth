import { Navigate, Outlet } from 'react-router-dom'
import FullScreenLoader from '@/components/shared/FullScreenLoader'
import FullScreenError from '@/components/shared/FullScreenError'
import { useAdminAuth } from '@/features/admin/adminAuth/useAdminAuth'

/**
 * Route guard for the /admin subtree. While status is 'loading', nothing
 * but a loader renders — no admin shell, no admin data request is ever
 * made. A non-admin is redirected back into the normal app before
 * AdminShell (or any admin RPC) ever mounts/executes; a lookup failure
 * shows a retry state rather than silently granting or denying access.
 *
 * This is UX convenience only, not the security boundary — every admin
 * RPC re-checks public.is_admin() itself server-side.
 */
function RequireAdmin() {
  const { status, refresh } = useAdminAuth()

  if (status === 'loading') {
    return <FullScreenLoader />
  }

  if (status === 'error') {
    return (
      <FullScreenError
        title="Couldn't verify admin access"
        description="Something went wrong checking your permissions. Please try again."
        onRetry={refresh}
      />
    )
  }

  if (status === 'unauthorized') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default RequireAdmin
