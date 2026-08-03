import { Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import OnboardingPage from '@/pages/OnboardingPage'
import CycleTrackerPage from '@/pages/CycleTrackerPage'
import JournalPage from '@/pages/JournalPage'
import ProfilePage from '@/pages/ProfilePage'
import WellnessTrackerPage from '@/pages/WellnessTrackerPage'
import GoalsPage from '@/pages/GoalsPage'
import DesignSystemPage from '@/pages/DesignSystemPage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import PublicOnlyRoute from '@/features/auth/PublicOnlyRoute'
import OnboardingGuard from '@/features/onboarding/OnboardingGuard'
import RequireOnboarding from '@/features/onboarding/RequireOnboarding'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingGuard />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>
          <Route element={<RequireOnboarding />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cycle-tracker" element={<CycleTrackerPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wellness-tracker" element={<WellnessTrackerPage />} />
            <Route path="/goals" element={<GoalsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
