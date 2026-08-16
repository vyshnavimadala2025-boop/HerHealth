# SIRILA Visual Insight — Rollback Runbook

Status: prepared during the Observability & Rollback Readiness phase. Mock
mode only — no real provider is connected as of this writing, so most
scenarios below describe what *would* happen and how to respond once a
real provider exists. Written now so the response isn't improvised during
an actual incident.

## Emergency disable — quick reference

Two independent levers exist. Use the first one unless you have a specific
reason to use the second.

1. **Full stop — `VISUAL_INSIGHT_PROCESSING_ENABLED = false`**
   Files: `supabase/functions/visual-insight-process/provider/config.ts`
   (and, for defense in depth, `src/features/visualInsight/provider/config.ts`
   on the frontend). Flip to `false`, deploy. Every processing request —
   mock or real — is rejected immediately with a generic "temporarily
   unavailable" (503) response, logged as `PROVIDER_UNAVAILABLE`. This is
   the correct lever for "something is wrong and we need Visual Insight
   off right now," regardless of cause.

2. **Downgrade — `ACTIVE_PROVIDER = 'mock'`**
   Same files. Only relevant once a real provider is ever wired in; today
   this is already the value. Use this instead of the full stop when the
   goal is specifically "stop using the real provider but keep the mock
   experience available" — a narrower response than a full stop.

Both are hardcoded source constants, not environment variables, by design
(see each config.ts's own comments) — a deploy is required either way, and
that is intentional: no real-provider activation or deactivation should
ever happen via a runtime flag flip alone.

Uploading/processing images at all also depends on the frontend's
`AI_INTELLIGENCE_PREVIEW_ONLY` dev-only gate (`import.meta.env.DEV`),
which currently keeps the entire SIRILA Intelligence surface, including
Visual Insight, unavailable outside development builds. That gate is not
a production kill switch — it is not env-driven per-deployment and isn't
designed as an incident-response lever — but it is why "real users cannot
currently reach this feature at all" is true today independent of
anything in this document.

---

## Scenario A — Provider outage

- **Detection signal**: elevated `PROVIDER_UNAVAILABLE` / `PROVIDER_TIMEOUT` rate in telemetry (see Observability below); provider status page, if one exists once a provider is selected
- **Immediate action**: confirm it's the provider, not this codebase (check telemetry's `errorCategory` distribution — outage looks like a spike in one category, not a mix)
- **Who owns the decision**: on-call engineer, no approval needed for this lever specifically
- **Kill-switch action**: `ACTIVE_PROVIDER = 'mock'` (downgrade — mock still gives users a response, just not real analysis)
- **Provider disablement**: not required beyond the config flip; no need to touch provider credentials
- **Fallback behavior**: mock provider, already tested and always available
- **Verification steps**: re-run the live verification matrix from Phase 3A.2 against the reverted state (upload/process/consent/rate-limit/cross-user)
- **User-impact assessment**: users see mock/development messaging instead of real analysis — a degradation, not an outage, from their perspective
- **Escalation requirement**: notify product if outage exceeds a few hours (affects beta credibility)
- **Recovery procedure**: revert `ACTIVE_PROVIDER` back once the provider's status is confirmed healthy; re-run verification again before declaring recovered

## Scenario B — Unexpected provider cost spike

