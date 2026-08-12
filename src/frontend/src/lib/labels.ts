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
