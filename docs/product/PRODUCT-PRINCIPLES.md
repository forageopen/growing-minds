---
doc_id: PRODUCT-PRINCIPLES
authority: governing-philosophy
retrieval_purpose: >
  Universal operating methodology (ABIM, MVD) reproduced unmodified from
  the shared cross-project template (`S2-Week 3/docs/product/PRODUCT-PRINCIPLES.md`),
  plus Growing Minds' own worked application of it — the actual outcome
  sentence, MVD filter, resource-arbitrage calls, and anti-pattern checks
  for this specific product.
consult_when: [product-boundary-judgment, build-no-build-call, scope-filter,
  re-induction-after-evidence, assumption-control, onboarding-to-this-repo,
  auditing-this-repo]
skip_when: routine execution already inside an established MVD boundary
depends_on: []
related:
  - PRODUCT-SPEC.md
  - PRODUCT-ROADMAP.md
  - PRODUCT-DECISIONS.md
source_files:
  - "S2-Week 3/docs/product/PRODUCT-PRINCIPLES.md (shared template, Part I source)"
  - "Full session transcript and git history, growing-minds repo (github.com/forageopen/growing-minds)"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude), acting under the Product Owner's direction
never_paraphrase: true
integrity: >
  Part I (ABIM, MVD) is reproduced in full, unmodified, from the shared
  template. Part II is written fresh for Growing Minds and is this file's
  own current subject.
---

# PRODUCT-PRINCIPLES.md

## How this file is organized

**Part I is the universal method**, shared across every repository under this Product Owner's name — reproduced here unmodified. **Part II is Growing Minds' own worked application of it** — the current subject of this file.

---

# Part I — Universal Method

## 1. ABIM — Agile Backward-Induction Project Management

**Version:** 0.2
**Status:** Experimental operating methodology
**Use:** Solo product, creative technology, software, knowledge systems, AI-assisted production

### 1. Core Principle

> **Think backward from the desired outcome. Build forward in small deliveries. Validate against reality. Re-induce from evidence.**

ABIM combines: Agile iteration, Backward induction, Design thinking, MVD, Resource reuse, Lean experimentation, Lightweight governance, AI-agent orchestration.

**Primary objective:** minimize unnecessary work while preserving delivery discipline.

### 2. Operating Loop

```text
PROBLEM → OUTCOME → BACKWARD INDUCTION → CAPABILITY → REQUIREMENT
  → RESOURCE / PATTERN SEARCH → MVD → BUILD → VALIDATE → EVIDENCE
  → RE-INDUCE → NEXT MVD
```

The loop is non-linear. Evidence can invalidate earlier assumptions and send the project backward.

### 3. Outcome Before Feature

Do not start with "What feature should we build?" Start with "What should the user be able to see, understand, decide, or accomplish?"

Preferred outcome test: **"After using this, the user can now see ____."**

If a feature has no clear outcome, **defer, modify, or remove it**.

### 4. MVD

> Build the smallest complete delivery that produces the intended outcome.

MVD should have: essential functionality, low delivery complexity, cohesive experience, fast usability.

Do not optimize for feature count. Optimize for **visible outcome**.

### 5. Backward Induction

```text
OUTCOME ↑ USER BEHAVIOR ↑ EXPERIENCE ↑ CAPABILITY ↑ REQUIREMENT ↑ COMPONENT ↑ IMPLEMENTATION
```

At each level: **What must be true for the previous level to work?** Do not assume a component or feature is necessary. Derive it from the desired outcome and observable user behavior.

### 6. Forward Execution

```text
MVD → DESIGN → BUILD → INTEGRATE → TEST → RELEASE
```

**Backward induction determines what to build. Forward execution determines how to build it.**

### 7. Resource Arbitrage

```text
REUSE → COMPOSE → ADAPT → BUILD
```

Search open-source software, libraries, models, datasets, standards, infrastructure, UX patterns, documentation, existing project artifacts. Do not rebuild solved infrastructure without a reason.

