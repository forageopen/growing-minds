import type { ByBinary, ByCategory, Distributions, Overview } from "./types";

export type VariableStats = Record<string, { mean: number; sd: number }>;

export interface ProfileRegression {
  variables: string[];
  betas: number[];
  marginalR: number[];
  modelR2: number;
}

// Every field a visitor can set to build their own profile. Deliberately
// excludes anything nobody could plausibly know about their own childhood
// (iodine status, lead exposure, exact gestational age) and anything that
// would ask a stranger to guess a parent's IQ — SES/education proxies stand
// in for that instead, same as real developmental research uses them.
export type CategoricalFieldId = "household_income_bracket" | "early_education" | "prenatal_care";
export type BinaryFieldId = "two_parent_household" | "maternal_smoking_pregnancy" | "alcohol_exposure" | "preterm";
export type NumericFieldId =
  | "maternal_education_years"
  | "maternal_age_at_birth"
  | "home_stimulation_score"
  | "books_in_home"
  | "screen_hours_daily"
  | "nutrition_quality"
  | "adverse_childhood_experiences"
  | "breastfed_months";

export interface Profile {
  categorical: Partial<Record<CategoricalFieldId, string>>;
  binary: Partial<Record<BinaryFieldId, boolean>>;
  numeric: Partial<Record<NumericFieldId, number>>;
}

export interface CategoricalFieldDef {
  id: CategoricalFieldId;
  group: "family" | "pregnancy" | "environment";
  question: string;
  options: { value: string; label: string }[];
  modifiable: boolean;
}

export interface BinaryFieldDef {
  id: BinaryFieldId;
  group: "family" | "pregnancy" | "environment";
  question: string;
  yesLabel: string;
  noLabel: string;
  modifiable: boolean;
  /** which value (true/false) is associated with the higher child_iq group mean */
  bestValue: boolean;
}

export interface NumericFieldDef {
  id: NumericFieldId;
  group: "family" | "pregnancy" | "environment";
  question: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  modifiable: boolean;
  /** true if `max` is an open-ended "or more" bucket rather than a hard ceiling */
  openEnded?: boolean;
  /** which end of the slider correlates with higher child_iq */
  bestDirection: "max" | "min";
}

export const CATEGORICAL_FIELDS: CategoricalFieldDef[] = [
  {
    id: "household_income_bracket",
    group: "family",
    question: "How would you describe your family's financial situation growing up?",
    modifiable: false,
    options: [
      { value: "very_low", label: "Very low income" },
      { value: "low", label: "Low income" },
      { value: "middle", label: "Middle income" },
      { value: "high", label: "High income" },
      { value: "very_high", label: "Very high income" },
    ],
  },
  {
    id: "prenatal_care",
    group: "pregnancy",
    question: "How would you describe the prenatal care available to your mother?",
    modifiable: false,
    options: [
      { value: "none", label: "Little or none" },
      { value: "some", label: "Some" },
      { value: "regular", label: "Regular" },
    ],
  },
  {
    id: "early_education",
    group: "environment",
    question: "What early-childhood education did you have before school?",
    modifiable: true,
    options: [
      { value: "none", label: "None" },
      { value: "some_preschool", label: "Some preschool" },
      { value: "quality_preschool", label: "Quality preschool" },
    ],
  },
];

export const BINARY_FIELDS: BinaryFieldDef[] = [
  {
    id: "two_parent_household",
    group: "family",
    question: "Did you grow up in a two-parent household?",
    yesLabel: "Yes",
    noLabel: "No",
    modifiable: false,
    bestValue: true,
  },
  {
    id: "maternal_smoking_pregnancy",
    group: "pregnancy",
    question: "As far as you know, did your mother smoke during pregnancy?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
    modifiable: false,
    bestValue: false,
  },
  {
    id: "alcohol_exposure",
    group: "pregnancy",
    question: "As far as you know, was there prenatal alcohol exposure?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
    modifiable: false,
    bestValue: false,
  },
  {
    id: "preterm",
    group: "pregnancy",
    question: "Were you born preterm (before 37 weeks)?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
    modifiable: false,
    bestValue: false,
  },
];

export const NUMERIC_FIELDS: NumericFieldDef[] = [
  {
    id: "maternal_education_years",
    group: "family",
    question: "About how many years of education did your mother complete?",
    min: 0,
    max: 24,
    step: 1,
    unit: " yrs",
    modifiable: false,
    openEnded: true,
    bestDirection: "max",
  },
  {
    id: "maternal_age_at_birth",
    group: "family",
    question: "About how old was your mother when you were born?",
    min: 15,
    max: 50,
    step: 1,
    unit: " yrs",
    modifiable: false,
    openEnded: true,
    bestDirection: "max",
  },
  {
    id: "breastfed_months",
    group: "pregnancy",
    question: "About how many months were you breastfed, if known?",
    min: 0,
    max: 60,
    step: 1,
    unit: " mo",
    modifiable: false,
    openEnded: true,
    bestDirection: "max",
  },
  {
    id: "home_stimulation_score",
    group: "environment",
    question: "How much reading, talking, and learning activity was in your home?",
    min: 0,
    max: 100,
    step: 5,
    modifiable: true,
    bestDirection: "max",
  },
  {
    id: "books_in_home",
    group: "environment",
    question: "About how many books were in your home growing up?",
    min: 0,
    max: 500,
    step: 10,
    modifiable: true,
    openEnded: true,
    bestDirection: "max",
  },
  {
    id: "screen_hours_daily",
    group: "environment",
    question: "About how many hours of screen time did you have per day?",
    min: 0,
    max: 12,
    step: 0.5,
    unit: " hrs",
    modifiable: true,
    openEnded: true,
    bestDirection: "min",
  },
  {
    id: "nutrition_quality",
    group: "environment",
    question: "How would you rate the quality of your childhood nutrition?",
    min: 0,
    max: 10,
    step: 1,
    modifiable: true,
    bestDirection: "max",
  },
  {
    id: "adverse_childhood_experiences",
    group: "environment",
    question: "How many significant adverse experiences did you go through? (optional, private — nothing leaves your browser)",
    min: 0,
    max: 10,
    step: 1,
    modifiable: true,
    bestDirection: "min",
  },
];

