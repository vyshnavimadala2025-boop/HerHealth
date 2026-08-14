import { Navigate, Outlet } from 'react-router-dom'
import { AI_INTELLIGENCE_PREVIEW_ONLY } from '@/features/aiIntelligence/constants'

/**
 * Blocks the /ai route subtree entirely outside development builds
 * (Phase 2 Section 15) — not just hiding the nav link, since that alone
 * wouldn't stop direct navigation. This is the enforcement point for
 * "do not silently bypass" the still-open Privacy Page and emergency-copy
 * sign-off blockers (see PreviewGateNotice.tsx and constants.ts). Redirects
 * to /dashboard rather than a 404 so it reads as "not available yet," not
 * as a broken link.
 */
function RequireAiPreview() {
  if (!AI_INTELLIGENCE_PREVIEW_ONLY) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export default RequireAiPreview
