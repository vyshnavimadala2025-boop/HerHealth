import type { RpcCapableClient, VisualInsightRequest, VisualInsightResult, VisualInsightServerProvider } from './types.ts'
import { VisualInsightProviderError } from './types.ts'

/**
 * STRUCTURAL ONLY — Phase 3A.4. This file contains no network call, no
 * `fetch`, no OpenAI SDK import, and no code path capable of sending an
 * image anywhere. `analyze()` below throws immediately and
 * unconditionally; that throw is the entire body of the method in this
 * phase. It exists so the shape of a future real integration is
 * reviewable and typed today, without any of the actual integration
 * existing yet.
 *
 * Enabling this adapter for real use later requires, at minimum:
 *   1. OPENAI_ENABLED flipped from false to true in config.ts — a
 *      reviewed source change, deployed deliberately. There is
 *      deliberately no environment variable that can flip this alone;
 *      an env var existing must never be sufficient to activate a real
 *      provider (see config.ts).
 *   2. OPENAI_API_KEY set via `supabase secrets set` on the real Supabase
 *      project — never committed to this repository, never present in
 *      any frontend-reachable (VITE_-prefixed) variable.
 *   3. This file's analyze() body actually implemented to call the
 *      OpenAI API — not present in this phase.
 *   4. Every item in the Phase 3A.4 GO/NO-GO decision freeze approved:
 *      provider terms verified, safety-verification architecture
 *      approved, emergency wording approved, privacy disclosure
 *      approved, age policy decided.
 */

export interface OpenAiAdapterConfig {
  /** Placeholder identifier only — not a verified/approved production model choice. */
  model: string
  timeoutMs: number
  maxImageSizeBytes: number
}

export const DEFAULT_OPENAI_ADAPTER_CONFIG: OpenAiAdapterConfig = {
  model: 'not-configured',
  timeoutMs: 30_000,
  maxImageSizeBytes: 10 * 1024 * 1024,
}

/**
 * Validates adapter configuration shape only — never contacts OpenAI to
 * verify a key is valid, since no key should exist to check in this
 * phase. Returns false for any config that is missing required fields or
 * obviously malformed, so a future caller fails safely before ever
 * attempting a real call.
 */
export function isValidOpenAiAdapterConfig(config: Partial<OpenAiAdapterConfig>): config is OpenAiAdapterConfig {
  return (
    typeof config.model === 'string' &&
    config.model.length > 0 &&
    typeof config.timeoutMs === 'number' &&
    config.timeoutMs > 0 &&
    typeof config.maxImageSizeBytes === 'number' &&
    config.maxImageSizeBytes > 0
  )
}

/**
 * Maps a future OpenAI SDK/API error shape to this project's normalized
 * VisualInsightErrorCategory. Written now so the mapping is reviewable
 * before any real error can ever occur — not exercised by any real call
 * in this phase, since no real call exists.
 */
export function mapOpenAiError(_error: unknown): VisualInsightProviderError {
  return new VisualInsightProviderError('provider_unavailable', 'The OpenAI provider is not enabled in this build.')
}

export const openAiServerProvider: VisualInsightServerProvider = {
  name: 'openai',

  // Parameters are unused — interface parity with VisualInsightServerProvider only, see file header.
  async analyze(_request: VisualInsightRequest, _client: RpcCapableClient): Promise<VisualInsightResult> {
    // No fetch, no SDK import, no network call exists below this line —
    // this throw is the entire body of this method in this phase.
    throw new VisualInsightProviderError(
      'provider_unavailable',
      'The OpenAI provider is not enabled in this build.',
    )
  },
}
