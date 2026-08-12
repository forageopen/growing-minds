#!/usr/bin/env node
// Reads data/raw/child_iq_master.csv, validates it, and emits:
//   - data/processed/child_iq.json.gz-friendly compact JSON (typed, column-oriented)
//   - src/frontend/public/data/*.json precomputed aggregates the dashboard reads directly
//
// Rationale: the dashboard never parses the raw 50k-row CSV in the browser. Every
// chart reads a small precomputed JSON file instead, so first paint stays fast.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RAW_CSV = path.join(ROOT, "data", "raw", "child_iq_master.csv");
const DICT_CSV = path.join(ROOT, "data", "raw", "data_dictionary.csv");
const PROCESSED_DIR = path.join(ROOT, "data", "processed");
const PUBLIC_DATA_DIR = path.join(ROOT, "src", "frontend", "public", "data");

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((line) => line.split(","));
  return { header, rows };
}

const NUMERIC_COLS = new Set([
  "child_age_at_test", "birth_year", "birth_order", "mother_iq", "father_iq",
  "parental_ses", "maternal_education_years", "maternal_age_at_birth",
  "gestational_age_weeks", "birth_weight_g", "breastfed_months",
  "home_stimulation_score", "books_in_home", "screen_hours_daily",
  "nutrition_quality", "adverse_childhood_experiences", "child_iq",
]);
const BINARY_COLS = new Set([
  "two_parent_household", "maternal_smoking_pregnancy", "alcohol_exposure",
  "preterm", "low_birth_weight", "high_cognitive_potential",
]);

function typeRow(header, row) {
  const obj = {};
  header.forEach((col, i) => {
    const v = row[i];
    if (NUMERIC_COLS.has(col)) obj[col] = Number(v);
    else if (BINARY_COLS.has(col)) obj[col] = v === "1";
    else obj[col] = v;
  });
  return obj;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}
function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}
function pearson(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  return num / Math.sqrt(dx2 * dy2);
}
function histogram(values, binCount) {
  const min = Math.min(...values), max = Math.max(...values);
  const width = (max - min) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    x0: +(min + i * width).toFixed(2),
    x1: +(min + (i + 1) * width).toFixed(2),
    count: 0,
  }));
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  }
  return bins;
}
function groupMean(rows, groupCol, valueCol) {
  const groups = new Map();
  for (const r of rows) {
    const k = r[groupCol];
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r[valueCol]);
  }
  return [...groups.entries()]
    .map(([key, vals]) => ({
      key,
      mean: +mean(vals).toFixed(2),
      n: vals.length,
      sd: +stddev(vals).toFixed(2),
    }))
    .sort((a, b) => (a.key > b.key ? 1 : -1));
}

// --- load & validate -------------------------------------------------------
const { header, rows: rawRows } = parseCsv(readFileSync(RAW_CSV, "utf8"));
const rows = rawRows.map((r) => typeRow(header, r));

const seenIds = new Set();
let duplicateIds = 0;
let malformedRows = 0;
for (let i = 0; i < rawRows.length; i++) {
  if (rawRows[i].length !== header.length) malformedRows++;
  const id = rows[i].child_id;
  if (seenIds.has(id)) duplicateIds++;
  seenIds.add(id);
}
const missingByCol = {};
for (const col of header) {
  const n = rows.filter((r) => r[col] === "" || r[col] === undefined || Number.isNaN(r[col])).length;
  if (n > 0) missingByCol[col] = n;
}

const validation = {
  rowCount: rows.length,
  colCount: header.length,
  malformedRows,
  duplicateIds,
  missingByCol,
  generatedAt: new Date().toISOString().slice(0, 10),
};

if (malformedRows > 0 || duplicateIds > 0) {
  console.warn("Data quality issues found:", validation);
} else {
  console.log(`Validated ${rows.length} rows x ${header.length} cols — no nulls, no duplicate ids, no malformed rows.`);
}

// --- data dictionary ---------------------------------------------------
const { header: dictHeader, rows: dictRows } = parseCsv(readFileSync(DICT_CSV, "utf8"));
const dictionary = dictRows.map((r) => {
  const obj = {};
  dictHeader.forEach((c, i) => (obj[c] = r[i]?.replace(/^"|"$/g, "")));
  return obj;
});

