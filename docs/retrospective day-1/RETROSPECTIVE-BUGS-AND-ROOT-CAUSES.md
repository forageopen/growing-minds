---
doc_id: RETROSPECTIVE-BUGS-AND-ROOT-CAUSES
authority: engineering-retrospective
retrieval_purpose: >
  Postmortem-style log of every real bug encountered while building Growing
  Minds, in the format Problem / Signal / Root Cause / Fix / Lesson.
  Optimized for pattern-matching against future bugs that "feel similar" —
  read the Signal and Root Cause fields first when triaging something new.
consult_when: [debugging-a-similar-symptom, incident-review, onboarding-to-this-repo]
skip_when: never — this is the highest-value doc in the retrospective set
depends_on:
  - RETROSPECTIVE-INDEX.md
source_files:
  - "src/frontend/vite.config.ts, src/frontend/src/styles/app.css, src/frontend/src/lib/profile.ts, scripts/build-data.mjs, README.md"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude)
---

# Retrospective: Bugs and Root Causes

Each entry follows the same five fields on purpose — consistent structure over prose, so a future skim can jump straight to "Root Cause" without re-reading the story.

## Blank white page after GitHub repo rename

- **Problem:** After renaming the GitHub repository from `Baby-Boom` to `growing-minds`, the live site at `forageopen.github.io/growing-minds/` rendered a completely blank white page.
- **Signal:** Reported directly by the Product Owner: *"the page is just blank white."* Not caught before the rename — the rename was a direct GitHub-web action taken outside this session's own change-management loop.
- **Root Cause:** `src/frontend/vite.config.ts` had `base: "/Baby-Boom/"` hardcoded. Every built asset (`<script>`, `<link>` tags) was emitted with that path prefix, so once the repo — and therefore the GitHub Pages project path — became `/growing-minds/`, every asset request 404'd. The HTML shell loaded; nothing inside it did.
- **Fix:** Updated `base` to `/growing-minds/` and the git remote URL (`git remote set-url origin https://github.com/forageopen/growing-minds.git`) in the same commit as the rest of the rebrand.
- **Lesson:** A Vite `base` path that encodes a repo/project name is a landmine for any future rename — it fails silently at build time (the build succeeds; nothing in the build step knows the deployed path changed) and only surfaces once a real browser requests the real deployed URL. Recorded as a standing criterion in `PRODUCT-SPEC.md` §4 specifically so a future rename checks this deliberately instead of rediscovering it via a blank page.

## Heatmap animation hiding its own data (two rounds)

