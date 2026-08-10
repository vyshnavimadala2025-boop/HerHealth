import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import FullScreenLoader from '@/components/shared/FullScreenLoader'
import FullScreenError from '@/components/shared/FullScreenError'

/** Guards /onboarding: sends users who already finished onboarding to /dashboard. */
function OnboardingGuard() {
  const { profileStatus, profile, refreshProfile } = useAuth()

  if (profileStatus === 'loading' || profileStatus === 'idle') {
    return <FullScreenLoader />
  }

  if (profileStatus === 'error') {
    return (
      <FullScreenError
        title="We couldn't load your profile"
        description="Please try again to continue setting up your account."
        onRetry={refreshProfile}
      />
    )
  }

  if (profileStatus === 'ready' && profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default OnboardingGuard