### 8. Pattern Mining

```text
DESIRED EXPERIENCE → EXISTING PRODUCTS → PATTERN EXTRACTION → COMPARISON → RECOMBINATION → NEW SOLUTION
```

Innovation should focus on the actual problem or useful recombination, not novelty for its own sake.

### 9. Design Thinking

```text
OBSERVE → DEFINE → OUTCOME → PROTOTYPE → TEST
```

For solo work, use evidence gathering and structured reflection instead of workshops.

### 10. Agile

```text
PLAN → BUILD → TEST → RELEASE → LEARN → ADAPT
```

ABIM changes the planning unit from generic task completion to **outcome-driven MVD delivery**.

### 11. Validation

```text
MVD → BUILD → TEST → REAL USE → OBSERVATION → EVIDENCE
```

**BUILT ≠ VALIDATED.** Evidence states: **VALIDATED**, **PARTIALLY VALIDATED**, **INVALIDATED**, **UNKNOWN**.

### 12. Re-Induction

When evidence contradicts the current model, do not automatically add features. Move backward (`FEATURE ↑ CAPABILITY ↑ USER BEHAVIOR ↑ OUTCOME`), locate the failed assumption. Possible actions: **CONTINUE | MODIFY | REDUCE | REPLACE | DEFER | KILL**.

### 13. Assumption Control

```text
UNKNOWN → HYPOTHESIS → TESTING → VALIDATED / INVALIDATED
```

Never allow an assumption to silently become treated as fact.

### 14. Lightweight Governance

Track only information that materially affects execution: scope, time, resources, risks, dependencies, decisions, quality, constraints, evidence.

### 15. Agent Protocol

**Before acting:** read project index; identify current outcome; identify current MVD; read relevant specifications; identify assumptions; search existing resources; confirm contribution to the current MVD.

**During execution:** stay within MVD boundary; reuse before rebuilding; record consequential decisions; surface contradictions; separate facts from assumptions; do not silently expand scope.

**Before completion:** verify essential functionality, cohesive experience, fast enough, acceptance criteria met, no critical blockers, intended outcome visible. Then record: delivered, worked, failed, unknown, next step. Return to backward induction.

### 16. Anti-Patterns

Detect and resist: feature accumulation, scope drift, premature architecture, reinvention, ceremony without decision value, false completion, founder confirmation bias, over-documentation, technology-first development, interaction-model creep.

### 17. Master Decision Filter

```text
1. WHAT OUTCOME?
2. WHAT USER CHANGE?
3. WHAT MUST BE TRUE?
4. DOES THIS WORK CONTRIBUTE?
5. CAN WE REUSE SOMETHING?
6. WHAT IS THE SMALLEST COHERENT DELIVERY?
7. HOW WILL WE VALIDATE IT?
```

If the work cannot answer these, **pause and reassess before implementation**.

### 18. ABIM Operating Model

> Reason backward. Reuse existing solutions. Deliver the smallest coherent useful increment. Build forward. Validate against reality. Treat evidence as superior to assumption. Re-induce when reality disagrees. Repeat.

### 19. Practical Operating Loop (Applied)

```text
Think of a feature
  → Rapid prototyping
  → Realign with closest in industry by feature & tool
  → Redesign UI so it's coherent with the rest & follow the design system
  → Verify (test + typecheck/build + a real-environment check for anything
     that can't be faithfully verified any other way)
  → Commit & push
```

**The step worth naming explicitly: Verify.** `BUILT ≠ VALIDATED` (Section 11) is not satisfied by a feature merely looking finished. When "all automated checks pass" and "I haven't actually checked the real thing" are both true at once, treat that as an open question, not a finished feature.

### 20. Dependency, Cache, and Supply-Chain Hygiene

**Cache invalidation is a Definition-of-Done item, not a one-time fix.** Any client-side cache-first mechanism creates a standing obligation: every future change to the cached content needs its own invalidation step.

