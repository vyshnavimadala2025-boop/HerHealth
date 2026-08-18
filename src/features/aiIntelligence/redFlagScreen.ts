import type { AiSafetyTier } from '@/features/aiIntelligence/types'

/**
 * Client-side mirror of public.ai_classify_safety_tier() (0029, expanded
 * 0040). Used ONLY for immediate, optimistic UI behavior — which mock
 * reply template to show, and whether to render the emergency-tier UI
 * treatment without waiting on the network round trip. It is NOT the
 * security boundary: the real, authoritative classification happens
 * server-side inside ai_send_message(), which cannot be bypassed by a
 * modified client. Keep the category lists conceptually aligned with the
 * SQL version, but this file existing or being wrong does not create a
 * safety gap by itself.
 *
 * KNOWN LIMITATION (see Phase 2 checkpoint report): because there is no
 * server-side function generating real model output yet (Phase 2 is a
 * mock-model phase), the actual *content* of a mock reply is chosen using
 * THIS client-side classification, not the server-side one. That's an
 * acceptable interim tradeoff only because the content is a canned mock
 * with no real safety risk. Before a real AI provider is wired in, content
 * generation must move server-side (an Edge Function) and be screened
 * there — this file must not be trusted as a safety boundary at that point.
 *
 * NORMALIZATION (0040, mirrors the SQL side's regexp_replace steps):
 * lowercase, hyphens/underscores collapsed to a space, repeated
 * whitespace collapsed to one space, trimmed — so "HEART ATTACK",
 * "heart-attack", and "heart   attack" all match identically. Matching
 * itself is plain substring containment (String.includes), matching
 * Postgres ILIKE's semantics exactly, not a regex engine — deliberately
 * simple, no stemming, no fuzzy matching, no synonym expansion beyond the
 * explicit lists below.
 *
 * EMERGENCY_PHRASES is grouped by concept (0040) — variants of the seven
 * concepts already approved in the original 14-phrase list, not new
 * clinical categories. See supabase/migrations/0040_ai_emergency_concept_variants.sql
 * for the full rationale, what was deliberately excluded, and the known,
 * pre-existing, unresolved false-positive tradeoff of pure substring
 * matching (e.g. it cannot distinguish "I think I'm having a heart
 * attack" from "I learned about heart attacks in class").
 */

function normalize(content: string): string {
  return content
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const EMERGENCY_PHRASES = [
  // Concept 1: acute cardiac / chest pain (canonical: 'chest pain')
  'chest pain', 'heart attack', 'chest tightness', 'chest pressure',
  'pain in my chest', 'pressure in my chest',
  // Concept 2: breathing difficulty (canonical: "can't breathe")
  "can't breathe", 'cannot breathe', 'cant breathe',
  'trouble breathing', 'difficulty breathing', 'struggling to breathe',
  "can't catch my breath", 'cant catch my breath', 'gasping for air',
  // Concept 3: severe bleeding (canonical: 'severe bleeding')
  'severe bleeding', 'heavy bleeding', 'bleeding a lot', 'bleeding heavily',
  "won't stop bleeding", 'wont stop bleeding', 'hemorrhaging',
  // Concept 4: suicidal ideation (canonical: 'suicidal')
  'suicidal', 'kill myself', 'end my life', 'want to die',
  'thinking about suicide', 'want to end it all',
  "don't want to live anymore", 'dont want to live anymore', 'no reason to live',
  // Concept 5: stroke signs (canonical: 'signs of stroke')
  'signs of stroke', 'face drooping', 'face is drooping',
  'slurred speech', 'sudden numbness', 'one side of my body is weak',
  // Concept 6: severe allergic reaction (canonical: 'severe allergic reaction')
  'severe allergic reaction', 'anaphylaxis', 'anaphylactic',
  'throat closing up', 'throat is closing up', 'throat is swelling',
  // Concept 7: loss of consciousness (canonical: 'loss of consciousness')
  'loss of consciousness', 'passed out', 'blacked out', 'fainted',
  'lost consciousness', 'collapsed',
]

const URGENT_PHRASES = [
  'persistent fever', 'high fever', 'severe pain', 'getting worse',
  "won't stop", 'wont stop', "worried it's serious", 'worried its serious',
]

// 'binge'/'purge' previously had client-only \b word-boundary regex
// protection that the SQL side never had (an inconsistency, not a
// deliberate extra safeguard) — plain substring matching here now
// matches the server-side ILIKE semantics exactly, same as every other
// phrase in this file.
const SENSITIVE_PHRASES = [
  'abuse', 'self-harm', 'self harm', 'hurting myself',
  'eating disorder', 'binge', 'purge',
]

function includesAny(normalized: string, phrases: string[]): boolean {
  return phrases.some((phrase) => normalized.includes(normalize(phrase)))
}

export function classifySafetyTierClientSide(content: string): AiSafetyTier {
  const normalized = normalize(content)
  if (includesAny(normalized, EMERGENCY_PHRASES)) return 'emergency'
  if (includesAny(normalized, URGENT_PHRASES)) return 'urgent'
  if (includesAny(normalized, SENSITIVE_PHRASES)) return 'sensitive'
  return 'routine'
}
