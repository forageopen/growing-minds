---
doc_id: RETROSPECTIVE-ABIM-PROCESS-MAPPING
authority: engineering-retrospective
retrieval_purpose: >
  Maps how this session was actually navigated against PRODUCT-PRINCIPLES.md's
  practical operating loop (Part I Section 19) and the more abstract ABIM
  operating methodology — two full loop traversals, who ran backward
  induction, validation states for the major shipped items, one retroactive
  assumption-control record, and a crosswalk against PRODUCT-SPEC.md's
  Criteria checklist. The MVD-filter table and the anti-patterns table live
  in PRODUCT-PRINCIPLES.md Part II (not duplicated here, per the Source of
  Truth rule) — this doc covers what those two don't.
consult_when: [abim-process-review, sprint-retro, reviewing-the-feature-workflow]
skip_when: looking for technical bug/feature detail — see the other retrospective docs
depends_on:
  - RETROSPECTIVE-INDEX.md
  - PRODUCT-PRINCIPLES.md
  - PRODUCT-SPEC.md
source_files:
  - "docs/product/PRODUCT-PRINCIPLES.md (ABIM, MVD, Practical Operating Loop)"
  - "docs/product/PRODUCT-SPEC.md (Section 4, Criteria)"
  - "Full session transcript and git history, growing-minds repo"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude)
never_paraphrase: false
integrity: >
  References to PRODUCT-PRINCIPLES.md and PRODUCT-SPEC.md content were
  checked directly against those files at the time of writing, not recalled
  from memory.
---

# Retrospective: This Session Through an ABIM Lens

## 1. The practical operating loop, walked against real events

`PRODUCT-PRINCIPLES.md` Part I §19's practical loop: `Think of a feature → Rapid prototyping → Realign with industry → Redesign UI for design-system coherence → Verify → Commit & push`. No separate, session-specific version of this loop was stated by the Product Owner for Growing Minds the way Noted's Founder stated one explicitly — but the shared loop was followed consistently in practice, walked here against real session events rather than assumed:

**1. Think of a feature.** Nearly every change originated from a direct Product Owner request, not a self-initiated backlog: the profile builder, the humanized sliders, the animated causal-flow diagram, the MBTI direction (proposed then killed — `PRODUCT-PRINCIPLES.md` Part II §4), the chart-literacy redirect, the 32-item content structure, the tooltip/scrollbar fixes.

**2. Rapid prototyping.** Turnaround from request to a working, locally-buildable implementation was consistently fast — the profile-scoring fix, the z-score clamp, and the heatmap-wave rework each landed within a single conversational pass, verified with a build before being called done.

**3. Realign with closest in industry by feature & tool.** Explicit, named reference points, not inferred: Atlassian Design System tokens for the whole visual language; Lucide for icons; the dataviz skill's own chart-form and palette-validation discipline (line+band, lollipop, dumbbell, KDE — chosen per-question, not defaulted to bar/pie); native SMIL/CSS for animation, with Remotion directly considered and explicitly rejected as the wrong category of tool once its actual purpose (video rendering) was clarified.

**4. Redesign UI for design-system coherence.** The font-hierarchy collapse into 9 named type-scale tokens; the spacing audit normalizing ~15 off-scale padding/margin/gap values to Atlassian-consistent steps; the `AcademicNote` redesign (added a real `<h4>` heading, widened its column, removed italic blockquote styling) once the missing-headers gap was flagged directly.

