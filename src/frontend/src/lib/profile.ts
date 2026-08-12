import type { ByBinary, ByCategory, CorrelationEntry, Distributions, Overview } from "./types";

export type VariableStats = Record<string, { mean: number; sd: number }>;

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
  },
  {
    id: "maternal_smoking_pregnancy",
    group: "pregnancy",
    question: "As far as you know, did your mother smoke during pregnancy?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
    modifiable: false,
  },
  {
    id: "alcohol_exposure",
    group: "pregnancy",
    question: "As far as you know, was there prenatal alcohol exposure?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
    modifiable: false,
  },
  {
    id: "preterm",
    group: "pregnancy",
    question: "Were you born preterm (before 37 weeks)?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
    modifiable: false,
  },
];

export const NUMERIC_FIELDS: NumericFieldDef[] = [
  {
    id: "maternal_education_years",
    group: "family",
    question: "About how many years of education did your mother complete?",
    min: 0,
    max: 20,
    step: 1,
    unit: " yrs",
    modifiable: false,
  },
  {
    id: "maternal_age_at_birth",
    group: "family",
    question: "About how old was your mother when you were born?",
    min: 15,
    max: 45,
    step: 1,
    unit: " yrs",
    modifiable: false,
  },
  {
    id: "breastfed_months",
    group: "pregnancy",
    question: "About how many months were you breastfed, if known?",
    min: 0,
    max: 24,
    step: 1,
    unit: " mo",
    modifiable: false,
  },
  {
    id: "home_stimulation_score",
    group: "environment",
    question: "How much reading, talking, and learning activity was in your home?",
    min: 0,
    max: 100,
    step: 5,
    modifiable: true,
  },
  {
    id: "books_in_home",
    group: "environment",
    question: "About how many books were in your home growing up?",
    min: 0,
    max: 300,
    step: 10,
    modifiable: true,
  },
  {
    id: "screen_hours_daily",
    group: "environment",
    question: "About how many hours of screen time did you have per day?",
    min: 0,
    max: 8,
    step: 0.5,
    unit: " hrs",
    modifiable: true,
  },
  {
    id: "nutrition_quality",
    group: "environment",
    question: "How would you rate the quality of your childhood nutrition?",
    min: 0,
    max: 10,
    step: 1,
    modifiable: true,
  },
  {
    id: "adverse_childhood_experiences",
    group: "environment",
    question: "How many significant adverse experiences did you go through? (optional, private — nothing leaves your browser)",
    min: 0,
    max: 10,
    step: 1,
    modifiable: true,
  },
];

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
  correlations: CorrelationEntry[];
  variableStats: VariableStats;
}

export interface ScoreResult {
  score: number;
  percentile: number;
  contributions: { label: string; delta: number }[];
}

function correlationFor(correlations: CorrelationEntry[], column: string): number {
  return correlations.find((c) => c.column === column)?.r ?? 0;
}

export function computeScore(profile: Profile, inputs: ScoreInputs): ScoreResult {
  const { overview, byCategory, byBinary, correlations, variableStats } = inputs;
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
    if (value === undefined || !varStats || varStats.sd === 0) continue;
    const r = correlationFor(correlations, field.id);
    const z = (value - varStats.mean) / varStats.sd;
    const delta = z * r * popSd;
    score += delta;
    contributions.push({ label: field.question, delta });
  }

  contributions.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return { score, percentile: 50, contributions };
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
