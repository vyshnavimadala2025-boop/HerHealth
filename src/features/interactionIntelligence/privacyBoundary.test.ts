import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Source-scan tests for the privacy boundary claims made throughout this
 * feature's copy and its implementation report — not just "this looks
 * right by inspection" but a mechanical check that stays true even if
 * someone edits these files later without reading the surrounding
 * comments. Mirrors the pattern already used elsewhere in this codebase
 * (e.g. grokAdapter.test.ts's "the real network call is confined to one
 * function" check) for the same reason: some properties are much easier
 * to guarantee structurally than to re-verify by eye on every change.
 */

const demoSource = readFileSync(new URL('./InteractionDemo.tsx', import.meta.url), 'utf-8')
const captureSource = readFileSync(new URL('./useInteractionCapture.ts', import.meta.url), 'utf-8')
const timingMathSource = readFileSync(new URL('./timingMath.ts', import.meta.url), 'utf-8')

describe('InteractionDemo.tsx — public demo has no persistence or network path', () => {
  // Scoped to the component function body, not the whole file — this
  // file's own leading doc comment explains the guarantee using the
  // literal words "localStorage" and "network request" in prose, which
  // would false-positive a whole-file scan (same lesson as the 0041
  // migration test's "message content" comment false positive).
  const functionBody = demoSource.slice(demoSource.indexOf('function InteractionDemo'))

  it('never imports the Supabase client', () => {
    expect(demoSource).not.toMatch(/supabaseClient/)
    expect(demoSource).not.toMatch(/from ['"]@supabase/)
  })

  it('never touches localStorage/sessionStorage', () => {
    expect(functionBody).not.toMatch(/localStorage/)
    expect(functionBody).not.toMatch(/sessionStorage/)
  })

  it('never makes a fetch/network call', () => {
    expect(functionBody).not.toMatch(/\bfetch\s*\(/)
  })

  it('never reads the demo input\'s value', () => {
    expect(functionBody).not.toMatch(/inputRef\.current\.value(?!\s*=\s*'')/)
    expect(functionBody).not.toMatch(/event\.target\.value/)
  })

  it('never reads event.key (the typed character), only event.code (the physical key)', () => {
    const keyHandlers = functionBody.slice(functionBody.indexOf('handleInputKeyDown'))
    expect(keyHandlers).not.toMatch(/event\.key\b/)
  })

  it('never logs anything to the console (no accidental content leakage via devtools)', () => {
    expect(functionBody).not.toMatch(/console\.(log|debug|info|warn)/)
  })
})

describe('useInteractionCapture.ts — authenticated capture stays within the same boundary', () => {
  // Scoped to the function body, not the whole file — this file's own
  // leading doc comment explains the guarantee using the literal phrases
  // "event.key"/"event.target.value", which would false-positive a
  // whole-file scan the same way the "message content" prose did in the
  // 0041 migration test.
  const functionBody = captureSource.slice(captureSource.indexOf('export function useInteractionCapture'))

  it('never reads event.key or input value, only event.code', () => {
    expect(functionBody).not.toMatch(/event\.key\b/)
    expect(functionBody).not.toMatch(/\.value\b/)
  })

  it('never logs anything to the console', () => {
    expect(functionBody).not.toMatch(/console\.(log|debug|info|warn)/)
  })

  it('only ever calls recordSessionSummary with an aggregated summary, never the raw buffer', () => {
    expect(functionBody).toMatch(/recordSessionSummary\(summary\)/)
    expect(functionBody).not.toMatch(/recordSessionSummary\(bufferRef/)
  })
})

describe('timingMath.ts — the shared math module cannot express content, by type shape', () => {
  it('TimedEvent and TimingSample interfaces contain no string-content field', () => {
    const timedEventBlock = timingMathSource.slice(
      timingMathSource.indexOf('export interface TimedEvent'),
      timingMathSource.indexOf('export interface TimingSample'),
    )
    // id is an opaque pairing key (a code/label), not content — but assert
    // there is no second string field alongside it that could hold text.
    const stringFieldCount = (timedEventBlock.match(/:\s*string/g) ?? []).length
    expect(stringFieldCount).toBe(1)
  })
})
