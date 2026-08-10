import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import FullScreenLoader from '@/components/shared/FullScreenLoader'
import FullScreenError from '@/components/shared/FullScreenError'

/** Guards /dashboard: sends users who haven't finished onboarding to /onboarding. */
function RequireOnboarding() {
  const { profileStatus, profile, refreshProfile } = useAuth()

  if (profileStatus === 'loading' || profileStatus === 'idle') {
    return <FullScreenLoader />
  }

  if (profileStatus === 'error') {
    return (
      <FullScreenError
        title="We couldn't load your profile"
        description="Please try again to continue to your dashboard."
        onRetry={refreshProfile}
      />
    )
  }

  if (profileStatus === 'ready' && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export default RequireOnboarding
