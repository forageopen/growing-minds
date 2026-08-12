---
doc_id: RETROSPECTIVE-PROCESS-AND-COLLABORATION
authority: engineering-retrospective
retrieval_purpose: >
  Documents the working agreement that emerged between the Product Owner
  (Adam Rosman) and the AI pair-programmer across this session — explicit
  gates, transparency norms, and the concrete verification approach used in
  a project with no automated test suite. Useful for setting expectations
  at the start of a similar engagement.
consult_when: [starting-a-similar-engagement, setting-collaboration-norms, reviewing-the-verification-approach]
skip_when: pure technical reference — see the other retrospective docs instead
depends_on:
  - RETROSPECTIVE-INDEX.md
compiled: 2026-08-13
author_role: AI pair-programmer (Claude)
---

# Retrospective: Process and Collaboration

## The push gate — and its explicit second half

Every deploy in this session was gated behind an explicit instruction — *"if ready then push"* early on, then stated more firmly later: *"once all task were consired & done (im not asking an opinion from you), push."* That second phrasing carries a real, separate instruction beyond "wait for my go-ahead": once every requested change in a batch is genuinely complete, push without first asking whether to. Treating "should I push now?" as a question needing an answer, once the Product Owner had already said not to ask, would itself have been a failure to follow the stated norm — the correct behavior became "assess completion honestly, then act," not "assess completion, then ask."

**Why this distinction matters in practice:** it moves the checkpoint from "does the PO want this pushed" (a question, asked every time) to "is this batch actually, honestly done" (a self-assessment, made every time) — a real behavior change, not a phrasing change. The risk this creates is the mirror image of Noted's push-gate risk: instead of shipping something prematurely, the failure mode becomes pushing something that only *looks* done. That's exactly why the verification approach below (particularly checking a live-computed number against intuition before calling a fix complete) mattered more in this session than it might have otherwise.

## Reading before distributing, applied to sourced research documents

Two personal research-reference documents were supplied over the course of this session and read in full before any content from them was used in the page's citations. Both turned out to contain sci-hub mirror links alongside their real citation metadata — found by directly checking, not assumed absent. Only the verifiable metadata (author, year, title, venue, DOI) was extracted for use in the shipped page; the documents themselves were kept out of the public repository via `.gitignore` once this was noticed as a live risk during the final commit review, not caught earlier by any explicit check built for it (`PRODUCT-DECISIONS.md` ADR-007).

**Worth stating honestly:** this check happened at commit time, as part of reviewing `git status` before staging, not as a dedicated step earlier in the session when the documents were first read. It worked this time. A more robust version of this norm — checking a supplied document for anything that shouldn't reach a public repo *at the point it's read*, not only at the point something built from it is about to be committed — is the safer version of this habit to carry forward.

## Transparency about tradeoffs, proactively

Two cases where a real cost or a real correction was surfaced directly in the shipped artifact, not left to be discovered later:

1. **The naive-sum scoring correction.** The measured overstatement (naive sum-of-r² = 0.304 vs. corrected multiple-R² = 0.220, roughly 38%) is disclosed directly on the page itself, as a named case study with the actual before/after numbers — not folded silently into a changelog entry only visible to someone reading commit history.
2. **The parental-IQ exclusion's real cost.** The profile index's ceiling (~top 2%, computed live rather than asserted) is presented directly alongside the reason for it — the two strongest predictors in the dataset are deliberately never asked for, on ethical grounds, and the resulting ceiling is the visible, disclosed cost of that choice, not a limitation left unexplained.

**The general norm this reflects:** the same standard applied to the Product Owner's own request for ethical, honest treatment of the underlying dataset (no fabricated realism claims, no overclaiming, race/ethnicity deliberately excluded as a predictor) was applied to this project's own engineering decisions — a trade-off disclosed in the product itself costs a sentence; the same trade-off left implicit costs trust the first time someone notices it independently.

## Verification approach in a project with no automated test suite

Unlike a project with a unit-test harness, Growing Minds has no `vitest`/`jest` suite — `npm run build` (which runs `tsc -b` then `vite build`) and `npm run lint` are the only automated checks. That makes real-browser verification carry more of the actual verification weight than it would in a more heavily-tested codebase, not less — a clean typecheck and a clean build confirm the code is well-formed; neither confirms a chart renders correctly, an animation doesn't hide data, or a live-computed number is sane.

**What that meant in practice this session:** the two scoring-engine bugs (naive-sum overstatement, z-score extrapolation) were both caught by treating a real, computed number as evidence to sanity-check, not by any automated assertion — there was no test that could have caught either, since neither is a type error or a build failure. Both were caught by comparing a number the tool produced against an independent expectation (the Product Owner's own real IQ; basic intuition about what a "best possible profile" ceiling should look like), which is exactly the class of check no `tsc`/`vite build` pass can perform.

**A recurring tooling artifact, worth naming so it isn't mistaken for a real bug next time:** several times this session, a browser-automation screenshot call returned a frozen-renderer error or an oddly zoomed/blank capture. Each time, retrying via a page reload plus a fresh screenshot, or switching to a full page-text read instead of a screenshot, confirmed the page was actually rendering correctly — these were capture-timing artifacts in the verification tooling itself, not application bugs. The practical lesson: when a screenshot looks wrong, get a second independent read (a reload-and-retry, or a text-based check) before concluding the *application* is broken — but also don't wave away every screenshot problem as tooling noise without that second check, since a screenshot is sometimes the only way a real visual bug (like the heatmap data-hiding animation) is caught at all.

## Concurrent direct-GitHub edits, and merging around them

Partway through this session, the Product Owner made direct edits to `README.md` through the GitHub web UI while local work was also in progress — discovered as a merge conflict when the next local push was attempted (`fa8d28e`, "Merge: reconcile local rebrand with README edits made directly on GitHub"). This was resolved as an ordinary merge, keeping both sets of changes, rather than treated as an error condition or a reason to overwrite either side.

**Worth naming as a real collaboration pattern, not an edge case:** a Product Owner with direct repository access will sometimes edit files outside the conversational session entirely. The correct response is the same discipline already applied to any other uncommitted-work scenario — check `git status`/`git log` for divergence before assuming the local working copy is the only source of change, and merge rather than force-overwrite when it isn't.

## What worked well and should be repeated

- **Investigating a real, specific, falsifiable number** (the Product Owner's own real IQ; the implausible 154 ceiling) rather than treating either as noise — both led directly to real bug fixes that no code review would have caught.
- **Verifying an accuracy claim against its primary source** before adjusting copy — the disclaimer-wording fix (`RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`) required checking the actual Kaggle dataset page, not just editing the sentence to sound more careful.
- **Naming trade-offs in the shipped artifact itself** (the case-study sections, the code comment at the z-score clamp), not only in conversation.
- **Redacting sensitive content on direct request without resistance or second-guessing** — the "Run locally" README removal was executed immediately once the Product Owner called it sensitive, without asking why.

## What to watch for next time

- **Check a supplied source document for anything unpublishable at the moment it's read**, not only at the moment something built from it is about to be committed — this worked out this session, but only because the sci-hub check happened to occur during a `git status` review before staging.
- **A project with no automated test suite needs its verification checkpoints named explicitly**, the same way `PRODUCT-PRINCIPLES.md` Part I §19 names Verify as its own step for a project that does have one — "typecheck and build passed" is necessary but was never sufficient for either of this session's two real scoring bugs, and that gap is structural to this project (no test harness), not a one-time lapse.