**Audit dependencies by actual usage pattern, not by automated severity label alone.**

**Keep a breaking dependency upgrade a separate decision from a routine hardening pass.**

---

## 2. MVD — Minimum Viable Delivery

**Minimum Viable Delivery** is the smallest complete delivery that produces the intended user outcome.

### MVD Requirements

Every MVD should have: essential functionality, easy to complete, cohesive design system, fast load.

### MVD Filter

Every feature must complete this sentence: **"After using this, the user can now see ____."** The blank must describe a concrete insight, relationship, state, or decision-relevant result. If a feature cannot produce a meaningful answer, **defer or remove it**.

### Scope Rule

Build the smallest delivery that proves the core insight. Do not add features merely because they are technically possible, aesthetically appealing, convenient, scalable, interesting, or expected in a conventional product in the same category.

**MVD = minimum functionality required to make the intended outcome real.**

---

# Part II — Growing Minds

## 1. This Project's Outcome Sentence

Following Part I Section 3's test — this project's own instantiation, not Human Kernel's "does this help the user see something" or Noted's trust-and-clarity framing:

> **After using this, the visitor can now place their own background against a real population, as a range, and explain to someone else why a single number would have lied to them.**

Applied to every chart and every piece of copy on the page, not just the profile builder itself — the "why show the whole population, not just you" and "why this is a range, not a single number" `AcademicNote`s exist specifically because they are this outcome sentence's own justification, spelled out for the visitor rather than left implicit.

## 2. MVD Filter, applied to this session's real feature decisions

