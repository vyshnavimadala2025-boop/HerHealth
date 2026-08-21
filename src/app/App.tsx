import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import AdminLoginPage from '@/pages/AdminLoginPage'
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
import WomensHealthArticlePage from '@/pages/WomensHealthArticlePage'
import ComingSoonPage from '@/pages/ComingSoonPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import ReleaseNotesPage from '@/pages/ReleaseNotesPage'
import GoalsPage from '@/pages/GoalsPage'
import ReportsPage from '@/pages/ReportsPage'
import SubscriptionPage from '@/pages/SubscriptionPage'
import FeedbackPage from '@/pages/FeedbackPage'
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
import AdminAuthProvider from '@/features/admin/adminAuth/AdminAuthProvider'
import RequireAdmin from '@/features/admin/adminAuth/RequireAdmin'
import AdminShell from '@/components/layout/AdminShell'
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import AdminFeatureUsagePage from '@/pages/admin/AdminFeatureUsagePage'
import AdminActivityPage from '@/pages/admin/AdminActivityPage'
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage'
import AdminPlatformHealthPage from '@/pages/admin/AdminPlatformHealthPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import RequireAiPreview from '@/features/aiIntelligence/RequireAiPreview'
import RequireVisualInsight from '@/features/visualInsight/RequireVisualInsight'
import AiIntelligenceHomePage from '@/pages/ai/AiIntelligenceHomePage'
import AiSymptomJournalPage from '@/pages/ai/AiSymptomJournalPage'
import AiConversationPage from '@/pages/ai/AiConversationPage'
import VisualInsightPage from '@/features/visualInsight/VisualInsightPage'

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
          Admin Login — a distinct entry point (not a second auth system):
          same supabase.auth.signInWithPassword() call as /login, via the
          same authService.signIn(). Deliberately NOT wrapped in
          PublicOnlyRoute (which would redirect an already-authenticated
          visitor to /dashboard) — AdminLoginPage handles the
          already-authenticated case itself, redirecting to /admin so the
          real guard (RequireAdmin, further below) makes the actual call.
          The route itself grants nothing; /admin remains protected by
          ProtectedRoute + RequireAdmin regardless of how it's reached.
        */}
        <Route path="/admin-login" element={<AdminLoginPage />} />

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
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/insights/ai" element={<InsightsAiPage />} />
              <Route path="/insights/weekly" element={<InsightsWeeklyPage />} />
              <Route path="/insights/overview" element={<InsightsOverviewPage />} />
              <Route path="/insights/trends" element={<InsightsTrendsPage />} />
              <Route path="/insights/history" element={<InsightsHistoryPage />} />
              <Route path="/insights/recommendations" element={<InsightsRecommendationsPage />} />
              <Route path="/insights/reports" element={<InsightsReportsPage />} />
              <Route path="/learn" element={<KnowledgeHubPage />} />
              <Route path="/womens-health" element={<WomensHealthArticlePage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/release-notes" element={<ReleaseNotesPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/coming-soon/:slug" element={<ComingSoonPage />} />

              {/*
                SIRILA Intelligence — launch scope: chat is enabled
                (FEATURE_SIRILA_CHAT), Visual Insight is disabled
                (FEATURE_VISUAL_INSIGHT) as a separate, independently
                gated post-launch feature. See
                src/features/aiIntelligence/constants.ts.
              */}
              <Route element={<RequireAiPreview />}>
                <Route path="/ai" element={<AiIntelligenceHomePage />} />
                <Route path="/ai/journal" element={<AiSymptomJournalPage />} />
                <Route element={<RequireVisualInsight />}>
                  <Route path="/ai/visual-insight" element={<VisualInsightPage />} />
                </Route>
                <Route path="/ai/:conversationId" element={<AiConversationPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/*
          Admin console — a deliberately separate route subtree (own
          AdminShell, not AppShell; no RequireOnboarding, since internal
          admin operators don't go through the patient onboarding flow).
          ProtectedRoute guarantees a session first; AdminAuthProvider then
          checks the database's is_admin() function and RequireAdmin acts
          on the result. Nested here so future /admin/users, /admin/activity,
          etc. can be added as siblings under the same AdminShell.
        */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminAuthProvider />}>
            <Route element={<RequireAdmin />}>
              <Route element={<AdminShell />}>
                <Route path="/admin" element={<AdminOverviewPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
                <Route path="/admin/feature-usage" element={<AdminFeatureUsagePage />} />
                <Route path="/admin/activity" element={<AdminActivityPage />} />
                <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                <Route path="/admin/health" element={<AdminPlatformHealthPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          classNames: {
            toast: 'rounded-xl! border! shadow-lg! font-sans!',
          },
        }}
      />
    </>
  )
}

export default App
