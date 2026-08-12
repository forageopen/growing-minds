---
doc_id: RETROSPECTIVE-FEATURE-DELIVERY
authority: engineering-retrospective
retrieval_purpose: >
  Case studies of the harder features built for Growing Minds — how they
  were actually built, not just what they do. Read this when building
  something structurally similar (a new scored composite index, a new
  continuous chart animation, a new long-form sourced content section).
consult_when: [building-a-similar-feature, estimating-a-similar-feature]
skip_when: task is unrelated to scoring, animation, or long-form sourced content
depends_on:
  - RETROSPECTIVE-INDEX.md
source_files:
  - "src/frontend/src/lib/profile.ts, scripts/build-data.mjs, src/frontend/src/charts/CausalFlowChart.tsx, src/frontend/src/charts/CorrelationHeatmap.tsx, src/frontend/src/components/ProjectStructure.tsx, src/frontend/src/components/ReadingList.tsx, src/frontend/src/components/AcademicNote.tsx"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude)
---

# Retrospective: Feature Delivery Case Studies

## The profile builder and scoring engine

**What was asked:** let a visitor build a rough profile of their own childhood background and see where it places them on the 50,000-child population — with sliders humanized enough to fit real answers outside the dataset's typical range, not clipped at whatever the dataset's own min/max happened to be.

**How it actually got built, in the order it happened:**

1. First version: a simple composite index summing each selected field's own group-mean deviation (categorical/binary) or marginal correlation-weighted contribution (numeric) from the population mean.
2. The Product Owner supplied a real, falsifiable data point — their own claimed IQ (128–130) against the tool's own output for their real background (113, 85th percentile) — and asked for the *engine*, not the dataset, to be fixed. That distinction mattered: the request was specifically to reverse-engineer against the Product Owner's own real background data (via a separate personal folder, explicitly excluding an unrelated employment-readiness subfolder) to find what was actually wrong with the calculation, not to adjust the underlying dataset.
3. Diagnosis: the naive sum double-counted overlapping variance between correlated predictors (maternal education, home stimulation, nutrition all partly reflecting SES). Fixed by solving a proper multiple regression once at build time (`PRODUCT-DECISIONS.md` ADR-001).
4. Separately, the Product Owner's own real history (48 months breastfeeding) exceeded the slider's original range, prompting the sliders to be widened past the dataset's typical bounds — including `breastfed_months` (max 60), `books_in_home` (max 500), `maternal_education_years` (max 24), `maternal_age_at_birth` (max 50), `screen_hours_daily` (max 12), each marked `openEnded: true` with a "+"-suffix display so the UI is honest that the true value could exceed the slider's own ceiling.
5. That widening, done without a matching guard on the regression math, produced the z-score extrapolation bug (`PRODUCT-DECISIONS.md` ADR-002) — caught before it shipped, by checking the live-computed ceiling number against intuition rather than assuming a passing build meant a correct result.
6. Final architecture: `buildIdealProfile()` computes a live, honest "ceiling" figure (every field at its best value) rather than asserting one in prose — used directly in the "Why variable selection matters" case-study section as a real, reproducible number, not a written claim.

