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
import FertilityJourneyPage from '@/pages/FertilityJourneyPage'
import BabyGrowthPage from '@/pages/BabyGrowthPage'
import HormoneBalancePage from '@/pages/HormoneBalancePage'
import LifestyleIntelligencePage from '@/pages/LifestyleIntelligencePage'
import EnvironmentalWellnessPage from '@/pages/EnvironmentalWellnessPage'
import WellnessScorePage from '@/pages/WellnessScorePage'
import SymptomExplorerPage from '@/pages/SymptomExplorerPage'
import SleepIntelligencePage from '@/pages/SleepIntelligencePage'
import NutritionCompanionPage from '@/pages/NutritionCompanionPage'
import StressRecoveryPage from '@/pages/StressRecoveryPage'
import RecoveryPlannerPage from '@/pages/RecoveryPlannerPage'
import PreventiveScreeningPlannerPage from '@/pages/PreventiveScreeningPlannerPage'
import PreventiveRemindersPage from '@/pages/PreventiveRemindersPage'
import InsightsPage from '@/pages/InsightsPage'
import InsightsAiPage from '@/pages/InsightsAiPage'
import InsightsWeeklyPage from '@/pages/InsightsWeeklyPage'
import InsightsOverviewPage from '@/pages/InsightsOverviewPage'
import InsightsTrendsPage from '@/pages/InsightsTrendsPage'
import InsightsHistoryPage from '@/pages/InsightsHistoryPage'
import InsightsRecommendationsPage from '@/pages/InsightsRecommendationsPage'
import InsightsReportsPage from '@/pages/InsightsReportsPage'
import KnowledgeHubPage from '@/pages/KnowledgeHubPage'
import ComingSoonPage from '@/pages/ComingSoonPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import ReleaseNotesPage from '@/pages/ReleaseNotesPage'
import GoalsPage from '@/pages/GoalsPage'
import ReportsPage from '@/pages/ReportsPage'
import DesignSystemPage from '@/pages/DesignSystemPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import MedicalDisclaimerPage from '@/pages/MedicalDisclaimerPage'
import AboutPage from '@/pages/AboutPage'
import HowItWorksPage from '@/pages/HowItWorksPage'
import NotFoundPage from '@/pages/NotFoundPage'
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/*
          Login/Signup render full-screen outside AppShell (no marketing
          navbar/footer) for the immersive split-screen auth experience —
          still gated by the same PublicOnlyRoute redirect-if-authenticated
          guard used everywhere else.
        */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/*
          Onboarding renders full-screen outside AppShell too (same reason
          as Login/Signup above) — still gated by the same ProtectedRoute +
          OnboardingGuard used before this change.
        */}
        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingGuard />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>
        </Route>

        <Route element={<AppShell variant="authenticated" />}>
          <Route element={<ProtectedRoute />}>
            <Route element={<RequireOnboarding />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cycle-tracker" element={<CycleTrackerPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wellness-tracker" element={<WellnessTrackerPage />} />
              <Route path="/fertility-journey" element={<FertilityJourneyPage />} />
              <Route path="/baby-growth" element={<BabyGrowthPage />} />
              <Route path="/hormone-balance" element={<HormoneBalancePage />} />
              <Route path="/symptom-explorer" element={<SymptomExplorerPage />} />
              <Route path="/lifestyle-intelligence" element={<LifestyleIntelligencePage />} />
              <Route path="/sleep-intelligence" element={<SleepIntelligencePage />} />
              <Route path="/nutrition-companion" element={<NutritionCompanionPage />} />
              <Route path="/stress-recovery" element={<StressRecoveryPage />} />
              <Route path="/recovery-planner" element={<RecoveryPlannerPage />} />
              <Route path="/preventive-screening-planner" element={<PreventiveScreeningPlannerPage />} />
              <Route path="/preventive-reminders" element={<PreventiveRemindersPage />} />
              <Route path="/environmental-wellness" element={<EnvironmentalWellnessPage />} />
              <Route path="/wellness-score" element={<WellnessScorePage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/insights/ai" element={<InsightsAiPage />} />
              <Route path="/insights/weekly" element={<InsightsWeeklyPage />} />
              <Route path="/insights/overview" element={<InsightsOverviewPage />} />
              <Route path="/insights/trends" element={<InsightsTrendsPage />} />
              <Route path="/insights/history" element={<InsightsHistoryPage />} />
              <Route path="/insights/recommendations" element={<InsightsRecommendationsPage />} />
              <Route path="/insights/reports" element={<InsightsReportsPage />} />
              <Route path="/learn" element={<KnowledgeHubPage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/release-notes" element={<ReleaseNotesPage />} />
              <Route path="/coming-soon/:slug" element={<ComingSoonPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App
