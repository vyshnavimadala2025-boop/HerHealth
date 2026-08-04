import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
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
import ReportsPage from '@/pages/ReportsPage'
import DesignSystemPage from '@/pages/DesignSystemPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import MedicalDisclaimerPage from '@/pages/MedicalDisclaimerPage'
import AboutPage from '@/pages/AboutPage'
import HowItWorksPage from '@/pages/HowItWorksPage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import PublicOnlyRoute from '@/features/auth/PublicOnlyRoute'
import OnboardingGuard from '@/features/onboarding/OnboardingGuard'
import RequireOnboarding from '@/features/onboarding/RequireOnboarding'

function App() {
  return (
    <>
      <Routes>
        <Route element={<AppShell variant="public" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<AppShell variant="authenticated" />}>
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
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App
