---
doc_id: RETROSPECTIVE-ARCHITECTURE-DECISIONS
authority: engineering-retrospective
retrieval_purpose: >
  Why the Growing Minds codebase is shaped the way it is — the build-once
  data pipeline, the no-charting-library chart layer, the SMIL/CSS
  animation choice over Remotion, the hand-rolled regression solver, and
  the design-token/type-scale system. Read this before extending the
  architecture or onboarding to `src/`.
consult_when: [extending-the-architecture, onboarding-to-src, adding-a-new-chart, adding-a-new-dependency]
skip_when: task is a content-only change with no structural implication
depends_on:
  - RETROSPECTIVE-INDEX.md
source_files:
  - "scripts/build-data.mjs, src/frontend/src/lib/profile.ts, src/frontend/src/charts/*, src/frontend/src/styles/*, vite.config.ts"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude)
---

# Retrospective: Architecture Decisions

## 1. Build-once data pipeline — the browser never parses the raw CSV

`data/raw/child_iq_master.csv` (50,000 rows × 30 columns, ~6MB) is read exactly once, by `scripts/build-data.mjs`, at build time — never in the visitor's browser. The script validates it (no nulls, no duplicate ids, no malformed rows), aggregates it into the specific shapes each chart actually needs (`overview`, `distributions`, `by_category`, `by_binary`, `correlations`, `correlation_matrix`, `scatter_sample`, `flynn_effect`, `dictionary`, `profile_regression`), and writes small JSON files to `src/frontend/public/data/` — the full combined payload is well under 250KB. The React app fetches those precomputed files at runtime via `useJson()` hooks; it never sees the raw rows.

**Why this shape, not client-side aggregation:** a 50,000-row CSV parsed and aggregated in-browser on every page load is both slower (real, felt latency on a public page with no reason to tolerate it) and pointless — none of the aggregates need to be recomputed per-visitor, since no visitor input changes the population data itself. The one place visitor input *does* change something (the profile score) is computed from the small precomputed `variableStats`/`regression` payload, not from the raw rows either.

**Consequence this paid for concretely:** the regression fit for the profile scoring engine (see §3 below) only had to be solved *once*, at build time, against the full 50,000-row dataset — computing it per-visitor in the browser would have meant either shipping the full CSV to the client (defeating the entire point of this pipeline) or re-deriving summary statistics client-side from a smaller sample, which would have made the scoring engine's output non-reproducible between visits.

## 2. No charting library — every chart is a hand-rolled inline SVG component

Eight chart components (`src/frontend/src/charts/`) are hand-drawn SVG, not composed from a library like Recharts, Chart.js, or D3's higher-level chart wrappers. Each chart's *form* was chosen for the specific question it answers, following the dataviz skill's "pick the form, then the color" discipline: a line+band for the Flynn-effect trend, a diverging lollipop for predictor ranking, a correlation matrix for pairwise overlap, a smoothed density curve for a distribution's shape, a Cleveland dot plot for group-vs-population-mean comparison, a dumbbell chart for risk-factor effect size, and a scatter-with-marginals for the two-variable relationship. None of these is a generic bar/pie/donut default.

**Why not a library:** a general-purpose charting library optimizes for covering many chart types adequately, not for this page's specific animation requirements (continuous SMIL motion, a non-destructive color-wash overlay on the heatmap, a glowing particle flow on the causal diagram) or its specific palette-validation requirement (the dataviz skill's CVD-safety check against the Atlassian token ramps). Getting those exactly right through a library's theming API would likely have cost more engineering time than hand-rolling SVG that does exactly what this page needs and nothing else.

**Consequence:** every chart's hover/tooltip/animation behavior is bespoke code, which is more code than a library call — but it's also the reason the CSS overflow-axis bug (`RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`) was fixable by editing one CSS rule instead of fighting a library's own DOM structure.

## 3. Client-side, build-time-fit multiple regression instead of a stats dependency

The profile scoring engine's numeric-field coefficients are standardized multiple-regression betas, solved via Gauss-Jordan matrix inversion over the predictor correlation matrix — a self-contained `invertMatrix()` function inside `scripts/build-data.mjs`, roughly 40 lines, with no external linear-algebra or statistics dependency.

