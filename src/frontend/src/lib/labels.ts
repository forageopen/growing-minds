export const COLUMN_LABELS: Record<string, string> = {
  mother_iq: "Mother IQ",
  father_iq: "Father IQ",
  parental_ses: "Parental SES",
  maternal_education_years: "Maternal education (yrs)",
  maternal_age_at_birth: "Maternal age at birth",
  gestational_age_weeks: "Gestational age",
  birth_weight_g: "Birth weight",
  breastfed_months: "Breastfed (months)",
  home_stimulation_score: "Home stimulation score",
  books_in_home: "Books in home",
  screen_hours_daily: "Screen time (hrs/day)",
  nutrition_quality: "Nutrition quality",
  adverse_childhood_experiences: "Adverse childhood experiences",
  child_iq: "Child IQ",
  household_income_bracket: "Household income",
  iodine_status: "Prenatal iodine status",
  prenatal_care: "Prenatal care",
  lead_exposure: "Lead exposure",
  early_education: "Early education",
  two_parent_household: "Two-parent household",
  maternal_smoking_pregnancy: "Maternal smoking",
  alcohol_exposure: "Prenatal alcohol exposure",
  preterm: "Preterm birth",
  low_birth_weight: "Low birth weight",
};

export const CATEGORY_ORDERS: Record<string, string[]> = {
  household_income_bracket: ["very_low", "low", "middle", "high", "very_high"],
  iodine_status: ["deficient", "mild_low", "adequate"],
  prenatal_care: ["none", "some", "regular"],
  lead_exposure: ["low", "moderate", "elevated"],
  early_education: ["none", "some_preschool", "quality_preschool"],
};

export function prettyKey(key: string): string {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

// Which numeric predictors (from correlations.json) describe something a
// caregiver could still influence for a child today, versus something that
// is already fixed by the time anyone could read this page. Used only for
// the "What can change?" framing — not a claim that every "fixed" factor is
// immutable in general, only that it's already settled for a given child.
export const MODIFIABLE_COLUMNS = new Set([
  "home_stimulation_score",
  "books_in_home",
  "screen_hours_daily",
  "nutrition_quality",
  "adverse_childhood_experiences",
]);

export const FIXED_COLUMNS = new Set([
  "mother_iq",
  "father_iq",
  "parental_ses",
  "maternal_education_years",
  "maternal_age_at_birth",
  "gestational_age_weeks",
  "birth_weight_g",
  "breastfed_months",
]);
