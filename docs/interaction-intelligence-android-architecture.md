<!-- title: SIRILA Interaction Intelligence — Android Architecture -->

# SIRILA Interaction Intelligence — Android Architecture

## Scope and honesty note

This repository is the SIRILA web application (React + TypeScript + Vite +
Supabase) — **there is no Android project in this repository**, and no
Kotlin/Java module exists to implement this in. This document is the
architecture specification the Android team's own repository would
implement against, matching the conceptual pipeline from the Interaction
Intelligence feature spec. It is intentionally *not* accompanied by
fabricated `.kt` files: this project has no way to compile, run, or
verify Android code, and shipping unverified Kotlin here would be worse
than not shipping it — it would look like a working implementation
without ever having been checked.

The web app's own implementation of the same concept — `timingMath.ts`,
`useInteractionCapture.ts`, `baselineStore.ts` in
`src/features/interactionIntelligence/` — is real, working, and verified
(browser keydown/keyup timing, never content). The architecture below is
the same data-firewall principle, described for the platform this repo
cannot build: a custom Android keyboard.

## Why `InputMethodService`, not `KeyboardView.OnKeyboardActionListener`

`KeyboardView` and `OnKeyboardActionListener` were deprecated in API 29
and are unsuitable for a production IME: no engagement with modern
`EditorInfo`, poor multi-language/IME-switcher integration, and no clean
separation between rendering and input-event handling. A production
SIRILA keyboard should be built as a standard Android
[`InputMethodService`](https://developer.android.com/reference/android/inputmethodservice/InputMethodService),
with the on-screen keyboard UI as a `View` the service inflates (Compose
or XML — an implementation detail, not part of this spec) and input
events read from `onKeyDown`/`onKeyUp` (hardware) and the IME's own touch
event callbacks (soft keyboard), not the deprecated listener interface.

## Pipeline

```text
InputMethodService
        |
Interaction Event Collector      <- reads press/release timestamps ONLY
        |
Press / Release Timing
        |
   Dwell Time  +  Flight Time    <- same definitions as timingMath.ts
        |
On-device Aggregator             <- rolling stats, never raw events, persisted
        |
Privacy / Data Firewall          <- hard boundary: only numbers cross it
        |
Feature Vector                   <- {medianDwell, dwellVariability,
        |                              medianFlight, flightVariability,
        |                              sessionDuration, validEvents}
        |
Optional Secure Sync             <- disabled until user opts in; same
                                     interaction_baseline /
                                     interaction_session_summary shape as
                                     0041_interaction_intelligence.sql
```

### Interaction Event Collector

- Owns exactly one responsibility: recording `(keyId, downAtMs, upAtMs)`
  triples. `keyId` is the physical/logical key position (comparable to
  `event.code` in the web implementation) — **never** the committed
  character, the `InputConnection`'s composing text, or anything derived
  from `getTextBeforeCursor` / `getTextAfterCursor`.
- Must not hold a reference to the app's `InputConnection` beyond what's
  required to actually type — the collector should be a sibling
  component the `InputMethodService` calls into with timestamps, not a
  wrapper around `InputConnection` itself. This keeps the "can this code
  path see what I typed" question answerable by inspection: the collector
  class simply has no method that could return text.

### Dwell Time + Flight Time

Identical definitions to `timingMath.ts` in this repo:

- **Dwell** = `upAtMs - downAtMs` for the same key.
- **Flight** = `nextDownAtMs - previousUpAtMs` between consecutive keys.

### On-device Aggregator

Runs entirely on-device. Maintains a rolling buffer per session (bounded,
e.g. last 500 events or current input-field session, whichever is
shorter) and reduces it to the same feature-vector shape the web client
already produces — median + coefficient-of-variation ("variability"),
not raw series — before anything leaves this component.

### Privacy / Data Firewall

A literal type boundary, not just a design intention: the aggregator's
public interface should return a `FeatureVector` value type (or
equivalent immutable data class) whose fields are exclusively numeric —
mirroring `TimingSummary` in `timingMath.ts`. No function in the
`InputMethodService` → collector → aggregator chain should have a return
type that includes `String`/`CharSequence` content. This makes "raw text
crossing the firewall" a compile-time-checkable property, not just a
code-review convention.

```kotlin
// Illustrative shape only — matches TimingSummary in timingMath.ts.
// Not a compiled/verified file; see the scope note above.
data class InteractionFeatureVector(
    val medianDwellMs: Double?,
    val dwellVariability: Double?,
    val medianFlightMs: Double?,
    val flightVariability: Double?,
    val sessionDurationMs: Long,
    val validEventCount: Int,
)
```

### Optional secure sync

Off by default. When the user has granted consent (mirrors
`consent.ts`'s single explicit toggle), the aggregator's periodic
`InteractionFeatureVector` output is the *only* thing transmitted —
serialized to the same shape `interaction_session_summary` expects in
`0041_interaction_intelligence.sql`. No raw event log, no per-keystroke
data, ever leaves the device in this design.

## Explicitly out of scope for collection

Per the feature spec, the collector must never read or store:

- Message content, or anything derived from `InputConnection` text APIs
- Passwords (an IME should already detect password `InputType` fields via
  `EditorInfo.inputType` and this collector must skip timing collection
  entirely for those fields, not just avoid reading the value)
- Message recipients, search queries, or any other app-level semantic
  content — this collector has no visibility into which app or field is
  focused beyond what's needed to detect password fields and step aside

## Consent and disable

Mirrors the web app's `consent.ts` / `InteractionIntelligencePanel.tsx`:
a single explicit "Enable Interaction Intelligence" toggle, off by
default, with an equally simple disable path that both stops future
collection and offers to clear the on-device aggregate (matching
`0041_interaction_intelligence.sql`'s `interaction_baseline` delete
policy).