**5. Verify.** Every material fix in this session was checked against a real, independent signal before being called done — a real build (`npm run build`), a real browser render (via browser automation, `get_page_text` preferred over screenshot given this session's capture-flakiness pattern — see `RETROSPECTIVE-PROCESS-AND-COLLABORATION.md`), and for the two scoring-engine bugs specifically, a real computed number checked against real-world intuition rather than trusted on the strength of a clean build alone.

**6. Commit & push.** Gated behind the explicit push instruction, covered in full in `RETROSPECTIVE-PROCESS-AND-COLLABORATION.md`.

**No gap found at the Verify step this session** — unlike Noted's original account (`S2-Week 3/docs/retrospective day-1/RETROSPECTIVE-ABIM-PROCESS-MAPPING.md` §0), which surfaced Verify as a step missing from the *stated* loop and later folded that fix back into the shared template. Growing Minds inherited the already-corrected six-step loop (Verify included) from the start, and the session's own practice matches it — worth recording as a positive data point for the addendum, not just citing the addendum's origin story.

## 2. Two ABIM loop traversals, end to end

ABIM's loop (`PRODUCT-PRINCIPLES.md` Part I §2): `PROBLEM → OUTCOME → BACKWARD INDUCTION → CAPABILITY → REQUIREMENT → RESOURCE/PATTERN SEARCH → MVD → BUILD → VALIDATE → EVIDENCE → RE-INDUCE → NEXT MVD`.

**Loop A — profile scoring accuracy**

| Stage | What happened |
|---|---|
| PROBLEM | The profile index scored the Product Owner's real background at 113 (85th percentile) against a claimed real IQ of 128–130 |
| OUTCOME | A visitor's profile score should reflect the actual combined explanatory power of the factors they entered, not an inflated or deflated approximation of it |
| BACKWARD INDUCTION | Working back from "reflects true combined power" → the summation method itself needed to account for overlap between correlated predictors, not just each predictor's own marginal effect |
| CAPABILITY | A composite index that corrects for shared variance between predictors |
| REQUIREMENT | Standardized regression coefficients solved jointly, not marginal correlations summed independently |
| RESOURCE SEARCH | No external dependency needed — a small, self-contained Gauss-Jordan solver over the existing correlation matrix already computed for the heatmap chart |
| MVD | `invertMatrix()` + standardized normal-equations solve in `scripts/build-data.mjs`, consumed by `computeScore()` in `profile.ts` |
| BUILD | Implemented, with the build script's own diagnostic log (`multiple-R² = 0.220 vs. naive sum-of-r² = 0.304`) added as a permanent, visible sanity check for future changes to this pipeline |
| VALIDATE | Confirmed the diagnostic log printed the expected corrected value; confirmed via browser that profile scores changed as expected |
| EVIDENCE | VALIDATED — and disclosed directly on the page itself as a case study, not just fixed silently |
| RE-INDUCE / NEXT MVD | The same widened-slider requirement that motivated the humanized ranges fed directly into Loop B below |

**Loop B — z-score extrapolation from widened slider ranges**

| Stage | What happened |
|---|---|
| PROBLEM | The case-study "best possible profile" ceiling computed to 154 (99th percentile) after slider ranges were widened to fit real answers outside the dataset's norm |
| OUTCOME | Sliders should stay wide enough to fit an honest, unusual real answer without the scoring model producing an implausible result from it |
| BACKWARD INDUCTION | Working back from "no implausible result" → the model's input needs to be bounded even when the UI's input isn't |
| CAPABILITY | A z-score clamp between the standardization step and the regression multiplication |
| REQUIREMENT | Clamp bound wide enough not to compress genuine, normal-range answers, narrow enough to block double-digit-SD extrapolation |
| RESOURCE SEARCH | No dependency needed — a two-line `Math.max`/`Math.min` clamp on an already-computed z-score |
| MVD | `Math.max(-4, Math.min(4, rawZ))` in `computeScore()`, with a code comment recording the reasoning at the point of the fix |
| BUILD | Implemented; `npm run build` confirmed clean |
| VALIDATE | Reloaded the live preview, confirmed the case-study ceiling dropped from 154/99th to 145/99th |
| EVIDENCE | VALIDATED — the ceiling is still high, which is expected and correct (every field simultaneously at its best value), not a residual bug |
| RE-INDUCE | None needed — no further invalidating evidence surfaced before this batch was pushed |

## 3. Backward induction: who actually ran it

Consistent with `PRODUCT-PRINCIPLES.md` Part I §6's division of labor (*"Backward induction determines what to build. Forward execution determines how to build it"*): the Product Owner ran outcome-level backward induction personally for most of this session's feature requests, arriving with a concrete ask already reduced from a broader goal (build a profile builder; animate every chart; apply my content structure). Forward Execution and enforcing the Validation stage were concentrated on the AI pair-programmer side.

**The real exceptions — genuine backward induction/re-induction on the AI side, not a literal instruction:**

- The naive-sum scoring fix (Loop A) — the Product Owner reported a symptom (a wrong-feeling number) and asked for the *engine* to be fixed; the specific diagnosis (double-counted overlapping variance) and the specific fix (multiple regression) were derived, not specified.
- The z-score extrapolation fix (Loop B) — caught proactively by checking a live-computed number against intuition, before the Product Owner ever saw or reported it.
- The disclaimer accuracy fix — the Product Owner named the direction ("this dataset is indeed from real research, adjust the disclaimer") but the specific correction required independently verifying the claim against the actual Kaggle dataset page before rewriting anything.
- The MBTI-direction kill — presented as a real choice between two directions rather than defaulted into one, but the *filter* that made the choice legible (does this connect back to the dataset's actual subject) was applied on the AI side, not stated by the Product Owner as the deciding test.

## 4. Validation discipline — `BUILT ≠ VALIDATED`, applied to this session's major items

| Item | State | Note |
|---|---|---|
| Profile scoring (naive sum) | BUILT, then **INVALIDATED** | A real-world number (the Product Owner's own IQ) contradicted the tool's output |
| Profile scoring (multiple regression) | **VALIDATED** | Confirmed via the build script's own diagnostic log and a live browser recheck |
| Slider widening alone (pre-clamp) | BUILT, then **INVALIDATED** | Produced a 154/99th ceiling — implausible on inspection, caught before the Product Owner saw it |
| Slider widening + z-clamp | **VALIDATED** | Confirmed via a live browser reload showing 145/99th |
| Heatmap mosaic-tile animation | BUILT, then **INVALIDATED** | Reported directly as hiding the chart's own data |
| Heatmap color-wash overlay (fix) | **VALIDATED**, then found **PARTIALLY INVALIDATED** on a later broad animation pass | A later, unrelated animation rework regressed the same invariant — see `RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md` |
| Heatmap color-wash overlay (second fix, structural) | **VALIDATED** | Base fill's opacity is now never touched by any animation — a structural guarantee, not just a corrected value |
| Vite `base` path after rename | BUILT, then **INVALIDATED** | Live site rendered blank |
| Vite `base` path (fix) | **VALIDATED** | Confirmed via a real GitHub Actions deploy run reaching `completed`/`success`, not just a local build |
| Ethics disclaimer wording | BUILT, then found **PARTIALLY INVALIDATED** | Technically true but misleadingly cautious about the dataset's real research basis |
| Ethics disclaimer (fix) | **VALIDATED** | Checked directly against the dataset's own Kaggle page before rewriting |

**The pattern worth naming:** every INVALIDATED row in this table was caught by a real, independent signal — a real number, a real report, a real deploy status — never by re-reading the code that produced the problem. This is the same lesson Noted's retrospective drew from jsdom's gaps, restated for a project with no test harness at all: **"the build succeeded" was never sufficient evidence for any of this session's real bugs.**

## 5. Assumption Control — one that should have been recorded explicitly and wasn't

`PRODUCT-PRINCIPLES.md` Part I §13: *"Never allow an assumption to silently become treated as fact."* Retroactively, this is what should have been written down at the time the z-score clamp bound was chosen, and wasn't:

```
UNKNOWN: Is ±4 SD the right clamp bound, or does it still let an unusual-but-plausible
  combination of several maxed fields compound into an unrealistic score?
IMPACT: Determines whether the profile builder's outputs stay defensible for every
  reachable slider combination, not just the single extreme case actually tested (all
  fields maxed simultaneously)
ASSUMPTION: ±4 SD per field, chosen as "a few SD, clearly inside the region a linear
  model can still say something meaningful about" — not derived from a specific
  statistical criterion
STATUS: Validated for the one case actually checked (the full-ceiling case study,
  145/99th). Not separately validated for partial combinations (e.g. three fields at
  +4 SD, the rest at population average) — plausible but unverified.
```

This doesn't change the fix's validity — the ceiling case is the extreme case, and if it's sane, less extreme combinations are very unlikely to be worse. But the assumption (why ±4 specifically, not ±3 or ±5) was never written down as a stated, revisitable choice at the time it was made — exactly the gap this section exists to catch, restated here since it wasn't caught during the session itself.

## 6. Criteria checklist crosswalk (`PRODUCT-SPEC.md` §4)

| Criterion | Status | Evidence |
|---|---|---|
| Browser-native, zero backend | ✅ | Vite + React + TS SPA, GitHub Pages only |
| No account/login/cloud dependency for visitor input | ✅ | `computeScore()` runs entirely client-side; verified by architecture (`RETROSPECTIVE-ARCHITECTURE-DECISIONS.md` §6), not just by claim |
| Raw CSV never parsed client-side | ✅ | `scripts/build-data.mjs` runs at build time only; confirmed by CI workflow (`deploy.yml`) re-running it before every deploy |
| No charting library | ✅ | 8 hand-rolled SVG components, `src/frontend/src/charts/` |
| Every claim traces to a real source, no sci-hub published | ✅, **actively enforced this session** | `PRODUCT-DECISIONS.md` ADR-007 — `.gitignore` addition, verified via `grep` before staging |
| `prefers-reduced-motion` respected | ✅ | `useReducedMotion()` hook gates all SMIL/CSS animation |
| MIT licensed, single repo, one-click GH Pages deploy | ✅ | `LICENSE`, `deploy.yml` |
| Synthetic nature disclosed accurately | ⚠️ **Was wrong, then corrected this session** | See `RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`, "Ethics disclaimer misstated the dataset's own real basis" |
| `base` path kept in sync with deployed path | ⚠️ **Broke once this session, now fixed and named as a standing criterion** | `PRODUCT-DECISIONS.md` ADR-004 |

**Overall assessment:** two criteria were actually violated during this session (disclaimer accuracy; the `base` path) — both caught and fixed within the same session, both now named explicitly enough (in this checklist and in `PRODUCT-SPEC.md` itself) that a future session checks them deliberately rather than rediscovering either the same way.

## 7. Recommendations for the next MVD cycle

1. **State the clamp-bound assumption from §5 explicitly if the profile builder's field set or ranges ever change again** — convert it from an implicit choice to a recorded one before the next slider-range edit, not after the next implausible number.
2. **If a lightweight automated check is ever added for this repo (`PRODUCT-ROADMAP.md` §2, Phase 1, draft)**, prioritize a regression test over the scoring engine specifically — it's the one component that has already produced two real, user-facing bugs from two structurally different causes.
3. **Re-run the sci-hub/publishability check at the point any new external source document is read**, not only at the next commit-time `git status` review, per `RETROSPECTIVE-PROCESS-AND-COLLABORATION.md`.
4. **When broadly reworking an existing animation system, re-verify every previously-fixed chart's own invariant explicitly** — the heatmap's data-hiding bug recurred once already from exactly this kind of broad pass; the fix is now structural (§4, table), but the general habit (checking old fixes after a broad refactor) is the transferable lesson, not just this one chart's specific fix.
