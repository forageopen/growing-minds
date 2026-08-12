# Growing Minds

An interactive dashboard exploring genetic and environmental predictors of
child IQ, built on a 50,000-child synthetic research dataset.

**Live dashboard:** https://forageopen.github.io/Baby-Boom/

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
  processed/            typed data dictionary, validation report
scripts/
  build-data.mjs        validates the raw CSV, emits dashboard-ready JSON
src/frontend/
  public/data/          precomputed aggregates the dashboard fetches (no
                         client-side parsing of the 50k-row CSV)
  src/
    charts/              hand-built SVG chart components
    components/          shared UI (cards, stat tiles, tables, tooltips)
    lib/                 scales, stats (KDE, linear regression), data hooks
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

## License

Code: MIT, see `LICENSE`. Dataset: synthetic, released by its author on
Kaggle for research/educational use — see the dataset page for terms.