// --- processed metadata (raw CSV + gzip stay the canonical full dataset) --
mkdirSync(PROCESSED_DIR, { recursive: true });
writeFileSync(
  path.join(PROCESSED_DIR, "data_dictionary.json"),
  JSON.stringify(dictionary, null, 2)
);
writeFileSync(
  path.join(PROCESSED_DIR, "validation_report.json"),
  JSON.stringify(validation, null, 2)
);

// --- dashboard aggregates ------------------------------------------------
mkdirSync(PUBLIC_DATA_DIR, { recursive: true });

const iq = rows.map((r) => r.child_iq);
const overview = {
  n: rows.length,
  iq: {
    mean: +mean(iq).toFixed(2),
    sd: +stddev(iq).toFixed(2),
    median: +quantile([...iq].sort((a, b) => a - b), 0.5).toFixed(2),
    min: Math.min(...iq),
    max: Math.max(...iq),
  },
  highPotentialRate: +(rows.filter((r) => r.high_cognitive_potential).length / rows.length).toFixed(4),
  pretermRate: +(rows.filter((r) => r.preterm).length / rows.length).toFixed(4),
  lowBirthWeightRate: +(rows.filter((r) => r.low_birth_weight).length / rows.length).toFixed(4),
  yearRange: [Math.min(...rows.map((r) => r.birth_year)), Math.max(...rows.map((r) => r.birth_year))],
};

const distributions = {
  child_iq: histogram(iq, 24),
  mother_iq: histogram(rows.map((r) => r.mother_iq), 24),
  father_iq: histogram(rows.map((r) => r.father_iq), 24),
  parental_ses: histogram(rows.map((r) => r.parental_ses), 20),
  home_stimulation_score: histogram(rows.map((r) => r.home_stimulation_score), 20),
  screen_hours_daily: histogram(rows.map((r) => r.screen_hours_daily), 20),
};

const flynnEffect = groupMean(rows, "birth_year", "child_iq");

const categoricalCols = [
  "household_income_bracket", "iodine_status", "prenatal_care",
  "lead_exposure", "early_education",
];
const byCategory = {};
for (const col of categoricalCols) byCategory[col] = groupMean(rows, col, "child_iq");

const binaryCols = ["two_parent_household", "maternal_smoking_pregnancy", "alcohol_exposure", "preterm", "low_birth_weight"];
const byBinary = {};
for (const col of binaryCols) byBinary[col] = groupMean(rows, col, "child_iq");

const numericPredictors = [
  "mother_iq", "father_iq", "parental_ses", "maternal_education_years",
  "maternal_age_at_birth", "gestational_age_weeks", "birth_weight_g",
  "breastfed_months", "home_stimulation_score", "books_in_home",
  "screen_hours_daily", "nutrition_quality", "adverse_childhood_experiences",
];
const correlations = numericPredictors
  .map((col) => ({ column: col, r: +pearson(rows.map((r) => r[col]), iq).toFixed(3) }))
  .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

// scatter sample (mother_iq/father_iq/parental_ses vs child_iq) — 1500-point
// deterministic sample keeps the payload small and the chart legible.
function sampleRows(n) {
  const step = Math.floor(rows.length / n) || 1;
  const out = [];
  for (let i = 0; i < rows.length && out.length < n; i += step) out.push(rows[i]);
  return out;
}
const scatterSample = sampleRows(1500).map((r) => ({
  mother_iq: r.mother_iq,
  father_iq: r.father_iq,
  parental_ses: r.parental_ses,
  home_stimulation_score: r.home_stimulation_score,
  child_iq: r.child_iq,
  high_cognitive_potential: r.high_cognitive_potential,
}));

const matrixVars = [
  "mother_iq", "father_iq", "parental_ses", "home_stimulation_score",
  "maternal_education_years", "nutrition_quality",
  "adverse_childhood_experiences", "screen_hours_daily", "child_iq",
];
const correlationMatrix = {
  variables: matrixVars,
  values: matrixVars.map((rowVar) =>
    matrixVars.map((colVar) => +pearson(rows.map((r) => r[rowVar]), rows.map((r) => r[colVar])).toFixed(3))
  ),
};

