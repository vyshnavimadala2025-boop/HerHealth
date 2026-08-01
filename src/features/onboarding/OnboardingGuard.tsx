import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import FullScreenLoader from '@/components/shared/FullScreenLoader'

/** Guards /onboarding: sends users who already finished onboarding to /dashboard. */
function OnboardingGuard() {
  const { profileStatus, profile } = useAuth()

  if (profileStatus === 'loading' || profileStatus === 'idle') {
    return <FullScreenLoader />
  }

  if (profileStatus === 'ready' && profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default OnboardingGuard
