import { useMemo, useState } from "react";
import { Baby, Github, Users, Brain, TrendingUp, ShieldCheck } from "lucide-react";
import { useJson } from "./lib/useJson";
import { COLUMN_LABELS, CATEGORY_ORDERS, prettyKey } from "./lib/labels";
import {
  computeScore,
  emptyProfile,
  percentileFromDistribution,
  type Profile,
  type VariableStats,
} from "./lib/profile";
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
import { SectionHeader } from "./components/SectionHeader";
import { DisclaimerCallout } from "./components/DisclaimerCallout";
import { ProfileBuilder } from "./components/ProfileBuilder";
import { PositionSummary } from "./components/PositionSummary";
import { FactorSplit } from "./components/FactorSplit";

import { CausalFlowChart } from "./charts/CausalFlowChart";
import { FlynnEffectChart } from "./charts/FlynnEffectChart";
import { LollipopChart } from "./charts/LollipopChart";
import { DensityChart } from "./charts/DensityChart";
import { DotPlotChart } from "./charts/DotPlotChart";
import { DumbbellChart, type DumbbellRow } from "./charts/DumbbellChart";
import { CorrelationHeatmap } from "./charts/CorrelationHeatmap";
import { ScatterWithMargins } from "./charts/ScatterWithMargins";

import "./styles/app.css";

const CATEGORY_VARS = ["household_income_bracket", "early_education", "iodine_status", "lead_exposure", "prenatal_care"] as const;
const PROFILE_CATEGORY_VARS = new Set(["household_income_bracket", "early_education", "prenatal_care"]);
const SCATTER_VARS = ["mother_iq", "father_iq", "parental_ses", "home_stimulation_score"] as const;

const BINARY_FACTORS: { key: keyof ByBinary; label: string }[] = [
  { key: "two_parent_household", label: "Two-parent household" },
  { key: "maternal_smoking_pregnancy", label: "Maternal smoking" },
  { key: "alcohol_exposure", label: "Prenatal alcohol exposure" },
  { key: "preterm", label: "Preterm birth" },
  { key: "low_birth_weight", label: "Low birth weight" },
];

