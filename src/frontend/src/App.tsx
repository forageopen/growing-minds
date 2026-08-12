import { useState } from "react";
import { Baby, Brain, Github, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { useJson } from "./lib/useJson";
import { COLUMN_LABELS, CATEGORY_ORDERS, prettyKey } from "./lib/labels";
import type {
  ByBinary,
  ByCategory,
  CorrelationEntry,
  DictionaryEntry,
  Distributions,
  GroupStat,
  Overview,
  ScatterPoint,
  ValidationReport,
} from "./lib/types";

import { StatTile } from "./components/StatTile";
import { ChartCard } from "./components/ChartCard";
import { ThemeToggle } from "./components/ThemeToggle";
import { DictionaryTable } from "./components/DictionaryTable";

import { CausalFlowChart } from "./charts/CausalFlowChart";
import { FlynnEffectChart } from "./charts/FlynnEffectChart";
import { LollipopChart } from "./charts/LollipopChart";
import { DensityChart } from "./charts/DensityChart";
import { DotPlotChart } from "./charts/DotPlotChart";
import { DumbbellChart, type DumbbellRow } from "./charts/DumbbellChart";
import { CorrelationHeatmap } from "./charts/CorrelationHeatmap";
import { ScatterWithMargins } from "./charts/ScatterWithMargins";

import "./styles/app.css";

const DENSITY_VARS = ["child_iq", "mother_iq", "father_iq", "parental_ses", "home_stimulation_score", "screen_hours_daily"] as const;
const CATEGORY_VARS = ["household_income_bracket", "early_education", "iodine_status", "lead_exposure", "prenatal_care"] as const;
const SCATTER_VARS = ["mother_iq", "father_iq", "parental_ses", "home_stimulation_score"] as const;

const BINARY_FACTORS: { key: keyof ByBinary; label: string }[] = [
  { key: "two_parent_household", label: "Two-parent household" },
  { key: "maternal_smoking_pregnancy", label: "Maternal smoking" },
  { key: "alcohol_exposure", label: "Prenatal alcohol exposure" },
  { key: "preterm", label: "Preterm birth" },
  { key: "low_birth_weight", label: "Low birth weight" },
];

export default function App() {
  const overview = useJson<Overview>("overview.json");
  const distributions = useJson<Distributions>("distributions.json");
  const flynnEffect = useJson<GroupStat[]>("flynn_effect.json");
  const byCategory = useJson<ByCategory>("by_category.json");
  const byBinary = useJson<ByBinary>("by_binary.json");
  const correlations = useJson<CorrelationEntry[]>("correlations.json");
  const correlationMatrix = useJson<{ variables: string[]; values: number[][] }>("correlation_matrix.json");
  const scatterSample = useJson<ScatterPoint[]>("scatter_sample.json");
  const dictionary = useJson<DictionaryEntry[]>("dictionary.json");
  const validation = useJson<ValidationReport>("validation.json");

  const [densityVar, setDensityVar] = useState<(typeof DENSITY_VARS)[number]>("child_iq");
  const [categoryVar, setCategoryVar] = useState<(typeof CATEGORY_VARS)[number]>("household_income_bracket");
  const [scatterVar, setScatterVar] = useState<(typeof SCATTER_VARS)[number]>("mother_iq");

  const corrFor = (col: string) => correlations?.find((c) => c.column === col)?.r;
  const pretermStats = byBinary?.preterm;
  const pretermGap =
    pretermStats && pretermStats.find((s) => s.key === true) && pretermStats.find((s) => s.key === false)
      ? pretermStats.find((s) => s.key === true)!.mean - pretermStats.find((s) => s.key === false)!.mean
      : undefined;

  const flowSubtitles = {
    A: corrFor("parental_ses") !== undefined ? `SES r=${corrFor("parental_ses")!.toFixed(2)}` : "…",
    B: "Iodine · smoking · care",
    D: corrFor("home_stimulation_score") !== undefined ? `Stimulation r=${corrFor("home_stimulation_score")!.toFixed(2)}` : "…",
    C: pretermGap !== undefined ? `Preterm ${pretermGap.toFixed(1)} IQ pts` : "…",
    E: overview ? `mean ${overview.iq.mean.toFixed(0)}` : "…",
    F: overview ? `${(overview.highPotentialRate * 100).toFixed(1)}% top-decile` : "…",
  } as const;

  const dumbbellRows: DumbbellRow[] = byBinary
    ? BINARY_FACTORS.map(({ key, label }) => {
        const stats = byBinary[key as string];
        return {
          label,
          absent: stats?.find((s) => s.key === "false" || s.key === false || s.key === "0"),
          present: stats?.find((s) => s.key === "true" || s.key === true || s.key === "1"),
        };
      })
    : [];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">
          <Baby size={26} strokeWidth={2} />
          <div>
            <h1>Baby Boom</h1>
            <p>Genetic &amp; environmental predictors of child IQ</p>
          </div>
        </div>
        <div className="app-header-actions">
          <ThemeToggle />
          <a
            className="icon-button"
            href="https://github.com/forageopen/Baby-Boom"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            title="View source on GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      <main className="app-main">
        {overview && (
          <section className="stat-tile-row">
            <StatTile icon={Users} label="Children in study" value={overview.n.toLocaleString()} sub={`born ${overview.yearRange[0]}–${overview.yearRange[1]}`} />
            <StatTile icon={Brain} label="Mean child IQ" value={overview.iq.mean.toFixed(1)} sub={`SD ${overview.iq.sd.toFixed(1)} · median ${overview.iq.median.toFixed(0)}`} />
            <StatTile icon={TrendingUp} label="Top-decile potential" value={`${(overview.highPotentialRate * 100).toFixed(1)}%`} sub="IQ in top 10%" />
            <StatTile icon={ShieldCheck} label="Preterm births" value={`${(overview.pretermRate * 100).toFixed(1)}%`} sub={`${(overview.lowBirthWeightRate * 100).toFixed(1)}% low birth weight`} />
          </section>
        )}

        {overview && correlations && byBinary && (
          <ChartCard
            title="How the factors flow into child IQ"
            subtitle="A causal pathway from starting conditions to measured outcome — particles trace the flow continuously"
            footnote="Sublabels are computed from this dataset: Pearson r vs. child IQ, or the mean-IQ gap for preterm birth."
          >
            <CausalFlowChart subtitles={flowSubtitles} />
          </ChartCard>
        )}

        {flynnEffect && (
          <ChartCard
            title="The Flynn effect"
            subtitle="Mean child IQ by birth year — the generational rise (and plateau) in measured IQ, ±1 SD band"
          >
            <FlynnEffectChart data={flynnEffect} />
          </ChartCard>
        )}

        <div className="chart-grid-2">
          {correlations && (
            <ChartCard
              title="Strongest predictors of child IQ"
              subtitle="Pearson correlation of each factor with child IQ — dot position and color encode direction and strength"
            >
              <LollipopChart data={correlations} labels={COLUMN_LABELS} />
            </ChartCard>
          )}

          {correlationMatrix && (
            <ChartCard
              title="How predictors relate to each other"
              subtitle="Pairwise correlation matrix across key numeric factors"
            >
              <CorrelationHeatmap variables={correlationMatrix.variables} values={correlationMatrix.values} labels={COLUMN_LABELS} />
            </ChartCard>
          )}
        </div>

        {distributions && (
          <ChartCard
            title="Distribution explorer"
            subtitle="Smoothed density curve — shape of each variable across all 50,000 children"
            actions={
              <select value={densityVar} onChange={(e) => setDensityVar(e.target.value as typeof densityVar)} className="select-input">
                {DENSITY_VARS.map((v) => (
                  <option key={v} value={v}>{COLUMN_LABELS[v] ?? prettyKey(v)}</option>
                ))}
              </select>
            }
          >
            <DensityChart bins={distributions[densityVar]} />
          </ChartCard>
        )}

        {overview && byCategory && (
          <ChartCard
            title="Category effects on IQ"
            subtitle="Group mean IQ vs. the population mean — dot plot sorted low to high"
            actions={
              <select value={categoryVar} onChange={(e) => setCategoryVar(e.target.value as typeof categoryVar)} className="select-input">
                {CATEGORY_VARS.map((v) => (
                  <option key={v} value={v}>{COLUMN_LABELS[v] ?? prettyKey(v)}</option>
                ))}
              </select>
            }
          >
            <DotPlotChart
              data={byCategory[categoryVar]}
              populationMean={overview.iq.mean}
              order={CATEGORY_ORDERS[categoryVar]}
              labelFor={prettyKey}
            />
          </ChartCard>
        )}

        {dumbbellRows.length > 0 && (
          <ChartCard
            title="Risk-factor gaps"
            subtitle="Mean child IQ with vs. without each exposure — the line length is the effect size"
          >
            <DumbbellChart rows={dumbbellRows} presentLabel="present" absentLabel="absent" />
          </ChartCard>
        )}

        {scatterSample && (
          <ChartCard
            title="Parent IQ &amp; home environment vs. child IQ"
            subtitle="1,500-child sample with marginal distributions on each axis and a fitted trend line"
            actions={
              <select value={scatterVar} onChange={(e) => setScatterVar(e.target.value as typeof scatterVar)} className="select-input">
                {SCATTER_VARS.map((v) => (
                  <option key={v} value={v}>{COLUMN_LABELS[v] ?? prettyKey(v)}</option>
                ))}
              </select>
            }
          >
            <ScatterWithMargins points={scatterSample} xKey={scatterVar} xLabel={COLUMN_LABELS[scatterVar]} />
          </ChartCard>
        )}

        {dictionary && (
          <ChartCard title="Data dictionary" subtitle="All 30 columns in the source dataset">
            <DictionaryTable entries={dictionary} />
          </ChartCard>
        )}

        <footer className="app-footer">
          <p>
            Synthetic research dataset —{" "}
            <a href="https://www.kaggle.com/datasets/sergionefedov/child-iq-genes-environment" target="_blank" rel="noreferrer">
              Child IQ: Genes &amp; Environment
            </a>{" "}
            (Kaggle, sergionefedov).
            {validation && (
              <> Validated {overview?.n.toLocaleString()} rows, {validation.malformedRows + validation.duplicateIds === 0 ? "no missing values or duplicate ids" : "see validation report"} as of {validation.generatedAt}.</>
            )}
          </p>
        </footer>
      </main>
    </div>
  );
}