- **Problem, round one:** The correlation-heatmap chart's continuous animation faded cells toward full transparency for a large fraction of the loop cycle, so the chart's actual values were invisible for much of the time a visitor would be looking at it.
- **Signal:** Reported directly: *"why the cells make the heatmap disappear? that's compromising."* — a plain description of the symptom, not a technical bug report, which is exactly the kind of signal that only surfaces from someone actually watching the animation run, not from reading the animation code.
- **Root Cause (round one):** The first animated treatment used a mosaic-tile keyframe that cycled each cell's own opacity from 0 to 1 as part of the "tile sweeping across the grid" effect — visually interesting, but it treated the data-bearing fill itself as the thing being animated, rather than adding motion on top of a fill that never disappears.
- **Fix (round one):** Replaced the opacity-cycling mosaic tiles with a separate animated overlay layer.
- **Problem, round two:** A later pass reworking chart animations broadly (the same session that introduced the causal-flow diagram's glow effect) reintroduced a variant of the same failure mode in the heatmap specifically — caught and named explicitly as "Fix heatmap animation regression" rather than left unaddressed.
- **Root Cause (round two):** The animation and the data-bearing base fill were not yet architecturally separated in a way that made the "never hide the value" invariant hard to violate by accident — a broad animation-system pass could still touch the wrong layer.
- **Fix (round two):** Established a `heatmap-wave` keyframe applied to a **separate overlay `<rect>`**, layered strictly on top of a base cell whose own opacity is never touched by any animation. The invariant became structural (the base fill has no `opacity` keyframe at all) rather than a value someone has to remember to keep close to 1.
- **Lesson:** "Don't let the cell disappear" is a rule that has to be enforced by the DOM structure, not by tuning keyframe values — a value-based fix (cap the minimum opacity) can still regress the next time someone touches the animation; a structural fix (data fill and motion are different elements) cannot regress the same way. This is the general lesson worth generalizing to every future chart animation on this page: **motion goes on an overlay, never on the layer the value itself lives on.**

## CSS overflow-axis interaction hiding tooltips and adding phantom scrollbars

- **Problem:** Info-bubble tooltips/popovers on several charts were visually cropped, and several charts had their own internal scrollbar appear, causing the chart to shift/scroll internally instead of staying static and fully visible.
- **Signal:** Reported directly, alongside a request to test all charts systematically: *"i sense some of the info bubble/caption when mousehover were cropped, plus internal scroll bar appear for several visual charts."*
- **Root Cause:** `.chart-wrap` set `overflow-x: auto` without setting `overflow-y`. Per the CSS2.1 overflow specification, a non-`visible` value on one axis forces the browser to also compute the other axis as `auto` rather than leaving it `visible` — the two axes cannot be mixed visible/non-visible. This silently gave every chart wrapper a real (if usually invisible-until-triggered) scroll container on **both** axes, which clipped anything (a tooltip, a popover) that needed to render outside the wrapper's own bounds, and created a scrollable box wherever content ever slightly exceeded it.
- **Fix:** Removed `overflow-x: auto` entirely — the SVGs already scale via `viewBox`, so a horizontal scroll affordance was never actually needed. Only `.table-scroll` (the data-dictionary table) legitimately needs its own scroll container, and keeps one.
- **Lesson:** `overflow-x` and `overflow-y` are not independent properties in the way they read — setting one to a non-`visible` value has a side effect on the other axis that most authors never intend and CSS tooling doesn't warn about. When a hover-triggered element (tooltip, popover) is clipped somewhere it shouldn't be, checking every ancestor's overflow *pair*, not just the axis that seems relevant, is the faster diagnostic path than styling the tooltip itself.

## Font-size hierarchy inconsistency, site-wide

- **Problem:** Font sizes across the page had drifted into roughly 20 near-duplicate ad hoc values (e.g. several different sizes all intended to read as "body text," slightly different from each other with no reason).
- **Signal:** Reported directly and generally: *"one critical design style is font size hierarchy were off. all of it."*
- **Root Cause:** No named type scale existed — each component's font size had been set locally, independently, as that component was built, with no shared token to converge on.
- **Fix:** Collapsed the ~20 values into 9 named scale tokens (`--text-2xs` through `--text-2xl`, plus `--text-number-lg` for large stat figures) in `tokens.css`, then applied the nearest matching token everywhere a hardcoded size previously existed.
- **Lesson:** A type scale is cheap to establish at the start of a design-token system and expensive to retrofit once ~20 divergent values already exist across a codebase — the fix here was mechanical once the scale existed, but finding and reconciling every divergent value first required a full sweep, not a local patch.

## Hero paragraph wrapping into five choppy centered lines

- **Problem:** The hero section's introductory paragraph wrapped into five short, unevenly-broken lines instead of a smooth, readable paragraph shape.
- **Signal:** Reported directly, with a fair challenge attached: *"why this is splitted into 5 rows? where does your design principle do you follow?"*
- **Root Cause:** `.hero p` was constrained to `max-width: 58ch`, which is narrow relative to the hero's actual font size, and the text was center-aligned — center alignment makes uneven line lengths far more visually obvious than left/ragged-right alignment does, so a wrapping problem that might have been minor at left-alignment became a glaring "choppy" one.
- **Fix:** Widened `.hero p` to `max-width: 640px` and the `.hero` container itself from 760px to 820px.
- **Lesson:** A narrow `ch`-based max-width interacts badly with center-aligned text specifically — the same width constraint on left-aligned text degrades more gracefully. When a centered paragraph looks "choppy," check the width-to-font-size ratio before assuming the copy itself needs trimming.

## Naive sum-of-correlations profile score overstating combined explanatory power

- **Problem:** The Product Owner's own profile scored 113 (85th percentile) against a claimed real IQ of 128–130 — a discrepancy large enough to investigate as a real accuracy bug, not dismiss as expected noise.
- **Signal:** A direct, falsifiable real-world comparison: *"my iq at 128-130. so need to fine tune the data."*
- **Root Cause:** The scoring engine summed each numeric field's own marginal correlation with `child_iq`, independently. Several fields (maternal education, home stimulation, nutrition quality) all partly reflect the same underlying socioeconomic status — summing their raw correlations counted that shared variance more than once, which in this specific direction of error meant scores were compressed toward the middle rather than reaching the tails a person's genuinely unusual combination of factors would justify.
- **Fix:** See `PRODUCT-DECISIONS.md` ADR-001 — replaced with standardized multiple-regression coefficients solved via Gauss-Jordan matrix inversion in `scripts/build-data.mjs`. Confirmed via the build script's own diagnostic output: `multiple-R² = 0.220` vs. `naive sum-of-r² = 0.304`.
- **Lesson:** "Sum each variable's own correlation with the outcome" looks like a reasonable, defensible composite-index method, and is a real, well-known statistical error the moment any two summed variables are themselves correlated with each other — which is the normal case for real-world socioeconomic/developmental variables, not an edge case. A single real, specific, checkable data point (one person's own two numbers) caught this faster than any amount of code review would have.

## Absurd z-score extrapolation from widened slider ranges

- **Problem:** After widening several numeric sliders (`breastfed_months` to 60, following the Product Owner's own 48-month history) to fit real answers outside the dataset's typical range, the case-study "best possible profile" ceiling computed to 154 (99th percentile) — implausibly high even for a maximum-everything hypothetical.
- **Signal:** Caught proactively, by checking the live-computed number against intuition after the slider-widening change, rather than waiting for it to be reported.
- **Root Cause:** `breastfed_months` at its new max of 60 produces a standardized z-score of `(60 − 6.007) / 4.188 ≈ 12.9` — nearly 13 standard deviations from the dataset mean. The regression coefficient this value gets multiplied against was fit on the actual data distribution, where no observation is anywhere near 13 SD out; multiplying it by a z of 13 is a linear model confidently extrapolating into territory the data it was fit on says nothing about.
- **Fix:** See `PRODUCT-DECISIONS.md` ADR-002 — clamp each field's z-score to `[-4, 4]` inside `computeScore()` before it's applied, keeping the wide slider (so an honest answer is never clipped) while keeping the model's output inside the range it can actually justify.
- **Lesson:** Widening a UI input's range and bounding what a *linear model fit on that field's original distribution* is allowed to do with the input are two separate decisions — doing the first without the second turns "let people enter honest, unusual answers" into "let unusual answers silently break the model's assumptions." The slider range is a UX decision; the z-clamp is a statistics decision; they needed to be made — and fixed — separately, even though they touch the same field.

## Ethics disclaimer misstated the dataset's own real basis

- **Problem:** The page's disclaimer copy stated the dataset was *"generated to resemble patterns reported in developmental research, not drawn from real children"* — technically true about the "not drawn from real children" half, but written in a way that undersold that the generator's actual parameters are calibrated to specific, real, published research effect sizes, not merely "resembling" them loosely.
- **Signal:** Reported directly, with the Product Owner pointing back to the dataset's own real provenance: *"but these datasets that provided is indeed from a real research. can you adjust the disclaimer."*
- **Root Cause:** The original copy was written cautiously to avoid overclaiming realism, but in doing so undersold a claim that was actually verifiable and true — the Kaggle dataset page itself states the specific calibration targets (parental-midpoint correlation ~0.53, heritability ~0.4, iodine deficiency −7 to −12 IQ points, etc.).
- **Fix:** Verified the claim directly against the actual Kaggle dataset page (not assumed), then rewrote the disclaimer to state plainly that the generator's parameters are calibrated to published research while still being explicit that no data from that research, and no real child, is reproduced — both halves of the claim stated accurately instead of one being flattened for caution.
- **Lesson:** "Write conservatively to avoid overclaiming" and "state the actual, checkable facts accurately" are not automatically the same thing — a disclaimer can undersell a true, verifiable claim just as easily as it can oversell a false one, and both are inaccuracies worth fixing. The fix required going back to the primary source (the dataset's own page) rather than editing the sentence based on general caution.
