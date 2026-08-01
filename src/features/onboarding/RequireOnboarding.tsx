import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import FullScreenLoader from '@/components/shared/FullScreenLoader'

/** Guards /dashboard: sends users who haven't finished onboarding to /onboarding. */
function RequireOnboarding() {
  const { profileStatus, profile } = useAuth()

  if (profileStatus === 'loading' || profileStatus === 'idle') {
    return <FullScreenLoader />
  }

  if (profileStatus === 'ready' && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export default RequireOnboarding
