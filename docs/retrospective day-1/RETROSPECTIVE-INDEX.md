---
doc_id: RETROSPECTIVE-INDEX
authority: engineering-retrospective
retrieval_purpose: >
  Entry point for the engineering retrospective covering all Growing Minds
  work delivered in one continuous session. Written from the AI
  pair-programmer's standpoint (Claude), addressed to the Product Owner
  (Adam Rosman). Use this index to route to the specific retrospective doc
  that covers a given concern; each doc below is self-contained and
  independently retrievable.
consult_when: [sprint-retro, onboarding-a-new-collaborator, before-repeating-a-similar-build, incident-review]
skip_when: never — read this index first, then follow to the relevant doc
depends_on:
  - docs/product/PRODUCT-DECISIONS.md
source_files:
  - "Full session transcript, growing-minds repo (github.com/forageopen/growing-minds)"
compiled: 2026-08-13
author_role: AI pair-programmer (Claude), acting under the Product Owner's direction per PRODUCT-DECISIONS.md
scope: "Single continuous build session, initial dashboard scaffold through the Phase 0 content/animation/scoring-accuracy pass"
---

# Retrospective: Building Growing Minds — Index

## Why this exists

This is a lessons-learned retrospective, in the same spirit as — and modeled directly on — the retrospective set written for Noted (`S2-Week 3/docs/retrospective day-1/`): what happened, why, what it cost, what to do differently, scoped to a single engineer's-eye technical account rather than a team ceremony. For this project, "the team" was one Product Owner directing one AI pair-programmer through rapid, conversational iteration, with every accepted batch of changes verified, then shipped to production (GitHub Pages) on the Product Owner's explicit push signal.

Requested directly, twice — once for the retrospective set itself, and once more specifically for the prompt-flow template below, described as a reusable reference for future projects, not a one-off summary of this one.

## How to use this

Six docs, each independently retrievable and scoped to one concern:

| Doc | Covers | Read this when |
|---|---|---|
| [RETROSPECTIVE-ARCHITECTURE-DECISIONS.md](RETROSPECTIVE-ARCHITECTURE-DECISIONS.md) | Why the codebase is shaped the way it is — the build-once data pipeline, the no-charting-library chart layer, SMIL/CSS animation over Remotion, the hand-rolled regression solver, the token/type-scale system | Extending the architecture, onboarding to `src/` |
| [RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md](RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md) | Every real bug shipped or caught, with root cause and fix | Debugging something that *feels* familiar; postmortem review |
| [RETROSPECTIVE-FEATURE-DELIVERY.md](RETROSPECTIVE-FEATURE-DELIVERY.md) | Case studies of the harder features — the profile builder/scoring engine, the animated causal-flow diagram, the 32-item content structure, the citation layer — how they were actually built, not just what they do | Building something structurally similar |
| [RETROSPECTIVE-PROCESS-AND-COLLABORATION.md](RETROSPECTIVE-PROCESS-AND-COLLABORATION.md) | The push gate (and its explicit "don't ask, just push once done" second half), reading sourced documents before distributing, the verification approach in a project with no automated test suite, a recurring screenshot-tooling artifact worth not mistaking for a real bug | Working with this Product Owner again; setting norms with a different AI pair-programmer |
| [RETROSPECTIVE-ABIM-PROCESS-MAPPING.md](RETROSPECTIVE-ABIM-PROCESS-MAPPING.md) | This session mapped against `PRODUCT-PRINCIPLES.md`'s practical operating loop and the abstract ABIM model — two full loop traversals, who ran backward induction, a validation-state table for every major shipped item, one retroactive assumption-control record, and a Criteria checklist crosswalk | Sprint retro against how work actually gets driven; backfilling a decision record |
| [RETROSPECTIVE-PROMPT-FLOW-TEMPLATE.md](RETROSPECTIVE-PROMPT-FLOW-TEMPLATE.md) | A cleaned, staged, recontextualized compilation of how this project's requests actually flowed stage to stage — written as a reusable template for starting a similar project, not a transcript of this one | Starting a new project and wanting a proven request-flow shape to follow |

See also `docs/product/PRODUCT-DECISIONS.md` Part II for this project's own 9-entry ADR log, and `docs/product/PRODUCT-PRINCIPLES.md` Part II for the MVD-filter table and anti-patterns check applied to this project specifically (not duplicated in this retrospective set, per the Source of Truth rule both files state).

## Session shape, at a glance

```
Initial build (dataset cleaning, GitHub repo, dashboard, Atlassian skin)
  → redesign as a public-education experience ("Where do you sit?")
  → continuous chart animation pass + new causal-flow diagram
  → direction choice: chart-literacy over MBTI/social (MBTI killed)
  → disclaimer accuracy correction (dataset's real research basis)
  → heatmap animation regression fix + type-scale discipline
  → README sensitive-info removal, rebrand (Baby Boom → Growing Minds)
  → blank-page deploy fix (Vite base path)
  → citation/glossary layer, plain-language voice rewrite
  → tooltip/scrollbar CSS fix, typography/spacing audit
  → 32-item content-structure section, page restructured by visual weight
  → profile-scoring accuracy fix (naive-sum → multiple regression)
  → z-score extrapolation fix (slider widening + clamp)
  → README brought current, retrospective doc set (this)
```

## Headline numbers

- **Session span:** 2026-08-12 20:04 – 2026-08-13 00:17, one continuous sitting, per `git log`.
- **Commits:** 14, `8126707` (initial dashboard) through `73b1b2d` (README update).
- **Automated tests:** 0 — this project has no unit-test harness; `tsc -b`, `vite build`, and `eslint` are the only automated checks. See `RETROSPECTIVE-PROCESS-AND-COLLABORATION.md` for what that meant for how bugs actually got caught.
- **Real bugs found and fixed:** 7, cataloged in full in `RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md` — none caught by an automated check; all caught by a real number, a real report, or a real browser render contradicting what the code appeared to do.
- **ADRs recorded:** 9, in `docs/product/PRODUCT-DECISIONS.md` Part II.
- **Charts:** 8 hand-rolled SVG components, no charting library.
- **Real, cited sources:** 14, linked exclusively via `doi.org`; 0 sci-hub links published.
- **A direction proposed and killed on evidence, not shipped alongside the one that was kept:** 1 (an MBTI-based "relationship mapper" — see `PRODUCT-PRINCIPLES.md` Part II §4).

## The single biggest recurring lesson

Every real bug this session was found by a human — or a deliberately-invoked real check — noticing that something *looked wrong in the world*, never by an automated assertion, because this project has none. A profile score that didn't match a real IQ. A heatmap that visibly hid its own cells. A ceiling number that was implausibly high. A blank white page. A disclaimer sentence that undersold a checkable fact. In every one of these cases, "the build succeeded" and "the code has no type error" were both true at the exact moment the bug was live. The actionable version of this lesson, worked out in full in `RETROSPECTIVE-PROCESS-AND-COLLABORATION.md` and `RETROSPECTIVE-ABIM-PROCESS-MAPPING.md` §4: **in a project with no automated test suite, treating a suspicious real-world number or a visibly-wrong render as evidence to investigate — rather than as noise to explain away — is the actual verification mechanism this project has. There is no other one.**
