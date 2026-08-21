import { describe, expect, it } from 'vitest'
import { FEATURE_IDS, FEATURE_LABELS } from '@/features/subscription/entitlements'

describe('FEATURE_LABELS', () => {
  it('has a label for every declared feature id, and no extras', () => {
    expect(Object.keys(FEATURE_LABELS).sort()).toEqual([...FEATURE_IDS].sort())
  })

  it('every label is non-empty', () => {
    for (const id of FEATURE_IDS) {
      expect(FEATURE_LABELS[id].length).toBeGreaterThan(0)
    }
  })
})

describe('FEATURE_IDS', () => {
  it('has no duplicate identifiers', () => {
    expect(new Set(FEATURE_IDS).size).toBe(FEATURE_IDS.length)
  })
})
