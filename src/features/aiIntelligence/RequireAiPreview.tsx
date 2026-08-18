import { Navigate, Outlet } from 'react-router-dom'
import { FEATURE_SIRILA_CHAT } from '@/features/aiIntelligence/constants'

/**
 * Gates the SIRILA Intelligence chat surface (/ai, /ai/journal,
 * /ai/:conversationId) on FEATURE_SIRILA_CHAT — enabled for the initial
 * launch. Visual Insight (/ai/visual-insight) has its own separate guard,
 * RequireVisualInsight, nested inside this one — Visual Insight remains
 * disabled for this launch even though chat is enabled.
 *
 * Route-level, not just nav-link hiding, since that alone wouldn't stop
 * direct navigation. Redirects to /dashboard rather than a 404 so it
 * reads as "not available," not as a broken link.
 */
function RequireAiPreview() {
  if (!FEATURE_SIRILA_CHAT) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export default RequireAiPreview
