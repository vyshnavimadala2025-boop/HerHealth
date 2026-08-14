import type { AiSafetyTier } from '@/features/aiIntelligence/types'

/**
 * Client-side mirror of public.ai_classify_safety_tier() (0029). Used
 * ONLY for immediate, optimistic UI behavior — which mock reply template
 * to show, and whether to render the emergency-tier UI treatment without
 * waiting on the network round trip. It is NOT the security boundary: the
 * real, authoritative classification happens server-side inside
 * ai_send_message(), which cannot be bypassed by a modified client. Keep
 * the category lists conceptually aligned with the SQL version, but this
 * file existing or being wrong does not create a safety gap by itself.
 *
 * KNOWN LIMITATION (see Phase 2 checkpoint report): because there is no
 * server-side function generating real model output yet (Phase 2 is a
 * mock-model phase), the actual *content* of a mock reply is chosen using
 * THIS client-side classification, not the server-side one. That's an
 * acceptable interim tradeoff only because the content is a canned mock
 * with no real safety risk. Before a real AI provider is wired in, content
 * generation must move server-side (an Edge Function) and be screened
 * there — this file must not be trusted as a safety boundary at that point.
 */

const EMERGENCY_PATTERNS = [
  /chest pain/i,
  /can'?t breathe/i,
  /cannot breathe/i,
  /severe bleeding/i,
  /heavy bleeding/i,
  /suicidal/i,
  /kill myself/i,
  /end my life/i,
  /want to die/i,
  /signs of stroke/i,
  /face drooping/i,
  /severe allergic reaction/i,
  /loss of consciousness/i,
  /passed out/i,
]

const URGENT_PATTERNS = [
  /persistent fever/i,
  /high fever/i,
  /severe pain/i,
  /getting worse/i,
  /won'?t stop/i,
  /worried it'?s serious/i,
]

const SENSITIVE_PATTERNS = [
  /abuse/i,
  /self-harm/i,
  /self harm/i,
  /hurting myself/i,
  /eating disorder/i,
  /\bbinge\b/i,
  /\bpurge\b/i,
]

export function classifySafetyTierClientSide(content: string): AiSafetyTier {
  if (EMERGENCY_PATTERNS.some((pattern) => pattern.test(content))) return 'emergency'
  if (URGENT_PATTERNS.some((pattern) => pattern.test(content))) return 'urgent'
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(content))) return 'sensitive'
  return 'routine'
}