**What made this harder than it looked:** the naive approach and the widened-slider approach were each individually reasonable-looking decisions that only became bugs in combination with something else — the naive sum was fine until predictors correlated with each other; the wide sliders were fine until their z-scores fed an unbounded linear extrapolation. Neither bug was visible from reading either piece of code in isolation; both needed a real, concrete number (a person's real IQ; an implausible 154 ceiling) to surface.

## The animated causal-flow diagram and chart-animation system

**What was asked:** animate every chart into a continuous loop, including a new causal-flow diagram tracing parental IQ/SES → prenatal environment → early-life environment → birth outcomes → child IQ, with a specific requested detail — when a motion element hits a touchpoint (a node in the flow), the touchpoint should glow.

**How it actually got built:** implemented with native SVG SMIL (`<animateMotion>` for the particle path, `<animate>` with explicit `keyTimes` for precisely-timed node highlights) plus a CSS `filter`-based glow (`flow-glow`) triggered in sync with the particle's arrival at each node — not via Remotion, which the Product Owner directly asked about by name; clarified as a video-rendering framework, the wrong tool for a page that needs to keep animating live and respect `prefers-reduced-motion` in real time (see `RETROSPECTIVE-ARCHITECTURE-DECISIONS.md` §4).

A separate, harder request in the same pass: rework "How predictors relate to each other" (the correlation heatmap) because the existing animation felt "lazy" — the Product Owner's own bar for "not lazy" was explicit: cells animated like mosaic tiles sweeping across the grid in a linear X→Y direction. That specific, vivid request was implemented directly — and immediately produced the data-hiding bug documented in `RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`, because the tile-sweep effect was built by animating each cell's own opacity, which is the one property that can't be animated toward zero without the data disappearing with it. The eventual fix (a separate `heatmap-wave` overlay layer, base fill never touched) kept the requested "sweeping" visual quality while making the underlying invariant ("the value is always visible") structural rather than a value to remember.

**What made this harder than it looked:** "cool" and "correct" pulled in different directions for the heatmap specifically — the most visually striking version of the requested effect (full per-cell opacity cycling) was also the version that broke the chart's basic job. The fix wasn't "less cool," it was "the same visual effect, moved to a layer that isn't the data."

## The 32-item content-structure section

**What was asked:** apply the Product Owner's own supplied 32-item "universal content structure" checklist *literally* — real numbered headers with real written content, not loosely inspired by it — after an earlier pass had referenced the structure only implicitly and was told directly that it hadn't actually been applied: *"i though i gave you a content strcuture format earlier, why didnt you apply any of it?"*

**How it actually got built:** a new `ProjectStructure.tsx` component holding all 32 entries verbatim-numbered to the Product Owner's own labels (Promise to Audience, Definition, When Scenario, ... through Reference), each with specific, real, plain-language content about Growing Minds itself — not generic filler text, and not a reworded restatement of content that existed elsewhere on the page. The Product Owner was explicit that this checklist is a personal, reusable template, not a one-off ask: *"i didnt put this randomly. it's my universal content structure... use it"* — restated again later as something to reuse "whenever i wanna start a project like this."

Placement was its own second problem, addressed in a later pass: the first version of the page had grown a long stretch of dense text (the full legal disclaimer plus the primer) before any chart appeared at all, which the Product Owner flagged directly as a structural problem, not a length problem — *"im not pointing at that for being lengthy but the organization were off."* Resolved by calculating actual visual weight (chart-to-paragraph ratio) across the whole page and moving the full disclaimer to the appendix, per `PRODUCT-DECISIONS.md` ADR-006 — with the 32-item structure's own ordering used as the actual argument for where a disclaimer belongs (a late-stage item, not an opening one).

**What made this harder than it looked:** the first attempt at "use my content structure" satisfied the spirit (thorough, well-organized copy) without satisfying the letter (32 actual numbered sections, matching the Product Owner's own labels exactly) — and the gap between those two readings wasn't obvious until called out directly. The lesson generalizes past this one project: when a collaborator hands over a named, numbered template, treat the numbers and labels as literal structure to reproduce, not as inspiration to loosely follow.

## The citation and glossary layer

**What was asked:** ground every claim made in the page's long-form copy in real academic sources — initially from one supplied research-reference document, later synthesized against a second document added mid-session — with an explicit standing constraint never to link to sci-hub, and never to fabricate a source.

**How it actually got built:** both source documents (AI-research-assistant transcripts containing real citation metadata alongside sci-hub mirror links) were read in full. Only the extracted, verifiable metadata — author, year, title, venue, DOI — was used, cited exclusively via `doi.org` links, across six `AcademicNote` components and a 14-entry `ReadingList`. When a second source document was added mid-session, the instruction was explicit — *"synthesize your writing prior to this update"* — meaning the existing six notes were revisited and re-grounded against the combined source material, not simply appended to.

A related, harder editorial pass followed: rewrite all of this sourced copy to read as natural, plain-language writing for an intelligent general audience rather than an academic reviewer, against an explicit banned-word list ("multifaceted," "underpinning," "leveraging," "delve into," "holistic," "paradigm," "inherently," "inevitably," and similar). This meant every citation had to survive a rewrite that removed the phrasing patterns that typically *carry* an academic citation naturally (hedged, qualified, formal sentence structures) while keeping the citation itself accurate and present.

**What made this harder than it looked:** the sci-hub constraint meant the two source *documents* could never be committed to the public repository in their original form, but the *facts* inside them (which studies say what) still needed to make it into the shipped page accurately — requiring a clean separation between "read this document for its content" and "never let this document's own links become part of what's published," maintained consistently across every citation touchpoint, not just checked once at the end (see `PRODUCT-DECISIONS.md` ADR-007 for the final structural enforcement of this, added via `.gitignore`).