- **Detection signal**: provider billing dashboard/alert (not built by this repo — provider-side); if a per-account spend cap exists at the provider level, its alert
- **Immediate action**: check whether the spike correlates with a traffic spike (legitimate) or a small number of accounts (possible abuse or a bug looping requests)
- **Who owns the decision**: whoever holds provider billing access, in consultation with the incident owner (not yet named — see Phase 3A.5 readiness review)
- **Kill-switch action**: full stop (`VISUAL_INSIGHT_PROCESSING_ENABLED = false`) if the cause isn't immediately clear; downgrade to mock if it clearly is real-provider-specific and mock remains safe to leave running
- **Provider disablement**: full stop is sufficient; provider-side API key revocation is a further step if the cause looks like key compromise, not just heavy legitimate use
- **Fallback behavior**: mock, or nothing (full stop) depending on severity
- **Verification steps**: confirm no further billed calls occur after the flip (check provider dashboard, not just this codebase's logs)
- **User-impact assessment**: full stop means all Visual Insight users lose the feature temporarily; weigh against uncontrolled spend
- **Escalation requirement**: always — cost incidents involve whoever owns the budget, not just engineering
- **Recovery procedure**: identify root cause before re-enabling; if abuse, address the abuse vector (e.g., tighten the daily image limit) before flipping back on

## Scenario C — Unsafe or anomalous AI output

- **Detection signal**: user report, or (once real safety verification exists) the verification stage itself flagging results — this is the scenario dual-verification (Phase 3A.3 §5) exists to reduce, not eliminate
- **Immediate action**: full stop immediately — this is not a "downgrade to mock" situation, since the concern is specifically about real-provider output quality
- **Who owns the decision**: any engineer can and should flip the full-stop switch immediately on a credible report; retroactive review, not pre-approval, for this one
- **Kill-switch action**: `VISUAL_INSIGHT_PROCESSING_ENABLED = false`
- **Provider disablement**: not required at the API level unless the provider itself is the confirmed cause
- **Fallback behavior**: none — full stop, not mock, until the specific output is understood (mock could look like "business as usual" and mask that an incident occurred)
- **Verification steps**: reproduce if possible with a synthetic test image; confirm the safety-verification stage's actual behavior against the flagged case
- **User-impact assessment**: highest severity in this document — treat as a safety incident, not an availability incident
- **Escalation requirement**: clinical/legal, immediately — this is exactly the category of incident Phase 3A.4's GO/NO-GO gates exist to prevent, so its occurrence itself is information for that review process
- **Recovery procedure**: does not resume until clinical review of the specific incident is complete, independent of how quickly the technical cause is found

## Scenario D — Safety-verification failure

- **Detection signal**: elevated `SAFETY_VERIFICATION_FAILURE` telemetry category
- **Immediate action**: none required beyond normal operation — this is the *fail-closed path working as designed* (see `mockProvider.ts`'s "fails closed" comment), not itself necessarily an incident
- **Who owns the decision**: on-call engineer decides whether the *rate* of failures indicates a real problem (e.g., the verification stage itself is broken) versus normal operation
- **Kill-switch action**: only if failure rate is abnormally high — investigate the verification stage itself before assuming the primary provider is at fault
- **Provider disablement**: not automatic
- **Fallback behavior**: already built-in — a verification failure never produces a result, by design, regardless of any runbook action
- **Verification steps**: confirm via telemetry that failed requests received the safe "we couldn't verify this result" message, not a silent bypass
- **User-impact assessment**: low if rate is normal (users see a clear retry message); investigate if rate is elevated
- **Escalation requirement**: engineering only, unless failure rate suggests the verification stage itself needs clinical re-review
- **Recovery procedure**: n/a for isolated failures; for a systemic issue, treat as Scenario A (provider outage) if the verification provider itself is down

## Scenario E — Privacy/security incident

- **Detection signal**: any confirmed unauthorized access to image data, a leaked credential, or a report of data reaching somewhere it shouldn't
- **Immediate action**: full stop immediately; do not wait for root-cause analysis
- **Who owns the decision**: any engineer can flip the switch; a privacy/security incident is not something to delay on approval for
- **Kill-switch action**: `VISUAL_INSIGHT_PROCESSING_ENABLED = false`, and consider whether Storage bucket access itself needs tightening beyond the processing pipeline
- **Provider disablement**: rotate/revoke the provider API key immediately if the incident could involve it (not applicable today — none exists)
- **Fallback behavior**: full stop only — do not fall back to mock, since mock still exposes the same Storage/RLS surface the incident may involve
- **Verification steps**: this is the one scenario where "verification" means an actual security review, not just re-running the Phase 3A.2 test matrix — RLS policies, storage bucket policies, and signed-URL scoping should all be independently re-audited before recovery
- **User-impact assessment**: assess whether affected users need direct notification — a legal/product decision, not engineering's alone
- **Escalation requirement**: legal and product, always, immediately
- **Recovery procedure**: does not resume until the specific vulnerability is identified, fixed, and independently re-verified — this is the highest bar in this document

## Scenario F — Abnormal error rate

- **Detection signal**: telemetry `outcome: 'error'` proportion crossing a threshold (no specific threshold approved yet — see Phase 3A.5 readiness review §11, "observability" listed as NOT READY for exactly this reason: alerting doesn't exist yet, only the safe log fields do)
- **Immediate action**: check `errorCategory` distribution — a single dominant category points to a specific scenario above (rate limiting → check for a client bug spamming requests; provider errors → Scenario A; auth failures → possible session/token issue unrelated to Visual Insight specifically)
- **Who owns the decision**: on-call engineer
- **Kill-switch action**: situational — depends entirely on which category dominates; this scenario is a detection signal that routes to one of the others, not a distinct response of its own
- **Provider disablement**: only if the dominant category is provider-related
- **Fallback behavior**: depends on routed scenario
- **Verification steps**: confirm error rate returns to baseline after whatever action was taken
- **User-impact assessment**: depends on routed scenario
- **Escalation requirement**: depends on routed scenario
- **Recovery procedure**: depends on routed scenario

## Scenario G — Rate-limit exhaustion

- **Detection signal**: elevated `RATE_LIMITED` telemetry category, especially concentrated on a small number of users
- **Immediate action**: this is expected/normal behavior at the individual-user level (the limit exists to be hit); investigate only if concentrated abnormally
- **Who owns the decision**: on-call engineer for triage; product for any limit-value change
- **Kill-switch action**: none needed for normal exhaustion; if concentrated abuse is confirmed, that specific account's access is a product/support decision, not a global kill-switch situation
- **Provider disablement**: not applicable
- **Fallback behavior**: none needed — the RPC's existing rate-limit denial (live-verified in Phase 3A.2) is already the correct behavior
- **Verification steps**: confirm the RPC is denying at exactly the configured limit, not before or after (already verified in Phase 3A.2; re-verify only if this scenario is suspected to indicate a regression)
- **User-impact assessment**: none beyond the limit itself working as intended
- **Escalation requirement**: none for normal cases; product review if the limit itself appears mis-calibrated for real usage patterns
- **Recovery procedure**: n/a

## Scenario H — Provider policy/terms change

- **Detection signal**: none automatic — requires a periodic manual re-check of the signed agreement (recommended cadence: quarterly, per the Phase 3A.5 readiness review) or a direct notice from the provider
- **Immediate action**: legal reviews whether the change affects SIRILA's existing agreement or approval basis
- **Who owns the decision**: legal, with engineering executing whatever action is decided
- **Kill-switch action**: full stop if the change invalidates a condition Phase 3A.4's GO/NO-GO approval depended on (e.g., a retention-policy change, a training-policy change, BAA terms changing)
- **Provider disablement**: as directed by legal's review
- **Fallback behavior**: mock, if the feature should remain available in degraded form during the review
- **Verification steps**: legal confirms the new terms are acceptable, or a new provider is selected per the Phase 3A.5 readiness review's evaluation framework
- **User-impact assessment**: assess whether previously-processed user data is affected retroactively, not just future requests
- **Escalation requirement**: legal and product, always
- **Recovery procedure**: resume only after legal explicitly re-approves the (possibly updated) terms

---

## Notes on current readiness

As of this writing: no real provider is connected, so Scenarios A, B, C,
D (real-provider-caused), F, and H are all currently inapplicable in
practice — this document exists so the response is ready *before* it's
needed, not improvised after. Scenarios E and G are the two that already
apply today, since RLS/Storage and rate limiting are both live. See the
Phase 3A.5 readiness review for the full list of what remains open
(named incident owner, real alerting, etc.) before this runbook can be
considered production-complete rather than prepared-in-advance.
