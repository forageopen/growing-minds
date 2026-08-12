# Growing Minds

**Where do you sit among 50,000 childhoods?** A public data-education page,
not a technical dashboard: build a rough profile from your own background,
see it placed on the population as a range rather than a single number, then
explore how the underlying factors relate to each other and to a synthetic
measure of childhood IQ. Three acts — *Where do I sit?*, *What's associated
with this?*, *What can be changed?* — each grounded in a short, plain-language
note on the reasoning and research behind it, not just the chart itself.

**Live dashboard:** https://forageopen.github.io/growing-minds/

## Dataset

[`Child IQ: Genes & Environment`](https://www.kaggle.com/datasets/sergionefedov/child-iq-genes-environment)
(Kaggle, sergionefedov) — 50,000 rows × 30 columns covering parental IQ and
SES, prenatal factors (iodine status, smoking, alcohol, gestational age),
early environment (home stimulation, books, screen time, nutrition), and two
targets: continuous `child_iq` and binary `high_cognitive_potential` (top
decile).

Validated at build time: no missing values, no duplicate `child_id`s, no
malformed rows. See `data/processed/validation_report.json` for the current
report and `data/raw/data_dictionary.csv` for the full column reference.

## Repository layout

```
data/
  raw/                 source CSV + gzip + data dictionary (source of truth)
                        (personal research-reference notes also live here,
                        gitignored — see "Sources & citations" below)
  processed/            typed data dictionary, validation report
scripts/
  build-data.mjs        validates the raw CSV, emits dashboard-ready JSON,
                        fits the profile-builder regression
src/frontend/
  public/data/          precomputed aggregates the dashboard fetches (no
                         client-side parsing of the 50k-row CSV)
  src/
    charts/              hand-built SVG chart components
    components/          shared UI — cards, stat tiles, tables, tooltips,
                          the profile builder, and the long-form content
                          components (AcademicNote, ReadingList,
                          ProjectStructure)
    lib/                 scales, stats (KDE, multiple regression), the
                          profile scoring engine, data hooks
    styles/tokens.css     design tokens sourced from @atlaskit/tokens,
                          validated for categorical color accessibility
.github/workflows/deploy.yml   builds and publishes to GitHub Pages
```

## Data pipeline — "optimize for parsing"

The dashboard never parses the raw CSV in the browser. `scripts/build-data.mjs`
reads `data/raw/child_iq_master.csv` once, validates it, and writes small
precomputed JSON files (`overview`, `distributions`, `flynn_effect`,
`by_category`, `by_binary`, `correlations`, `correlation_matrix`,
`scatter_sample`, `dictionary`) into `src/frontend/public/data/`. The full
combined payload is well under 250 KB. Re-run it whenever the raw dataset
changes:

```bash
node scripts/build-data.mjs
```

The CI workflow re-runs this script before every deploy, so the published
dashboard always reflects `data/raw/child_iq_master.csv`.

## Dashboard

Built with Vite + React + TypeScript. No charting library — every chart is a
hand-rolled, accessible inline SVG component, chosen to avoid generic
Excel-style bar/pie/donut charts in favor of forms suited to each question:

| Chart | Form |
|---|---|
| Flynn effect over time | Line chart with a ±1 SD band |
| Predictor ranking | Diverging lollipop chart |
| Predictor inter-relationships | Correlation heatmap matrix |
| Variable shape | Smoothed density (KDE) curve |
| Category comparison | Cleveland dot plot vs. population mean |
| Risk-factor effect size | Dumbbell chart |
| Parent IQ vs. child IQ | Scatter plot with marginal distributions + trend line |

**Design system:** skinned with [Atlassian Design System](https://atlassian.design)
tokens (`@atlaskit/tokens`) for surfaces, ink, and the 8-hue categorical chart
palette, validated for CVD-safe adjacency and contrast against both light and
dark chart surfaces. Icons from [Lucide](https://lucide.dev). Light/dark theme
follows the OS setting with a manual toggle.

## Profile builder — the scoring engine

The "where do I sit" number is a transparent composite index, computed
entirely in the browser (`src/frontend/src/lib/profile.ts`) from whichever
fields a visitor chooses to answer — nothing is sent anywhere.

- Categorical/binary fields contribute their dataset group-mean deviation
  from the population mean.
- Numeric fields contribute a **standardized multiple-regression
  coefficient**, not a raw correlation — coefficients are solved once at
  build time (`scripts/build-data.mjs`, Gauss-Jordan matrix inversion over
  the predictor correlation matrix) so that overlap between correlated
  predictors (e.g. maternal education, home stimulation, and nutrition all
  partly tracking the same socioeconomic status) is only counted once. A
  naive sum of each field's own correlation overstates the combined effect
  by roughly 38% on this dataset.
- Each field's z-score is clamped to ±4 SD before it's applied. Sliders are
  intentionally widened past the dataset's typical range so real answers
  outside the norm (e.g. multi-year breastfeeding) aren't clipped, but a
  linear model fit on this data has no business extrapolating a raw z-score
  in the double digits — the clamp keeps the wider slider UX honest without
  producing an implausible score.
- The index deliberately excludes parental IQ and other unmeasured traits —
  the strongest individual predictors in the dataset — so it will rarely
  reach the extremes a real IQ test could. This trade-off, and its cost, is
  disclosed on the page itself (see "Why variable selection matters").

## Sources & citations

In-page research notes (`AcademicNote`) and the "Further reading" list
(`ReadingList.tsx`) cite real, published sources for the claims made about
population statistics, self-assessment, data visualization, and child
development — linked via `doi.org`. Two personal research-reference
documents used while drafting that copy live in `data/raw/` but are
gitignored and not published, since they contain mirror links alongside the
citations; only the extracted citation metadata (author, year, title, venue,
DOI) is used in the app.

## License

Code: MIT, see `LICENSE`. Dataset: synthetic, released by its author on
Kaggle for research/educational use — see the dataset page for terms.
