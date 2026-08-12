---
doc_id: PRODUCT-SPEC
authority: product-definition
retrieval_purpose: >
  What Growing Minds is and how it's built. Part I is the universal
  Repository Architecture SOP and concrete-spec checklist, reproduced
  unmodified from the shared cross-project template
  (`S2-Week 3/docs/product/PRODUCT-SPEC.md`) per that template's own
  never-paraphrase discipline. Part II is Growing Minds' own filled-in
  spec — product identity, architecture, MVD instance, criteria, category,
  scaffolding, architecture summary.
consult_when: [implementation, architecture, data-model, ui, feature-scope,
  onboarding-to-this-repo, auditing-this-repo]
skip_when: task does not touch product boundaries or technical shape
depends_on:
  - PRODUCT-PRINCIPLES.md   # MVD / ABIM model definitions referenced below
related:
  - PRODUCT-ROADMAP.md      # phased delivery of this project's own scaffolding
  - PRODUCT-DECISIONS.md    # sections 3-11 of the Repo Standard SOP; this repo's own ADR log
source_files:
  - "S2-Week 3/docs/product/PRODUCT-SPEC.md (shared template, Part I source)"
  - "Full session transcript and git history, growing-minds repo (github.com/forageopen/growing-minds)"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude), acting under the Product Owner's direction
never_paraphrase: true
integrity: >
  Part I is reproduced verbatim from the shared template. Part II is
  written fresh for Growing Minds and is this file's own current subject.
---

# PRODUCT-SPEC.md

## How this file is organized

**Part I is the universal template**, shared across every repository under this Product Owner's name. **Part II is Growing Minds' own concrete spec** — the actual current subject of this file.

---

# Part I — Universal Template

## 1. Repository Architecture

REPOSITORY STANDARD
Cross-Functional Product Development SOP

**Model:** Agile, iterative, incremental
**Scope:** All serious product and software repositories
**Priority:** Repository integrity, traceability, controlled change

> Sections 3–11 of this SOP (Source of Truth, Development Model, Decision
> Boundary, Assumption Control, Architectural Decisions, Change Management,
> Definition of Done, Modification Rules, Traceability Requirement) are
> recorded in `PRODUCT-DECISIONS.md`.

### 1.1 Directory Layout

```
project/
├── .github/
│   └── workflows/
│
├── docs/
│   ├── product/
│   │   ├── PRODUCT-SPEC.md
│   │   ├── PRODUCT-PRINCIPLES.md
│   │   ├── PRODUCT-ROADMAP.md
│   │   └── PRODUCT-DECISIONS.md
│   │
│   ├── ux/
│   ├── ui/
│   ├── technical/
│   ├── qa/
│   └── decisions/
│       └── ADR/
│
├── src/
│   └── frontend/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── scripts/
│
├── README.md
├── LICENSE
└── package.json
```

### 1.2 Applicability

- Omit components that are not applicable.
- Do not create empty directories.
- Do not introduce alternative locations for the same concern.
- Preserve established project conventions unless they conflict with this standard.

> **Applied to this repo:** `docs/ux/`, `docs/ui/`, `docs/technical/`, `docs/qa/`, and `docs/decisions/ADR/` are all omitted below — Growing Minds is a single-surface static site with no separate UX-research phase, no component library doc distinct from the code itself, and no ADR volume that outgrew the log kept directly in `PRODUCT-DECISIONS.md` Part II. This mirrors the precedent already set by Noted (`github.com/forageopen/Noted`) doing the same for the same reason.

## 2. What Your Own Project's Concrete Spec Should Define

- **Product Identity** — what this is, in one word or one sentence, its category, its data source. *(Part II, §1)*
- **Architecture** — the high-level data/control flow, as a diagram simple enough to redraw from memory. *(Part II, §2)*
- **MVD instance** — Part I's MVD model (`PRODUCT-PRINCIPLES.md` Section 2) applied concretely. *(Part II, §3)*
- **Criteria** — a directional checklist, not a 100%-mandatory gate. *(Part II, §4)*
- **Platform Constraints** — see Section 3 below; reusable as-is.
- **Category / positioning** — how this product relates to adjacent tools. *(Part II, §6)*
- **Scaffolding / architecture layers** — the concrete technical layers this product's MVD needs. *(Part II, §7)*
- **Architecture summary** — the actual stack: hosting, storage, backend-or-none, and why. *(Part II, §8)*

