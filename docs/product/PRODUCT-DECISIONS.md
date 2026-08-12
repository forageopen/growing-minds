---
doc_id: PRODUCT-DECISIONS
authority: governance-process
retrieval_purpose: >
  Governance process (Repo Standard SOP, Sections 3-11) reproduced
  unmodified from the shared cross-project template
  (`S2-Week 3/docs/product/PRODUCT-DECISIONS.md`), plus Growing Minds' own
  ADR log — the real material decisions made across this project's single
  build session, in the order they happened.
consult_when: [classifying-a-decision, recording-an-assumption, opening-an-adr,
  before-repository-modification, starting-a-new-feature, auditing-this-repo]
skip_when: never — low-impact decisions still default to established convention per Section 4 below
depends_on: []
related:
  - PRODUCT-SPEC.md Section 1
  - PRODUCT-PRINCIPLES.md Part I, Section 20
source_files:
  - "S2-Week 3/docs/product/PRODUCT-DECISIONS.md (shared template, Part I source)"
  - "Full session transcript and git history, growing-minds repo (github.com/forageopen/growing-minds)"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude), acting under the Product Owner's direction
never_paraphrase: true
integrity: >
  Part I is reproduced verbatim from the shared template. Part II (this
  project's own ADR log) is this file's own current subject.
---

# PRODUCT-DECISIONS.md

## How this file is organized

**Part I is the universal process**, shared across every repository under this Product Owner's name — reproduced here unmodified. **Part II is Growing Minds' own decision log** — the current subject of this file.

---

# Part I — Universal Process

## 1. Project Governance — Roles

##### How a solo, AI-orchestrated project gets managed

- Product manager: AI agent
- UX designer: performed by the designer as first-hand user — iteration happens until every feature is stress-tested and noted.
- UI designer: **UI** = what's exposed (visually) — iteration happens until look & feel is coherent.
- Frontend developer: performed by an AI coding agent (e.g. Claude) as the primary co-worker.
- Backend developer: not applicable to this project — no backend.
- QA tester: AI agent.
- Technical writer: AI agent.

The human directs the product, makes design decisions, validates outputs, and refines the experience.

## 2. Repo Standard SOP — Sections 3–11

REPOSITORY STANDARD — Cross-Functional Product Development SOP

**Model:** Agile, iterative, incremental
**Scope:** All serious product and software repositories
**Priority:** Repository integrity, traceability, controlled change

> Section 1 (REPOSITORY ARCHITECTURE) of this SOP is recorded in `PRODUCT-SPEC.md` Part I, Section 1.

---

## 3. SOURCE OF TRUTH

|Concern|Authoritative location|
|---|---|
|Product intent| `docs/product/PRODUCT-PRINCIPLES.md` |
|Requirements| `docs/product/PRODUCT-SPEC.md` |
|Roadmap| `docs/product/PRODUCT-ROADMAP.md` |
|Architectural decisions| Section 12 below (this project's own ADR log) |
|Implementation| `src/` |
|Data structure| `data/raw/data_dictionary.csv`, `data/processed/` |

Rules: one authoritative source per concern; do not duplicate specifications; references may point to the authoritative source; resolve conflicts before implementation; repository artifacts supersede undocumented conversational context.

---

## 4. DEVELOPMENT MODEL

Use iterative development: `Requirement → Design → Implement → Test → Review → Learn → Reprioritize → Next increment`. Requirements may change when new evidence appears. Material changes must update the affected source of truth. Do not silently change requirements.

---

## 5. DECISION BOUNDARY

Classify unresolved information before proceeding.

**LOW IMPACT** (naming, minor spacing, local implementation details, reversible cosmetic choices) → proceed using established conventions.

**MATERIAL** (feature behavior, user flow, information architecture, acceptance criteria, externally observable behavior) → record assumption or resolve before implementation when the ambiguity materially affects the result.

**HIGH IMPACT** (architecture, data model, security, privacy, deployment, compatibility, irreversible technical decisions) → STOP. Resolve and record the decision before proceeding.

---

## 6. ASSUMPTION CONTROL

```
UNKNOWN:
IMPACT:
ASSUMPTION:
STATUS:
```

An assumption must not silently become a requirement. If the assumption becomes material, convert it into an explicit decision.

---

## 7. ARCHITECTURAL DECISIONS

```
# ADR-NNN: Title

Status:
Context:
Decision:
Consequences:
```

Do not create ADRs for trivial implementation choices.

---

## 8. CHANGE MANAGEMENT

For every material change: identify affected source(s) of truth; assess impact; update requirement/specification if necessary; implement the smallest coherent change; test; update affected documentation.

---

## 9. DEFINITION OF DONE

`Requirement → Acceptance criteria → Design → Implementation → Verification → Documentation → Release`. Include, when applicable: a real-environment check for anything a synthetic check can't faithfully model, and an explicit cache-invalidation step for anything touching a client-side cache-first mechanism.

---

## 10. MODIFICATION RULES

Before modifying: read relevant requirements; inspect relevant ADRs; inspect affected implementation; identify conflicts and dependencies; determine decision boundaries; implement; verify; update affected records. Do not assume missing information is permission to invent requirements. Do not block development for low-impact ambiguity.

---

## 11. TRACEABILITY REQUIREMENT

`Product intent → Requirement → Design → Technical decision → Implementation → QA verification → Release → Change record`. Break the chain only where a stage is genuinely not applicable.

---

# Part II — Growing Minds ADR Log

Nine decisions, in the order they arose across this project's single continuous build session (2026-08-12 20:04 – 2026-08-13 00:17, per `git log`). See `docs/retrospective day-1/` for the full narrative behind each.

## ADR-001: Composite score corrected from naive sum-of-correlations to standardized multiple regression

**Status:** Accepted
**Impact class:** HIGH — data model / statistical validity of the product's central feature.
**Context:** The profile builder's index summed each numeric field's own marginal correlation with `child_iq` independently. Several fields (maternal education, home stimulation, nutrition quality) all partly track the same underlying socioeconomic status, so their raw correlations overlap. The Product Owner reported a real-world discrepancy — the tool scored their profile at 113 (85th percentile) against a claimed real IQ of 128–130 — which was the evidence that surfaced the bug, not a code-review finding.
**Decision:** Replaced the naive sum with standardized multiple-regression coefficients, solved once at build time (`scripts/build-data.mjs`, Gauss-Jordan matrix inversion over the predictor correlation matrix), so overlap between correlated predictors is counted once, not once per field.
**Consequences:** Measured multiple-R² = 0.220 vs. naive sum-of-r² = 0.304 — the naive approach had overstated the combined explanatory power by roughly 38%. Every profile score computed by the tool changed as a result. This is disclosed directly on the page itself (the "Why variable selection matters" case study), not just fixed silently.

## ADR-002: Numeric slider ranges widened past dataset norms, z-score clamped to ±4 SD before scoring

**Status:** Accepted
**Impact class:** MATERIAL — user flow / scoring accuracy.
**Context:** The Product Owner's own history (48 months breastfeeding) fell outside the dataset's typical range (mean ~6 months). Widening slider maxima (`breastfed_months` to 60, `books_in_home` to 500, etc.) to fit real answers, without bounding the resulting input to the regression model, produced a statistically absurd extrapolation — a raw z-score of ~12.9 SD for breastfeeding at its new max, driving the case-study "ceiling" figure to 154 (99th percentile).
**Decision:** Clamp each field's standardized z-score to `[-4, 4]` inside `computeScore()` (`src/frontend/src/lib/profile.ts`) before multiplying by its regression beta — the slider stays wide enough for an honest answer, but the linear model never extrapolates past a few SD, where the "effect per SD" it was fit on stops meaning anything.
**Consequences:** The case-study ceiling dropped from 154/99th to 145/99th — still high (expected, since it represents every field simultaneously maxed), but no longer built on a nonsense per-field extrapolation. Documented directly in a code comment at the clamp site, not only here.

## ADR-003: Parental IQ deliberately never collected from the visitor

**Status:** Accepted (pre-existing design constraint, formalized this session)
**Impact class:** HIGH — privacy / ethical scope boundary.
**Context:** `mother_iq` and `father_iq` are the two strongest predictors in the entire dataset — stronger than every environmental factor combined. Asking a public, anonymous visitor to estimate a parent's IQ is not something this product should do.
**Decision:** The profile builder's field set (`CATEGORICAL_FIELDS`, `BINARY_FIELDS`, `NUMERIC_FIELDS` in `profile.ts`) permanently excludes parental IQ. This is disclosed on the page itself as a named trade-off (the "Choosing not to collect a variable at all" case study), including its direct, measurable cost — the profile index's ceiling is a hard ~top-2% limit as a result, computed live rather than asserted.
**Consequences:** The index will never approach the extremes a real psychometric estimate could reach. This is treated as the correct trade-off, not a limitation to work around.

## ADR-004: Vite `base` path pinned to the live GitHub Pages project path

**Status:** Accepted
**Impact class:** HIGH — deployment / compatibility.
**Context:** The GitHub repository was renamed `Baby-Boom` → `growing-minds` mid-session. `vite.config.ts`'s `base` remained hardcoded to `/Baby-Boom/`, so every built asset path 404'd and the live site rendered a blank white page.
**Decision:** Updated `base` to `/growing-minds/` and the git remote URL to match, in the same commit as the rest of the rebrand.
**Consequences:** Live site restored. Recorded as a standing criterion in `PRODUCT-SPEC.md` §4 — this exact class of break (repo rename without a matching `base` update) is easy to reintroduce and worth checking explicitly on any future rename.

## ADR-005: Heatmap animation redesigned from destructive mosaic-tile to non-destructive color wash

**Status:** Accepted
**Impact class:** MATERIAL — user-facing data integrity of a chart.
**Context:** The first animated treatment of the correlation heatmap faded cells to full transparency for most of the loop cycle, so the chart's actual data was invisible for a large fraction of the time a visitor would look at it. Reported directly: *"why the cells make the heatmap disappear? that's compromising."*
**Decision:** Replaced the mosaic-tile fade with a `heatmap-wave` color-wash keyframe applied to a separate overlay `<rect>` layered on top of a base cell that stays fully opaque at all times — the animation adds motion without ever hiding the underlying value.
**Consequences:** General principle applied afterward to every other chart animation on the page: motion is decorative, data visibility is not negotiable.

## ADR-006: Full legal disclaimer relocated from top-of-page to the methodology appendix

**Status:** Accepted
**Impact class:** MATERIAL — information architecture / user flow.
**Context:** The page originally front-loaded a full two-paragraph legal disclaimer before any chart appeared, working against the page's own stated first-act promise. Cross-referenced against the Product Owner's own 32-item content structure, a disclaimer is a late-stage item (near Sensitivity/Weaknesses), not an opening one.
**Decision:** Trimmed the top of the page to one short disclaimer line; moved the full two-paragraph version down to sit beside "Source & methodology" in the appendix, where a visitor who wants the full legal detail can find it in context.
**Consequences:** Page now opens hero → one-line disclaimer → primer → first chart, instead of hero → wall of text → first chart. The full 32-item "Project notes" section and "Further reading" citation list were added in the same pass, calculated for visual weight (chart-to-paragraph ratio) rather than inserted at an arbitrary position.

## ADR-007: Personal research-reference notes excluded from the public repository

**Status:** Accepted
**Impact class:** HIGH — what gets published to a public repo.
**Context:** Two research-reference documents supplied by the Product Owner and used to ground the page's `AcademicNote` citations contain sci-hub mirror links alongside their real citation metadata.
**Decision:** Added `data/raw/*.md` to `.gitignore`; only the extracted citation metadata (author, year, title, venue, DOI) is used in-app, linked exclusively via `doi.org`. Never linked to sci-hub in any published artifact.
**Consequences:** The two source files remain locally available for reference but are not committed. Documented in the README's "Sources & citations" section so the exclusion is visible to anyone reading the repo, not just to this conversation.

## ADR-008: Rebrand from "Baby Boom" to "Growing Minds"

**Status:** Accepted
**Impact class:** MATERIAL — product identity, naming, URLs.
**Context:** Product Owner-directed rename, covering the GitHub repository, page title/hero copy, README, `package.json` name, and the theme-preference `localStorage` key.
**Decision:** Full rename swept across `index.html`, `package.json`, `ThemeToggle.tsx`, `README.md`, and the git remote — see ADR-004 for the deployment fallout this specifically caused and its fix.
**Consequences:** Live URL is now `https://forageopen.github.io/growing-minds/`; no residual "Baby Boom" references left in shipped code or copy.

## ADR-009: Local-dev-run instructions removed from the public README

**Status:** Accepted
**Impact class:** LOW-MATERIAL — public documentation content.
**Context:** Product Owner requested removal of the `cd src/frontend && npm install && npm run dev` block, calling it sensitive information not appropriate for a public repository.
**Decision:** Removed the "Run locally" section from `README.md` without further question — a Product Owner's own judgment about what's appropriate to publish about their own project is respected directly, not second-guessed.
**Consequences:** README now documents what the project is and how it's built, not how to run it locally.