function hasSelection(p: Profile): boolean {
  return (
    Object.keys(p.categorical).length > 0 ||
    Object.keys(p.binary).length > 0 ||
    Object.keys(p.numeric).length > 0
  );
}

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
  const variableStats = useJson<VariableStats>("variable_stats.json");

  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [categoryVar, setCategoryVar] = useState<(typeof CATEGORY_VARS)[number]>("household_income_bracket");
  const [scatterVar, setScatterVar] = useState<(typeof SCATTER_VARS)[number]>("mother_iq");

  const profileHasSelection = hasSelection(profile);

  const scoreResult = useMemo(() => {
    if (!overview || !byCategory || !byBinary || !correlations || !variableStats) return null;
    return computeScore(profile, { overview, byCategory, byBinary, correlations, variableStats });
  }, [profile, overview, byCategory, byBinary, correlations, variableStats]);

  const percentile = useMemo(() => {
    if (!scoreResult || !distributions) return 50;
    return percentileFromDistribution(scoreResult.score, distributions.child_iq);
  }, [scoreResult, distributions]);

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

  const markerKey =
    PROFILE_CATEGORY_VARS.has(categoryVar) ? profile.categorical[categoryVar as "household_income_bracket" | "early_education" | "prenatal_care"] : undefined;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">
          <Baby size={26} strokeWidth={2} />
          <div>
            <h1>Baby Boom</h1>
            <p>An educational look at child development, not a diagnostic tool</p>
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
        <section className="hero">
          <div className="hero-eyebrow">A public data-education experience</div>
          <h1>Where do you sit among 50,000 childhoods?</h1>
          <p>
            Explore a synthetic research dataset of 50,000 simulated children to see how family background,
            pregnancy, and early environment relate to a single narrow measure — a childhood IQ score. Build a
            rough profile of your own background below, or just explore the population as a whole.
          </p>
        </section>

        <DisclaimerCallout>
          <strong>This is not an assessment of you or anyone else.</strong> The dataset is entirely synthetic —
          generated to resemble patterns reported in developmental research, not drawn from real children. IQ is
          one narrow, imperfect measure of cognitive ability, not a measure of worth or potential. Nothing you
          enter here is stored, sent anywhere, or used for anything beyond this page.
        </DisclaimerCallout>

        {/* ---------------- 01 — Where do I sit? ---------------- */}
        <SectionHeader
          number="01"
          title="Where do I sit?"
          lede="Answer as many or as few questions as you like — the population average fills in anything you skip."
        />

        <div className="chart-grid-2">
          <ChartCard title="Build a rough profile" subtitle="Based on your own background, growing up">
            <ProfileBuilder profile={profile} onChange={setProfile} onReset={() => setProfile(emptyProfile())} />
          </ChartCard>

          <ChartCard
            title={profileHasSelection ? "Where this profile sits" : "Where the population sits"}
            subtitle="A transparent index built from group averages for the factors you selected — not a prediction"
          >
            {scoreResult && (
              <PositionSummary
                hasAnySelection={profileHasSelection}
                score={scoreResult.score}
                percentile={percentile}
                contributions={scoreResult.contributions}
              />
            )}
            {overview && distributions && scoreResult && (
              <div style={{ marginTop: 18 }}>
                <DensityChart
                  bins={distributions.child_iq}
                  markerValue={scoreResult.score}
                  markerLabel={profileHasSelection ? "You" : "Average"}
                />
              </div>
            )}
          </ChartCard>
        </div>

        {/* ---------------- 02 — What's associated with this? ---------------- */}
        <SectionHeader
          number="02"
          title="What's associated with this?"
          lede="A synthetic population lets us trace, transparently, how these factors relate to each other and to the outcome measure — without any real child's data."
        />

        {overview && correlations && byBinary && (
          <ChartCard
            title="How the factors flow into child IQ"
            subtitle="A causal pathway from starting conditions to measured outcome — particles trace the flow continuously"
            footnote="Sublabels are computed from this dataset: Pearson r vs. child IQ, or the mean-IQ gap for preterm birth."
          >
            <CausalFlowChart
              subtitles={{
                A: correlations.find((c) => c.column === "parental_ses")
                  ? `SES r=${correlations.find((c) => c.column === "parental_ses")!.r.toFixed(2)}`
                  : "…",
                B: "Iodine · smoking · care",
                D: correlations.find((c) => c.column === "home_stimulation_score")
                  ? `Stimulation r=${correlations.find((c) => c.column === "home_stimulation_score")!.r.toFixed(2)}`
                  : "…",
                C: (() => {
                  const pt = byBinary.preterm;
                  const t = pt?.find((s) => s.key === true);
                  const f = pt?.find((s) => s.key === false);
                  return t && f ? `Preterm ${(t.mean - f.mean).toFixed(1)} IQ pts` : "…";
                })(),
                E: overview ? `mean ${overview.iq.mean.toFixed(0)}` : "…",
                F: overview ? `${(overview.highPotentialRate * 100).toFixed(1)}% top-decile` : "…",
              }}
            />
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

        {overview && byCategory && (
          <ChartCard
            title="Category effects on IQ"
            subtitle="Group mean IQ vs. the population mean — your selection (if any) is marked"
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
              markerKey={markerKey}
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

        {/* ---------------- 03 — What can be changed? ---------------- */}
        <SectionHeader
          number="03"
          title="What can be changed?"
          lede="The strongest associations in this dataset — genetics, SES, birth history — are also the ones nobody can act on after the fact. The smaller, modifiable ones are where real intervention happens."
        />

        {correlations && (
          <ChartCard
            title="Fixed history vs. shapeable environment"
            subtitle="Same dataset, split by whether a caregiver could still influence the factor today"
          >
            <FactorSplit correlations={correlations} />
          </ChartCard>
        )}

        <DisclaimerCallout>
          Correlation is not causation, and every association above is diluted by this dataset's substantial
          random component — real children's outcomes are shaped by far more than any dataset can capture. Treat
          this as an illustration of how developmental research findings tend to look in aggregate, not as
          guidance for any individual child or family.
        </DisclaimerCallout>

        {/* ---------------- appendix: about the dataset ---------------- */}
        <SectionHeader number="—" title="About this dataset" lede="For the curious: methodology, validation, and the full column reference." />

        {overview && (
          <section className="stat-tile-row">
            <StatTile icon={Users} label="Simulated children" value={overview.n.toLocaleString()} sub={`born ${overview.yearRange[0]}–${overview.yearRange[1]}`} />
            <StatTile icon={Brain} label="Mean child IQ" value={overview.iq.mean.toFixed(1)} sub={`SD ${overview.iq.sd.toFixed(1)} · median ${overview.iq.median.toFixed(0)}`} />
            <StatTile icon={TrendingUp} label="Top-decile potential" value={`${(overview.highPotentialRate * 100).toFixed(1)}%`} sub="IQ in top 10%" />
            <StatTile icon={ShieldCheck} label="Preterm births" value={`${(overview.pretermRate * 100).toFixed(1)}%`} sub={`${(overview.lowBirthWeightRate * 100).toFixed(1)}% low birth weight`} />
          </section>
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