**Why hand-rolled instead of a library (e.g. a JS stats package):** the system being solved is small and fixed-size (one normal-equations system per build, over ~8 numeric predictor variables) and single-purpose. Pulling in a general-purpose statistics/linear-algebra dependency for one fixed calculation, run once at build time and never at runtime, would have added a dependency with a much larger surface than the problem needed — the kind of call the dataviz/architecture discipline in this project explicitly weighs against (see `PRODUCT-PRINCIPLES.md` Part I §7, Resource Arbitrage: "do not rebuild solved infrastructure without a reason" cuts both ways — it also means don't import solved infrastructure sized for a much bigger problem than the one you have).

**Consequence this decision exists because of:** this is the exact component that had a real, user-facing bug this session (`PRODUCT-DECISIONS.md` ADR-001 — the naive-sum predecessor). The fix replaced a wrong five-line summation with a correct forty-line solver, not with a dependency; the small, inspectable, single-purpose nature of the solver is *why* it was fast to audit and fix once the bug was found.

## 4. SVG SMIL + CSS animation, explicitly not Remotion

Every chart's continuous animation (the causal-flow particle motion and node glow, the heatmap color wash, the Flynn-effect line draw-on) is implemented with native SVG SMIL (`<animateMotion>`, `<animate>` with explicit `keyTimes`) and CSS `@keyframes`, gated by a `useReducedMotion()` hook that respects `prefers-reduced-motion`.

**Why not Remotion:** Remotion is a React framework for *rendering video* — it composes React components into frame sequences for export, which is the wrong shape entirely for a live, interactive, theme-aware web page that needs to keep animating indefinitely in a visitor's actual browser, respond to their OS-level motion preference in real time, and cost nothing extra to host (no video file, no video player). Native SMIL/CSS animation runs natively in the SVG/DOM the page already has, for free, and turns off cleanly for `prefers-reduced-motion` visitors without needing a separate static-image fallback asset.

**Consequence:** the heatmap bug (`RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`) was fixable by restructuring which DOM element the animation targets — a lesson that only transfers cleanly because the animation lives in the same DOM the data does, which a pre-rendered video approach would not have permitted at all.

## 5. Design tokens and palette validation, not ad hoc color/spacing

Surfaces, ink, and the 8-hue categorical chart palette are sourced from `@atlaskit/tokens`, with the categorical palette re-validated (twice — once for the original 8-hue theme, once after the Product Owner directed a specific "Deep Plum / Warm Bone / Muted Sage" palette instead) via the dataviz skill's `validate_palette.js`, which checks CVD-adjacent-pair separation, the normal-vision floor, and contrast against both light and dark chart surfaces. Font sizes converge on 9 named scale tokens (`--text-2xs` through `--text-2xl`, plus `--text-number-lg`) after the site-wide inconsistency fix (`RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`).

**Why this shape:** a palette's colorblind-safety is a computable property, not a matter of taste — running the validator is strictly cheaper and more reliable than eyeballing ΔE distances, and it's the same reason the dataviz skill states it as a non-negotiable ("never eyeball whether a palette is colorblind-safe — run the script"). The type-scale token set exists specifically *because* the ad hoc alternative (each component picking its own font-size) had already drifted into ~20 near-duplicate values by the time it was caught — the fix and the reason for the fix are the same architectural lesson.

## 6. The profile scoring engine runs entirely client-side, and nothing it computes is ever sent anywhere

`src/frontend/src/lib/profile.ts`'s `computeScore()` runs in the visitor's own browser, against the small precomputed `variableStats`/`regression` JSON already shipped with the page. Nothing a visitor types into the profile builder is transmitted to any server, logged, or persisted — there is no backend to send it to in the first place (`PRODUCT-SPEC.md` §8: backend is "none," not "minimal").

**Why this matters architecturally, not just as a privacy footnote:** this is a page that asks a visitor for real, sometimes personal background information (income bracket, adverse childhood experiences) on a page whose central theme is "your data is being compared to a population." Any architecture where that computation happened server-side — even transiently, even without persistence — would have undercut the disclaimer copy's own claim that nothing typed into the page leaves the browser. The client-side-only architecture isn't a constraint the product works around; it's a requirement the disclaimer copy is only honest *because* the architecture enforces it structurally, not by policy.
