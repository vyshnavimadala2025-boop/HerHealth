/**
 * Aggregate-only shape returned by public.admin_ai_safety_metrics() (0038).
 * Deliberately no id/userId/conversationId/content fields exist here — the
 * RPC never returns them, so there is nothing to accidentally thread
 * through even if a future edit tried to.
 *
 * routineCount does not exist here on purpose: public.ai_safety_events can
 * never contain a routine-severity row (see the migration's header
 * comment) — this is a known, flagged gap in what this table can answer,
 * not an omission. See AdminSettingsPage.tsx for how this is surfaced.
 */
export interface AdminAiSafetyMetrics {
  totalEvents: number
  urgentCount: number
  sensitiveCount: number
  emergencyCount: number
  blockedCount: number
  escalatedCount: number
  loggedOnlyCount: number
  eventsLast24h: number
  eventsLast7d: number
}