| Feature considered | "After using this, the user can now see ___" | Verdict |
|---|---|---|
| Build-a-profile + population placement | where their own background sits among 50,000 simulated childhoods, not in the abstract | **BUILD** — this is the core outcome itself |
| Whole-population-visible charts (never an isolated highlighted group) | the shape of everyone else, which is what makes one person's position mean anything | **BUILD** — directly required by the outcome sentence |
| Causal-flow animation, correlation heatmap, Flynn-effect line | how the factors relate to each other and change over time, not just a single ranked list | **BUILD** — each chart form answers a distinct question a single chart type couldn't |
| MBTI relationship mapper / "hypothesis engine" (proposed, not built) | a personality-typed social connector — no concrete statistical insight about the dataset's actual subject | **KILLED** — see Part II §4 below; failed the filter directly, not deferred on a technicality |
| 32-item "Project notes" appendix | the full reasoning behind the product itself — floor/ceiling, strengths/weaknesses, what was overlooked | **BUILD**, but relocated per visual-weight balance rather than inserted inline (`PRODUCT-DECISIONS.md` ADR-006) |
| Full legal disclaimer at the very top of the page | (nothing yet — it's a wall of text before any chart) | **REDUCED** to one short line at top; full version moved to the methodology appendix where it can actually be read in context |

## 3. Resource Arbitrage — `REUSE → COMPOSE → ADAPT → BUILD`

| Concern | Tier landed on | Reused | Newly built | Why this tier |
|---|---|---|---|---|
| Chart rendering | BUILD (deliberately) | SVG primitives, native SMIL | 8 hand-rolled chart components | No charting library gives per-question form control or the animated-flow/color-wash treatment this page needed; explicitly rejected a generic charting library for the same reason `PRODUCT-SPEC.md` §4 states it as a criterion |
| Multiple regression | BUILD (small, scoped) | — | Gauss-Jordan matrix inversion in `build-data.mjs` | A ~40-line, single-purpose solver for one fixed-size normal-equations system; pulling in a full stats/linear-algebra dependency for this one fit would have been disproportionate |
| Design tokens / palette | REUSE | `@atlaskit/tokens`, dataviz skill's `validate_palette.js` | — | Solved problem — CVD-safe categorical palettes are exactly what the token system + validator already do well |
| Icons | REUSE | Lucide | — | Same reasoning as Noted's own icon decision (`S2-Week 3` Part II precedent) |
| Citations | REUSE, verified not assumed | Real published papers (via `doi.org`) | — | Every claim traced to a specific source rather than invented; sci-hub mirror links present in the user's own research notes were deliberately excluded from what got published (`PRODUCT-DECISIONS.md` ADR-007) |
| Animation | BUILD (native platform APIs) | SVG SMIL (`<animateMotion>`, `<animate>`), CSS `@keyframes` | — | Explicitly **not** Remotion — Remotion is a video-rendering framework, wrong tool for a live, interactive, theme-aware page; native SMIL+CSS is the reuse-appropriate choice for continuous in-page animation |

## 4. Re-Induction: the MBTI direction, killed on evidence

Mid-session, a "relationship mapper by MBTI" direction was proposed and partially explored (a hypothesis-engine concept pulling strings from the dataset toward MBTI compatibility). Presented against a second, more grounded direction (humanizing chart labels for a "chart literacy" / medical-data-visualization angle), the Product Owner was asked directly which to pursue, and chose the second — explicitly redirecting away from MBTI ("lets pursue direction 2 from now on. redirect & you may proceed").

Read through the MVD Filter (Part II §2, above): the MBTI direction never produced a coherent answer to "after using this, the user can now see ___" that connected back to the dataset's actual subject (childhood cognitive development factors) — it would have been a second, unrelated product bolted onto this one. This is Re-Induction (Part I Section 12) applied correctly: the direction was **KILLED**, not reduced or deferred, because the failed assumption ("MBTI is the most relevant connector to a public user") was identified and named before any implementation cost was sunk into it.

## 5. Anti-Patterns, checked against this session

| Anti-pattern | Present this session? | Evidence |
|---|---|---|
| Feature accumulation | Avoided | The MBTI direction was killed rather than accumulated alongside the chart-literacy direction; the 32-item appendix is large but is itself the outcome (documenting the product, not adding a new one) |
| Scope drift | Avoided | The core identity (population-placement explainer for one specific dataset) never shifted; the MBTI detour was caught and killed before it could drift the product's identity |
| Premature architecture | Avoided | The multiple-regression scoring engine was built reactively, after the naive-sum approach was caught producing an inaccurate real-world result (`PRODUCT-DECISIONS.md` ADR-001) — not designed speculatively in advance |
| Reinvention | Avoided | No charting library was rejected as reinvention risk — see `PRODUCT-SPEC.md` §4, this is a deliberate criterion, not an oversight; the regression solver is genuinely novel-but-narrow, not a reimplementation of a solved general-purpose library |
| Ceremony without decision value | Self-assessed as justified | This doc set exists because the Product Owner asked for it explicitly, twice reiterated ("my universal content structure... i didnt put this randomly") |
| False completion | Actively resisted | The z-score-extrapolation bug and the naive-sum scoring bug were both caught by treating a suspicious real-world number (154/99th percentile; a 113 self-score against a claimed real IQ of 128–130) as evidence to investigate, not as an edge case to ignore |
| Founder confirmation bias | Avoided | When the Product Owner reported their own IQ didn't match the tool's output, the response was to investigate the *engine*, not to assume the Product Owner's self-report was the error — and the investigation found a real bug (double-counted overlapping variance) |
| Over-documentation | Self-assessed as justified | Same as "ceremony," above — explicitly requested, including a specific reusable template the Product Owner supplied in full (the 32-item content structure) |
| Technology-first development | Avoided | SMIL/CSS animation was chosen for what it does for this specific page (continuous, theme-aware, `prefers-reduced-motion`-respecting), not for novelty — Remotion was explicitly considered and rejected as the wrong tool |
| Interaction-model creep | Not observed | No UI interaction pattern in this product was stretched past the cardinality it was designed for during this session |

## 6. MVD Criteria Crosswalk

See `PRODUCT-SPEC.md` §4 for the full criteria list and `RETROSPECTIVE-ABIM-PROCESS-MAPPING.md` (`docs/retrospective day-1/`) for the crosswalk against what actually shipped.