## 3. Platform Constraints (generic — reusable as-is for any serverless/browser-only project)

Without any API or backend, a browser-native application cannot:

- Send emails automatically.
- Process payments.
- Store data shared between users.
- Log users in with accounts.
- Hide secret keys.
- Run AI models hosted in the cloud.
- Download private information from other websites.

Those require a server somewhere. This list is genuinely product-agnostic — it follows from "no backend," not from any specific product's domain.

---

# Part II — Growing Minds

## §1. Product Identity

**What this is, in one sentence:** an interactive, public data-education page that lets a visitor build a rough profile of their own childhood background, see where it places them on a real 50,000-child population as an honest range rather than a single number, and read plain-language explanations — each grounded in a cited source — of why every chart is built the way it is.

**In one word:** *Explainer* — not a dashboard, not a quiz, not an assessment tool.

**Category:** static, single-page web app; runs entirely in the visitor's browser with no backend server.

**Data source:** *Child IQ: Genes & Environment* (Kaggle, sergionefedov, CC0) — a 50,000-row synthetic dataset whose generator is calibrated to published developmental-research effect sizes (parental-IQ correlation, twin/adoption heritability estimates, iodine-deficiency and lead-exposure ranges, the Flynn effect), not drawn from real children.

## §2. Architecture

```
data/raw/child_iq_master.csv   (50,000 rows — source of truth)
            │
            ▼
scripts/build-data.mjs
  - validate (no nulls, no duplicate ids, no malformed rows)
  - aggregate (overview, distributions, by_category, by_binary,
    correlations, correlation_matrix, scatter_sample, flynn_effect)
  - fit a standardized multiple regression (Gauss-Jordan matrix
    inversion) → profile_regression.json, the profile builder's
    scoring coefficients
            │
            ▼
src/frontend/public/data/*.json     (precomputed, < 250 KB combined)
            │
            ▼
React + TypeScript SPA (Vite)
  - useJson() hooks fetch the precomputed JSON at runtime — the
    50k-row CSV is never parsed in the browser
  - hand-rolled inline SVG chart components (no charting library)
  - src/lib/profile.ts: the profile scoring engine, runs entirely
    client-side — a visitor's answers never leave their browser
            │
            ▼
.github/workflows/deploy.yml
  → re-runs build-data.mjs against the checked-in CSV → npm run build
    → GitHub Pages
```

The one-line version: **the browser never touches raw data, and the visitor's own input never leaves the browser** — both directions of "optimize for parsing" are load-bearing for this specific product (a public trust page about a sensitive-feeling topic cannot afford to look, even briefly, like it's phoning anything home).

## §3. Minimum Viable Delivery (this project's instance)

> Model definition and filter: see `PRODUCT-PRINCIPLES.md` Part I, Section 2 — MVD.

At minimum, this page must establish:

```
Population distribution
  (the full 50,000-child dataset, always shown — never a group in isolation)
    ↓
A visitor's own partial profile
  (built from whichever fields they choose to answer; skipped fields
  default to the population average)
    ↓
Placement of that profile on the distribution
  (shown as a range with an explicit uncertainty band, never a bare
  single number presented as precise)
    ↓
A plain-language, sourced reason for every chart
  (why this form, why this comparison, what it leaves out)
```

No prediction of a specific real child. No parental-IQ estimate collected from a visitor (the two strongest predictors in the dataset are deliberately never asked for — see `PRODUCT-DECISIONS.md` ADR-003). No account, no login, no storage of anything typed into the page.

## §4. Criteria