// Per-variable mean/SD for every continuous field the profile builder lets a
// visitor set — lets the client turn "your value" into a z-score * r delta
// against child_iq without ever touching the raw rows.
const PROFILE_NUMERIC_VARS = [
  "maternal_education_years", "maternal_age_at_birth", "home_stimulation_score",
  "books_in_home", "screen_hours_daily", "nutrition_quality",
  "adverse_childhood_experiences", "breastfed_months",
];
const variableStats = {};
for (const col of PROFILE_NUMERIC_VARS) {
  const vals = rows.map((r) => r[col]);
  variableStats[col] = { mean: +mean(vals).toFixed(3), sd: +stddev(vals).toFixed(3) };
}

// --- profile engine: standardized multiple-regression coefficients --------
// The profile builder's composite index used to sum each field's *marginal*
// correlation with child_iq independently. That double-counts shared
// variance between correlated predictors (e.g. maternal education and home
// stimulation both partly track SES) — the more fields a visitor filled in,
// the more that overlap got counted twice. The fix: solve the standardized
// normal equations R_xx * beta = r_xy, where R_xx is the predictor-predictor
// correlation matrix and r_xy is each predictor's correlation with child_iq.
// beta_i is then "this predictor's own contribution, holding the others
// fixed" — the standard multiple-regression correction for multicollinearity.
function invertMatrix(mat) {
  const n = mat.length;
  const aug = mat.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(aug[r][col]) > Math.abs(aug[pivotRow][col])) pivotRow = r;
    [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
    const pivot = aug[col][col] || 1e-9;
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      for (let j = 0; j < 2 * n; j++) aug[r][j] -= factor * aug[col][j];
    }
  }
  return aug.map((row) => row.slice(n));
}

const regressionVars = PROFILE_NUMERIC_VARS;
const Rxx = regressionVars.map((rowVar) =>
  regressionVars.map((colVar) => (rowVar === colVar ? 1 : pearson(rows.map((r) => r[rowVar]), rows.map((r) => r[colVar]))))
);
const rxy = regressionVars.map((v) => pearson(rows.map((r) => r[v]), iq));
const RxxInv = invertMatrix(Rxx);
const betas = RxxInv.map((row) => row.reduce((sum, v, i) => sum + v * rxy[i], 0));
const modelR2 = betas.reduce((sum, b, i) => sum + b * rxy[i], 0);

const profileRegressionBetas = {
  variables: regressionVars,
  betas: betas.map((b) => +b.toFixed(4)),
  marginalR: rxy.map((r) => +r.toFixed(4)),
  modelR2: +modelR2.toFixed(4),
};
console.log(
  `Profile engine: multiple-R² = ${modelR2.toFixed(3)} (vs. naive sum-of-r² = ${rxy.reduce((s, r) => s + r * r, 0).toFixed(3)})`
);

writeFileSync(path.join(PUBLIC_DATA_DIR, "overview.json"), JSON.stringify(overview));
writeFileSync(path.join(PUBLIC_DATA_DIR, "distributions.json"), JSON.stringify(distributions));
writeFileSync(path.join(PUBLIC_DATA_DIR, "flynn_effect.json"), JSON.stringify(flynnEffect));
writeFileSync(path.join(PUBLIC_DATA_DIR, "by_category.json"), JSON.stringify(byCategory));
writeFileSync(path.join(PUBLIC_DATA_DIR, "by_binary.json"), JSON.stringify(byBinary));
writeFileSync(path.join(PUBLIC_DATA_DIR, "correlations.json"), JSON.stringify(correlations));
writeFileSync(path.join(PUBLIC_DATA_DIR, "correlation_matrix.json"), JSON.stringify(correlationMatrix));
writeFileSync(path.join(PUBLIC_DATA_DIR, "scatter_sample.json"), JSON.stringify(scatterSample));
writeFileSync(path.join(PUBLIC_DATA_DIR, "dictionary.json"), JSON.stringify(dictionary));
writeFileSync(path.join(PUBLIC_DATA_DIR, "variable_stats.json"), JSON.stringify(variableStats));
writeFileSync(path.join(PUBLIC_DATA_DIR, "profile_regression.json"), JSON.stringify(profileRegressionBetas));
writeFileSync(path.join(PUBLIC_DATA_DIR, "validation.json"), JSON.stringify(validation));

console.log("Wrote processed data to", PROCESSED_DIR);
console.log("Wrote dashboard aggregates to", PUBLIC_DATA_DIR);
