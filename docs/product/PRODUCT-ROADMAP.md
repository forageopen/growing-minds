---
doc_id: PRODUCT-ROADMAP
authority: delivery-sequence
retrieval_purpose: >
  Universal delaying-APIs/accounts/cloud sequencing pattern reproduced
  unmodified from the shared cross-project template
  (`S2-Week 3/docs/product/PRODUCT-ROADMAP.md`), plus Growing Minds' own
  roadmap — a short, evidence-driven shape (Phase 0 delivered, Phase 1
  draft) rather than a speculative multi-phase plan, since this product's
  MVD is already close to its natural ceiling as a single static page.
consult_when: [sequencing, phase-gating, "what ships next", onboarding-to-this-repo]
skip_when: task is already scoped to a named phase
depends_on:
  - PRODUCT-SPEC.md
  - PRODUCT-PRINCIPLES.md
source_files:
  - "S2-Week 3/docs/product/PRODUCT-ROADMAP.md (shared template, Part I source)"
  - "Full session transcript and git history, growing-minds repo (github.com/forageopen/growing-minds)"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude), acting under the Product Owner's direction
never_paraphrase: true
integrity: >
  Part I is reproduced verbatim from the shared template. Part II is
  written fresh for Growing Minds and is this file's own current subject.
---

# PRODUCT-ROADMAP.md

## How this file is organized

**Part I is the universal pattern**, shared across every repository under this Product Owner's name — reproduced here unmodified. **Part II is Growing Minds' own roadmap** — the current subject of this file.

---

# Part I — Universal Pattern

## 1. Delaying APIs, Accounts, and Cloud (generic sequencing pattern)

Many projects build authentication, accounts, teams, billing, APIs, and cloud sync before anyone has proven the product itself is wanted. The pattern below delays all of it, in three stages, each building on validated demand rather than anticipated demand:

```text
Phase 1
Single user
Offline
Folder based
```

```text
Phase 2
Small group
Shared folders / LAN
Permissions
```

```text
Phase 3
Cloud
Enterprise
SSO
APIs
```

Each phase builds on validated demand for the *previous* phase, not on a plan made in advance of any evidence.

## 2. What Your Own Project's Roadmap Should Define

- **Architecture Phase** — the sequence of technical platforms/stacks this product will move through, if more than one is ever expected.
- **Product Roadmap Phases** — what capability gets added at each phase, and which phases are committed near-term scope versus suggestive draft subject to re-induction.
- **Delivery Versions** — for any single component/layer complex enough to need its own internal versioning, state it separately from the whole-product phases above.

---

# Part II — Growing Minds

## §1. Architecture Phase

**Single stage, delivered — no further architecture stage is currently planned.**

Static GitHub Pages site (Vite + React + TypeScript), built once from a checked-in CSV via `scripts/build-data.mjs`, deployed via GitHub Actions. There is no cloud/account/collaboration stage in this product's future by default — it has no multi-user surface to grow into (every visitor's profile is theirs alone, computed and discarded client-side), so Part I §1's delaying pattern isn't a sequence Growing Minds needs to climb; it's a ceiling the product intentionally never approaches. If that ever changes (e.g. a "save and share your profile" feature were proposed), that would be exactly the kind of HIGH IMPACT decision `PRODUCT-DECISIONS.md` §5 requires stopping and resolving explicitly before building — not a default extension of this roadmap.

## §2. Product Roadmap

> Phase 0 is delivered, committed scope. Phase 1 is a **suggestive draft**, not a backlog — subject to re-induction per `PRODUCT-PRINCIPLES.md` Part I §12, and none of it is committed until evidence (a real Product Owner request, or a real reported gap) promotes it.

### Phase 0: Delivered (this session, 2026-08-12 → 2026-08-13)

- Data pipeline: validated, aggregated, corrected multiple-regression scoring engine.
- Eight hand-rolled SVG charts, each continuously animated with a `prefers-reduced-motion` fallback.
- Profile builder with honest, range-based population placement.
- Full narrative/citation layer: six sourced `AcademicNote`s, a 14-entry reading list, the 32-item project-structure appendix.
- Rebrand (Baby Boom → Growing Minds), blank-page deploy fix, README brought current.

### Phase 1: Draft — not committed

Sourced from ideas that surfaced during Phase 0 itself (the "Opportunity" entry in the project-structure appendix, item 19: *"the same approach — build a profile, place it on a real distribution, show your position as a range instead of a falsely precise number — could work for almost any outcome, not just IQ"*), not invented fresh for this roadmap:

- **Extend the build-a-profile pattern to a second outcome/dataset.** Would validate whether the pattern (population-always-visible, range not point estimate, sourced reasoning per chart) generalizes past this one dataset, or whether it was IQ-specific in ways not yet visible.
- **A lightweight automated check for the scoring engine's arithmetic** (e.g. a script asserting `computeScore()` against known inputs), given the two real scoring bugs this session (`PRODUCT-DECISIONS.md` ADR-001, ADR-002) were both caught by a human noticing an implausible number, not by any automated check — there currently is none.
- **Localized/translated copy**, if evidence of a non-English-speaking audience ever emerges. Not attempted this session; noted only because the plain-language voice rewrite makes this more tractable than it would have been against the original denser academic phrasing.

None of the above is scoped, designed, or scheduled — this section exists so a future session starts from "here's what was already floated" instead of a blank page, per `PRODUCT-PRINCIPLES.md` Part I §15's Agent Protocol ("read project index... before acting").

## §3. Delivery Versions

Not applicable — no single component in this product is complex enough to warrant its own internal version sequence distinct from the whole-product phases above. The profile scoring engine's own correction (naive-sum → multiple-regression) is recorded as `PRODUCT-DECISIONS.md` ADR-001, not as a "v1/v2" of the engine, since there was never a plan to ship the naive version as anything other than what it turned out to be: a bug.