> **Checklist, not a compliance gate** (per `PRODUCT-DECISIONS.md`'s Decision Boundary — Section 5, LOW/MATERIAL impact): this is a directional target, not a 100%-mandatory set.

- Browser-native, zero backend, fully static — GitHub Pages only.
- No account, no login, no cloud dependency for anything a visitor enters — the profile builder computes and discards entirely client-side.
- Raw CSV never parsed in the browser — all aggregation happens once, at build time (`scripts/build-data.mjs`).
- No charting library — every chart is a hand-rolled, form-matched inline SVG component (dataviz skill discipline: pick the form the question needs, not a generic bar/pie default).
- Every claim in the page's long-form copy traces to either the dataset itself or a specific, real, cited academic source, linked via `doi.org` — never a fabricated citation, never a sci-hub link published to the public repo.
- `prefers-reduced-motion` respected throughout — every SMIL/CSS animation has a static fallback.
- MIT licensed, single repository, one-click GitHub Pages deploy via GitHub Actions.
- Dataset's synthetic nature disclosed explicitly and accurately — calibrated to real research, but not drawn from real children; race/ethnicity deliberately excluded as a predictor, disclosed as a deliberate choice, not an oversight.
- Vite `base` path kept in sync with the actual GitHub Pages project path — this one broke once this session (see `RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`) and is worth stating as an explicit criterion precisely because it's easy to forget after a repo rename.

## §5. Platform Constraints

See Part I, Section 3 above — Growing Minds uses the generic constraint set unmodified; nothing in this product needs email, payments, cross-user storage, accounts, secret keys, cloud-hosted AI, or reading another site's private data.

## §6. Category — Public Data-Education Explainer

Not a BI/analytics dashboard (Tableau/PowerBI-class), and not framed as one — despite being built from a real tabular dataset with real correlation/regression machinery underneath. Closer in spirit to a data-journalism "scrollytelling" explainer (the *NYT* Upshot, The Pudding) than to a technical dashboard: the audience is a general public visitor, not an analyst, and the product's job is to teach chart literacy and statistical humility (ranges over point estimates, whole-population context over an isolated highlighted group) through one concrete, personally-relevant example rather than to expose a general-purpose query surface.

**Positioning relative to the source dataset:** complementary, not competing. The Kaggle dataset page itself has no visualization layer; Growing Minds is a public-facing front end for it, adding the profile-builder, the narrative structure, and the citation layer the raw CSV doesn't have on its own.

## §7. Scaffolding

- **Layer 1 — Data pipeline** (`scripts/build-data.mjs`): validation, aggregation, and the standardized multiple-regression fit that powers the profile scoring engine.
- **Layer 2 — Chart layer** (`src/frontend/src/charts/`): eight hand-rolled SVG chart components, each chosen for the specific question it answers (line+band for a trend, diverging lollipop for ranking, matrix for pairwise overlap, KDE for shape, dot plot for group-vs-average, dumbbell for effect size, scatter+margins for a two-variable relationship).
- **Layer 3 — Profile / scoring engine** (`src/frontend/src/lib/profile.ts`): the client-side composite index — categorical/binary group-mean deviations plus regression-corrected, z-clamped numeric contributions.
- **Layer 4 — Narrative / content layer** (`AcademicNote`, `ReadingList`, `ProjectStructure`, `DisclaimerCallout`, `Primer`): the plain-language, sourced explanatory copy that surrounds every chart, plus the full 32-item project-structure appendix.

The first version did not need, and still does not have: accounts, a backend, AI/ML inference beyond the build-time regression fit, or any form of analytics/tracking.

## §8. Architecture Summary

- JAMstack — Vite + React + TypeScript.
- Hosting: GitHub Pages, via GitHub Actions (`deploy.yml`).
- Backend: none.
- Infrastructure: fully serverless.
- Local storage: none at runtime — precomputed static JSON files only; nothing a visitor enters is persisted anywhere, in-browser or otherwise.
- AI/ML: one build-time statistical fit (multiple regression via Gauss-Jordan matrix inversion); no runtime inference, no LLM calls, no cloud AI.
- Browser support: modern evergreen browsers (native SVG `<animateMotion>`/SMIL, CSS custom properties, `prefers-reduced-motion`).
- Design system: Atlassian Design System tokens (`@atlaskit/tokens`) for surfaces/ink/the categorical chart palette, validated for CVD-safe adjacency via the dataviz skill's palette validator. Icons: Lucide.
- Product focus: public data-education artifact, not an internal tool or a commercial product.
