import { Navigate, Outlet } from 'react-router-dom'
import { FEATURE_VISUAL_INSIGHT } from '@/features/aiIntelligence/constants'

/**
 * Gates the Visual Insight route (/ai/visual-insight) on
 * FEATURE_VISUAL_INSIGHT — disabled for the initial launch (image
 * intelligence is a post-launch feature). Nested inside RequireAiPreview
 * in App.tsx, so this only ever matters while chat itself is reachable.
 *
 * Route-level, not just nav-link hiding — a direct/bookmarked visit to
 * /ai/visual-insight is redirected the same as a hidden nav link would
 * be. Redirects to /ai (the chat home) rather than /dashboard, since a
 * visitor here was already engaging with the SIRILA Intelligence surface
 * and /ai is the closest available equivalent, not a jump back to the
 * general app.
 *
 * The underlying Visual Insight architecture (provider abstraction, mock
 * provider, server-side boundary, tests) is untouched — this component
 * only blocks the route, matching the "disable cleanly, don't delete"
 * requirement for this launch-scope change.
 */
function RequireVisualInsight() {
  if (!FEATURE_VISUAL_INSIGHT) {
    return <Navigate to="/ai" replace />
  }
  return <Outlet />
}

export default RequireVisualInsight
