---
doc_id: RETROSPECTIVE-PROMPT-FLOW-TEMPLATE
authority: engineering-retrospective
retrieval_purpose: >
  A cleaned, staged compilation of how requests actually flowed across the
  Growing Minds session — compiled and recontextualized for precision, not
  quoted verbatim. Written specifically to be reused as a template: read
  this before starting a similarly-shaped project (a solo-directed,
  AI-built public data/education artifact) to see the request shape that
  already worked, not to relive this specific session.
consult_when: [starting-a-new-project, planning-a-request-sequence, onboarding-a-new-collaborator-to-this-working-style]
skip_when: never — this is the reusable artifact this whole doc set was requested to produce
depends_on:
  - RETROSPECTIVE-INDEX.md
compiled: 2026-08-13
author_role: AI pair-programmer (Claude), compiled from the full session transcript
---

# Prompt-Flow Template: Building a Solo-Directed Public Data Artifact

## How to use this doc

Each stage below names a **move** — a generalized kind of request or correction — followed by **why it mattered** and **how it showed up concretely** in Growing Minds, so the pattern stays grounded rather than abstract. The stages are ordered the way they actually occurred, but they are not a rigid checklist to complete once each — several recurred (the design-hierarchy audit move, the systemic-not-local fix move) at different points as new evidence surfaced. Read this as the shape of a working relationship over one long session, not a script.

## Stage 1 — Establish the concept and the initial scaffold

**Move:** Start from a single, sharp framing question or hook for the whole product, not a feature list — then attach the technical scaffold (dataset, repo, design-system skin, local preview) to that framing directly.

**Why it mattered:** every later structural decision (what to lead with, what counts as "on topic," where the disclaimer belongs) traced back to this one framing rather than needing to be re-derived each time.

**How it showed up:** the entire product organized around one question — "where do you sit among 50,000 childhoods?" — established at the very start and never abandoned, even as the surrounding design language changed substantially.

## Stage 2 — Redesign for the real audience, not the easiest one to build for

**Move:** Once a first version exists, evaluate it against who will actually use it, not who was easiest to build for. If it reads as a technical/internal tool but the audience is the general public, say so directly and ask for a redesign around that audience specifically — not a cosmetic pass.

**Why it mattered:** this reframing (dashboard → public-education experience) came early enough to shape every subsequent feature request, rather than being retrofitted after the product's shape had already hardened.

**How it showed up:** the shift from a technical-dashboard framing to a persistent "build your own profile, see where you sit" experience with an explicit three-act narrative structure.

## Stage 3 — Push for full sensory polish with concrete, specific direction

**Move:** When asking for animation, motion, or visual polish, give a concrete adjective or reference behavior ("looks lazy," "like tiles sweeping," "glow when it hits a touchpoint") rather than a vague "make it better." Specific critique is more actionable than general critique, and it's faster to satisfy correctly the first time.

**Why it mattered:** specific direction produced fast, correctly-targeted iterations — but also, once (Stage 8 below), produced a real regression, because a vivid, specific request (full per-cell opacity cycling) was implemented exactly as asked before its side effect (hiding the data) was caught.

**How it showed up:** the continuous chart-animation pass, the causal-flow diagram's particle-and-glow effect, and the heatmap's requested "mosaic tile sweep" treatment.

## Stage 4 — When output contradicts lived reality, redirect the fix to the mechanism, not the data

**Move:** If a tool's output disagrees with a real, known fact about yourself or the world, say so plainly — and be explicit about *which layer* needs fixing (the calculation logic) versus which layer must stay untouched (the underlying dataset). Supply real reference material to reverse-engineer against when it exists, with an explicit scope boundary on what's relevant and what isn't.

**Why it mattered:** this single correction ("fix the engine, not the data") prevented a much worse outcome — quietly adjusting the dataset to match one person's expectation would have corrupted the product for everyone else. It also led directly to finding a real, general statistical bug (double-counted overlapping variance), not just a personal calibration issue.

**How it showed up:** the real-IQ-vs-tool-score discrepancy that led to the multiple-regression correction (`PRODUCT-DECISIONS.md` ADR-001).

## Stage 5 — Humanize inputs against your own edge cases, framed as a general principle

**Move:** When a UI constraint (a slider range, a form field limit) doesn't fit your own real answer, say so — and frame the fix as a general UX improvement ("this should be valid for more people than just me"), not a personal exception.

**Why it mattered:** framing it generally is what made the fix land as a real product improvement (wider, more honest ranges for everyone) rather than a special case — though it also introduced a real downstream bug (Stage 4's engine now had to handle inputs it wasn't originally built for), which is its own lesson: a UI-range change and a model-input-bound change are two different decisions, even when they're prompted by the same request.

**How it showed up:** the widened numeric-field ranges (breastfeeding months, books in the home, etc.), and the z-score-clamp fix that followed once the widening's side effect surfaced.

## Stage 6 — When genuinely torn between two directions, ask to be asked

**Move:** If a product decision could reasonably go two ways, lay out both directions honestly, including their trade-offs — and if the deciding preference belongs to the person directing the project, wait to be asked directly rather than defaulting to a guess or blending both.

**Why it mattered:** getting an explicit, single answer ("pursue direction 2, redirect fully") avoided the far more expensive outcome of half-building both directions and later having to unwind one.

**How it showed up:** the choice between an MBTI/social-connector direction and a chart-literacy/medical-visualization direction — presented, asked about directly, decided once, never revisited.

## Stage 7 — Verify a factual/ethical claim against its primary source before touching the copy

