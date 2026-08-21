// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInteractionCapture } from './useInteractionCapture'
import { getBaselineSummary } from './baselineStore'
import { setInteractionIntelligenceEnabled } from './consent'

function pressKey(code: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code }))
  window.dispatchEvent(new KeyboardEvent('keyup', { code }))
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useInteractionCapture — consent gating', () => {
  it('records nothing when consent has not been granted', () => {
    setInteractionIntelligenceEnabled(false)
    const { unmount } = renderHook(() => useInteractionCapture())

    pressKey('KeyA')
    pressKey('KeyB')
    unmount() // would flush if a listener were attached

    expect(getBaselineSummary().status).toBe('no-data')
  })

  it('records real timing once consent is granted', () => {
    setInteractionIntelligenceEnabled(true)
    const { unmount } = renderHook(() => useInteractionCapture())

    for (let i = 0; i < 5; i++) pressKey('KeyA')
    unmount() // flush-on-unmount persists the session summary

    expect(getBaselineSummary().status).not.toBe('no-data')
    expect(getBaselineSummary().sessionCount).toBe(1)
  })

  it('stops recording once consent is withdrawn (a fresh mount after disabling captures nothing new)', () => {
    setInteractionIntelligenceEnabled(true)
    const first = renderHook(() => useInteractionCapture())
    for (let i = 0; i < 5; i++) pressKey('KeyA')
    first.unmount()
    expect(getBaselineSummary().sessionCount).toBe(1)

    setInteractionIntelligenceEnabled(false)
    const second = renderHook(() => useInteractionCapture())
    for (let i = 0; i < 5; i++) pressKey('KeyB')
    second.unmount()

    // Still 1 — the second (disabled) mount recorded no additional session.
    expect(getBaselineSummary().sessionCount).toBe(1)
  })

  it('ignores repeated keydown events from a held key (auto-repeat) rather than inflating the sample count', () => {
    setInteractionIntelligenceEnabled(true)
    const { unmount } = renderHook(() => useInteractionCapture())

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', repeat: true }))
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))
    unmount()

    // A down with no matching "real" down (the repeat was ignored) pairs
    // with nothing, so no session summary should have been recorded.
    expect(getBaselineSummary().status).toBe('no-data')
  })
})