/** The best possible profile within this tool's own field set — used only to
 * demonstrate, transparently, the index's ceiling given which variables it
 * was built to ask about. */
export function buildIdealProfile(): Profile {
  const categorical: Profile["categorical"] = {};
  for (const field of CATEGORICAL_FIELDS) {
    categorical[field.id] = field.options[field.options.length - 1].value;
  }
  const binary: Profile["binary"] = {};
  for (const field of BINARY_FIELDS) {
    binary[field.id] = field.bestValue;
  }
  const numeric: Profile["numeric"] = {};
  for (const field of NUMERIC_FIELDS) {
    numeric[field.id] = field.bestDirection === "max" ? field.max : field.min;
  }
  return { categorical, binary, numeric };
}

export const GROUP_LABELS: Record<CategoricalFieldDef["group"], string> = {
  family: "Family background",
  pregnancy: "Pregnancy & birth",
  environment: "Early environment & learning",
};

export function emptyProfile(): Profile {
  return { categorical: {}, binary: {}, numeric: {} };
}

interface ScoreInputs {
  overview: Overview;
  byCategory: ByCategory;
  byBinary: ByBinary;
  variableStats: VariableStats;
  regression: ProfileRegression;
}

export interface ScoreResult {
  score: number;
  band: [number, number];
  contributions: { label: string; delta: number }[];
}

/**
 * The composite index used to sum each numeric field's *marginal* correlation
 * with child_iq independently. That double-counts shared variance between
 * correlated predictors (maternal education, home stimulation, and nutrition
 * all partly track the same underlying SES) — the more fields a visitor
 * filled in, the more that overlap got counted twice.
 *
 * Fixed: numeric fields now use standardized multiple-regression coefficients
 * (solved from the predictor correlation matrix — see build-data.mjs) instead
 * of raw correlations, which properly holds the other selected factors
 * constant. Measured on this dataset, that correction is conservative, not
 * generous: naive sum-of-r² overstated the true multiple-R² by about 38%.
 *
 * This index still excludes parental IQ and other unmeasured traits — the
 * strongest individual predictors in the dataset — by design, so it will
 * rarely approach the extremes a real psychometric test can reach. It
 * reflects environmental/SES associations only, never a personal estimate.
 */
export function computeScore(profile: Profile, inputs: ScoreInputs): ScoreResult {
  const { overview, byCategory, byBinary, variableStats, regression } = inputs;
  const popMean = overview.iq.mean;
  const popSd = overview.iq.sd;
  const contributions: { label: string; delta: number }[] = [];
  let score = popMean;

  for (const field of CATEGORICAL_FIELDS) {
    const value = profile.categorical[field.id];
    if (!value) continue;
    const stats = byCategory[field.id]?.find((s) => String(s.key) === value);
    if (!stats) continue;
    const delta = stats.mean - popMean;
    score += delta;
    contributions.push({ label: field.options.find((o) => o.value === value)?.label ?? value, delta });
  }

  for (const field of BINARY_FIELDS) {
    const value = profile.binary[field.id];
    if (value === undefined) continue;
    const stats = byBinary[field.id]?.find((s) => s.key === value);
    if (!stats) continue;
    const delta = stats.mean - popMean;
    score += delta;
    contributions.push({ label: `${field.question} ${value ? field.yesLabel : field.noLabel}`, delta });
  }

  for (const field of NUMERIC_FIELDS) {
    const value = profile.numeric[field.id];
    const varStats = variableStats[field.id];
    const betaIdx = regression.variables.indexOf(field.id);
    if (value === undefined || !varStats || varStats.sd === 0 || betaIdx === -1) continue;
    const beta = regression.betas[betaIdx];
    const z = (value - varStats.mean) / varStats.sd;
    const delta = z * beta * popSd;
    score += delta;
    contributions.push({ label: field.question, delta });
  }

  contributions.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  // A fixed, honest uncertainty band rather than false precision: this
  // dataset's substantial random component (and everything the profile
  // doesn't ask about) dwarfs the selected factors' combined effect.
  const band: [number, number] = [score - 0.5 * popSd, score + 0.5 * popSd];

  return { score, band, contributions };
}

export function percentileFromDistribution(value: number, bins: Distributions["child_iq"]): number {
  const total = bins.reduce((a, b) => a + b.count, 0);
  if (total === 0) return 50;
  let below = 0;
  for (const bin of bins) {
    if (value < bin.x0) continue;
    if (value >= bin.x1) {
      below += bin.count;
    } else {
      const frac = (value - bin.x0) / (bin.x1 - bin.x0 || 1);
      below += bin.count * Math.max(0, Math.min(1, frac));
      break;
    }
  }
  return Math.max(1, Math.min(99, Math.round((below / total) * 100)));
}

export function percentileLabel(p: number): string {
  if (p >= 98) return "top 2%";
  if (p >= 90) return "top 10%";
  if (p >= 75) return "top quarter";
  if (p >= 55) return "somewhat above the middle";
  if (p >= 45) return "near the middle";
  if (p >= 25) return "somewhat below the middle";
  if (p >= 10) return "bottom quarter";
  return "bottom 10%";
}