**Move:** When a disclaimer or claim about the underlying source material is challenged, don't just soften or rephrase the sentence — check the actual primary source (the dataset's own page, in this case) and correct the claim to what's actually true and verifiable.

**Why it mattered:** the first version of the fix would likely have been a vaguer, more hedged sentence that avoided the specific error without actually resolving it. The real fix required going back to source, not just editing tone.

**How it showed up:** the disclaimer-accuracy correction about the dataset's real calibration to published research (`RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`).

## Stage 8 — Name a data-integrity regression immediately, however visually interesting the alternative is

**Move:** If a visual treatment — however striking — compromises the audience's ability to actually read the data, say so immediately and specifically ("that's compromising"), rather than accepting it because it looks good.

**Why it mattered:** this drew a hard line (motion is decorative, data visibility is not negotiable) that then applied to every future chart animation in the product, not just the one that triggered it.

**How it showed up:** the heatmap's data-hiding mosaic-tile animation, caught and named directly, twice (`RETROSPECTIVE-BUGS-AND-ROOT-CAUSES.md`).

## Stage 9 — When one inconsistency is spotted, ask for the systemic audit, not the local patch

**Move:** If a single instance of a design inconsistency (a font size, a spacing value) is noticed, ask for the *whole category* to be audited and fixed, not just the one instance — "all of it," not "this one spot."

**Why it mattered:** this produced a real, durable design-token system (a 9-step type scale; a spacing audit against the design system's own 8px grid) instead of a series of one-off patches that would have kept drifting.

**How it showed up:** the font-size hierarchy fix and the later spacing audit, both requested as full sweeps rather than point fixes.

## Stage 10 — Hold the collaboration itself to a standard, not just the code

**Move:** If a piece of professional judgment (a design or engineering decision) is dismissed or second-guessed in a way that feels unwarranted, say so directly, as a statement about the working relationship — not only as a note about the specific decision.

**Why it mattered:** this is a different category of feedback from a bug report or a design critique — it's about how disagreement gets handled — and treating it as its own real signal (not folding it into the next technical fix silently) is what keeps a long, fast-moving solo-directed session collaborative rather than purely transactional.

## Stage 11 — Ask precise tooling questions directly, rather than assuming

**Move:** When curious about how something was built, ask the specific technical question directly (what framework, what technique) rather than assuming from the visible result.

**Why it mattered:** got a precise, correctable answer in the moment (confirming SVG/SMIL+CSS, not Remotion) rather than an assumption persisting uncorrected into a later request that would have been built on a wrong premise.

## Stage 12 — Ground UX audits in the design system itself, not general aesthetic judgment

**Move:** When requesting a UX fix (cropped tooltips, unwanted scrollbars), point back to the project's own stated design-system reference (Atlassian's grid/spacing conventions, in this case) as the standard to check against, rather than leaving "better" undefined.

**Why it mattered:** this turned a vague complaint into a checkable standard, which is what actually led to finding the real root cause (a CSS overflow-axis interaction) instead of a series of cosmetic patches.

## Stage 13 — Supply your own reusable structural template, and require it applied literally

**Move:** If you already have a personal, named framework for structuring content (a checklist, a set of stages), hand it over explicitly as *the* structure to use — and if an earlier attempt only loosely gestured at it, say so plainly and require literal application: the actual labels, the actual numbering, actually filled in.

**Why it mattered:** "apply this loosely" and "apply this literally" produce very different results, and the gap between them isn't obvious until named — a collaborator (human or AI) will default to loose inspiration unless told explicitly that literal structure is what's wanted.

**How it showed up:** the 32-item content-structure section, built only after being told directly that an earlier pass hadn't actually applied the supplied structure.

## Stage 14 — Demand structural discipline, distinct from a request about length or content

**Move:** When a page's organization feels off, be precise about *what kind* of problem it is — not enough content, too much content, or the right content in the wrong order/position. "The organization is off, not the length" is a materially different note than "this is too long," and conflating them leads to the wrong fix.

**Why it mattered:** this distinction directly produced the correct fix (relocate the disclaimer, don't shorten it) instead of the wrong one (trim the copy).

**How it showed up:** the visual-weight rebalancing that moved the full disclaimer out of the page's opening and into the methodology appendix.

## Stage 15 — State the autonomy boundary explicitly, once, and expect it to hold

**Move:** If you want a collaborator to stop pausing for confirmation on decisions you've already delegated, say so as an explicit, standing instruction — not a one-time preference — so it applies to every future batch of work, not just the request it was attached to.

**Why it mattered:** this is what allowed the session's later stages (the profile-scoring fix, the z-clamp fix, the final restructuring pass) to be completed and shipped in one continuous motion, without re-litigating "should I push now" at every step.

## Stage 16 — Request retrospective documentation with explicit scope and calibration

**Move:** When asking for a retrospective or governance-doc set, point to a specific prior example for format and depth calibration, name the exact document types expected, and state explicitly what to exclude (abandoned directions, tangential detours) so the output stays a real account of what happened rather than padded to look thorough.

**Why it mattered:** without a calibration example and explicit exclusion criteria, a retrospective request tends to produce either a shallow summary or an unfocused document dump — naming both up front is what made a genuinely useful, appropriately-scoped doc set possible.

**How it showed up:** this doc set itself, calibrated against the Noted project's own retrospective set, with the MBTI detour explicitly included only where it demonstrates a real process lesson (Re-Induction, `PRODUCT-PRINCIPLES.md` Part II §4) and excluded everywhere else it would just be a tangent.
