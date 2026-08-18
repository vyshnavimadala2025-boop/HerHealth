-- SIRILA Intelligence — Emergency detection coverage: variants of EXISTING
-- approved concepts only
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: closes part of the "detection coverage gap" finding from the
-- SIRILA emergency-detection coverage audit — the case where a genuine
-- emergency phrased differently than the 14 original fixed phrases (e.g.
-- "heart attack" instead of "chest pain") reached the 'routine' tier.
--
-- SCOPE, STRICTLY: this migration adds NATURAL-LANGUAGE VARIANTS of the
-- SEVEN emergency concepts ALREADY encoded in 0029's original 14 phrases.
-- It does NOT add any new clinical category. The following were
-- identified in the coverage audit as having NO existing representation
-- at all (poisoning/overdose, serious injury, pregnancy-specific
-- emergencies) and are deliberately NOT added here — they remain
-- REQUIRES CLINICAL + PRODUCT APPROVAL, unresolved, unimplemented.
--
-- The seven existing concepts and what was added to each (grouped and
-- commented below in the SQL itself, not a flat undifferentiated list —
-- Phase 5 of the remediation brief explicitly asked this stay
-- maintainable, not an "ever-growing keyword1..keyword500" list):
--   1. Acute cardiac / chest pain
--   2. Breathing difficulty
--   3. Severe bleeding
--   4. Suicidal ideation
--   5. Stroke signs
--   6. Severe allergic reaction
--   7. Loss of consciousness
--
-- Each addition is a DIRECT, low-ambiguity linguistic variant or
-- dictionary-level clinical synonym of its concept's existing canonical
-- phrase (e.g. "anaphylaxis" is literally the clinical term for "severe
-- allergic reaction"; "blacked out" is a direct synonym of "loss of
-- consciousness"; "heart attack" is what a person having chest pain from
-- a suspected cardiac event commonly calls it) — not a new clinical
-- judgment about what should be treated as an emergency. Deliberately
-- EXCLUDED, and flagged instead of guessed: euphemistic/ambiguous
-- suicidal-ideation phrasing (e.g. "don't want to be here anymore" —
-- too easily meant non-literally in casual speech, REQUIRES CLINICAL
-- REVIEW), and any bare single-word addition (e.g. "heart" alone) that
-- would be far more prone to false-positive than the existing phrase
-- list's precision profile.
--
-- KNOWN, ACCEPTED, PRE-EXISTING TRADEOFF, NOT INTRODUCED BY THIS
-- MIGRATION: pure substring matching cannot distinguish a personal
-- emergency statement ("I think I'm having a heart attack") from
-- educational/general discussion ("I learned about heart attacks in my
-- biology class") — both contain the same substring. This limitation
-- already existed for every phrase in the original 14 (e.g. "I passed
-- out from boredom in that meeting" already false-positived before this
-- migration). Building real context discrimination would require either
-- a real NLP/model classifier (not authorized anywhere in this project)
-- or a deterministic heuristic (e.g. requiring first-person-pronoun
-- proximity) that would REDUCE false positives at the cost of INCREASING
-- false negatives — the wrong tradeoff given the explicit stated
-- priority ("minimizing false negatives is the most important safety
-- metric"). Not implemented; reported as a PRODUCT DECISION if that
-- tradeoff is ever wanted despite the priority conflict.
--
-- NORMALIZATION (Phase 3): before matching, input is lowercased and has
-- hyphens/underscores replaced with spaces and repeated whitespace
-- collapsed to one space, so "HEART ATTACK", "heart-attack", and
-- "heart   attack" all match identically to "heart attack". Deliberately
-- conservative — no stemming, no fuzzy/edit-distance matching, no
-- synonym expansion beyond the explicit list above, per the explicit
-- instruction not to add aggressive transformations that could create
-- unsafe false positives.
--
-- DETECTION PRIORITY (Phase 6): no change needed — there is no second,
-- competing classifier anywhere in this architecture that could
-- "downgrade" a deterministic emergency match (no real AI/model
-- provider is connected anywhere in this project). This section of the
-- brief does not apply to the current architecture; noted rather than
-- silently skipped.
--
-- Does NOT touch: ai_emergency_response_text() (wording unchanged,
-- still the same unapproved placeholder), ai_send_message()'s
-- fail-closed normalization logic from 0039 (untouched, still correct),
-- any table, any RLS policy, any CHECK constraint.
--
-- Depends on 0029_ai_send_message.sql. Compatible with 0039 (0039 does
-- not modify this function; this migration does not modify anything 0039
-- touches).

create or replace function public.ai_classify_safety_tier(p_content text)
returns text
language sql
stable
as $$
  select case
    when regexp_replace(regexp_replace(lower(p_content), '[-_]+', ' ', 'g'), '\s+', ' ', 'g') ilike any (array[
      -- Concept 1: acute cardiac / chest pain (canonical: 'chest pain')
      '%chest pain%', '%heart attack%', '%chest tightness%', '%chest pressure%',
      '%pain in my chest%', '%pressure in my chest%',
      -- Concept 2: breathing difficulty (canonical: "can't breathe")
      '%can''t breathe%', '%cannot breathe%', '%cant breathe%',
      '%trouble breathing%', '%difficulty breathing%', '%struggling to breathe%',
      '%can''t catch my breath%', '%cant catch my breath%', '%gasping for air%',
      -- Concept 3: severe bleeding (canonical: 'severe bleeding')
      '%severe bleeding%', '%heavy bleeding%', '%bleeding a lot%', '%bleeding heavily%',
      '%won''t stop bleeding%', '%wont stop bleeding%', '%hemorrhaging%',
      -- Concept 4: suicidal ideation (canonical: 'suicidal')
      '%suicidal%', '%kill myself%', '%end my life%', '%want to die%',
      '%thinking about suicide%', '%want to end it all%',
      '%don''t want to live anymore%', '%dont want to live anymore%', '%no reason to live%',
      -- Concept 5: stroke signs (canonical: 'signs of stroke')
      '%signs of stroke%', '%face drooping%', '%face is drooping%',
      '%slurred speech%', '%sudden numbness%', '%one side of my body is weak%',
      -- Concept 6: severe allergic reaction (canonical: 'severe allergic reaction')
      '%severe allergic reaction%', '%anaphylaxis%', '%anaphylactic%',
      '%throat closing up%', '%throat is closing up%', '%throat is swelling%',
      -- Concept 7: loss of consciousness (canonical: 'loss of consciousness')
      '%loss of consciousness%', '%passed out%', '%blacked out%', '%fainted%',
      '%lost consciousness%', '%collapsed%'
    ]) then 'emergency'
    when regexp_replace(regexp_replace(lower(p_content), '[-_]+', ' ', 'g'), '\s+', ' ', 'g') ilike any (array[
      '%persistent fever%', '%high fever%', '%severe pain%', '%getting worse%',
      '%won''t stop%', '%worried it''s serious%'
    ]) then 'urgent'
    when regexp_replace(regexp_replace(lower(p_content), '[-_]+', ' ', 'g'), '\s+', ' ', 'g') ilike any (array[
      '%abuse%', '%self-harm%', '%self harm%', '%hurting myself%',
      '%eating disorder%', '%binge%', '%purge%'
    ]) then 'sensitive'
    else 'routine'
  end;
$$;

revoke all on function public.ai_classify_safety_tier(text) from public;
revoke execute on function public.ai_classify_safety_tier(text) from anon;
revoke execute on function public.ai_classify_safety_tier(text) from authenticated;

comment on function public.ai_classify_safety_tier(text) is
  'Coarse, mock-grade, keyword-based safety-tier classifier. Deliberately '
  'simple — a real provider integration must replace or substantially '
  'harden this. Callable ONLY internally, from within ai_send_message(). '
  'Input is normalized (lowercased, hyphens/underscores to spaces, '
  'whitespace collapsed) before matching (0040). Emergency-tier patterns '
  'are organized by concept (0040) — variants of the seven concepts '
  'already approved in the original 14-phrase list (0029), not new '
  'clinical categories. See this migration''s header for what was '
  'deliberately excluded and why.';
