export interface Overview {
  n: number;
  iq: { mean: number; sd: number; median: number; min: number; max: number };
  highPotentialRate: number;
  pretermRate: number;
  lowBirthWeightRate: number;
  yearRange: [number, number];
}

export interface HistBin {
  x0: number;
  x1: number;
  count: number;
}

export type Distributions = Record<string, HistBin[]>;

export interface GroupStat {
  key: string | number | boolean;
  mean: number;
  n: number;
  sd: number;
}

export type ByCategory = Record<string, GroupStat[]>;
export type ByBinary = Record<string, GroupStat[]>;

export interface CorrelationEntry {
  column: string;
  r: number;
}

export interface ScatterPoint {
  mother_iq: number;
  father_iq: number;
  parental_ses: number;
  home_stimulation_score: number;
  child_iq: number;
  high_cognitive_potential: boolean;
}

export interface DictionaryEntry {
  column: string;
  type: string;
  description: string;
}

export interface ValidationReport {
  rowCount: number;
  colCount: number;
  malformedRows: number;
  duplicateIds: number;
  missingByCol: Record<string, number>;
  generatedAt: string;
}
