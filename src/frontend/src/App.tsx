import { useEffect, useMemo, useState } from "react";
import { Baby, Github, Users, Brain, TrendingUp, ShieldCheck } from "lucide-react";
import { useJson } from "./lib/useJson";
import { COLUMN_LABELS, CATEGORY_ORDERS, prettyKey } from "./lib/labels";
import {
  buildIdealProfile,
  computeScore,
  emptyProfile,
  percentileFromDistribution,
  type Profile,
  type ProfileRegression,
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
import { AsciiFlowerToggle } from "./components/AsciiFlowerToggle";
import { AsciiFlowerBackground } from "./components/AsciiFlowerBackground";
import { GlassBlurToggle } from "./components/GlassBlurToggle";
import { DictionaryTable } from "./components/DictionaryTable";
import { SectionHeader } from "./components/SectionHeader";
import { DisclaimerCallout } from "./components/DisclaimerCallout";
import { ProfileBuilder } from "./components/ProfileBuilder";
import { PositionSummary } from "./components/PositionSummary";
import { FactorSplit } from "./components/FactorSplit";
import { Primer } from "./components/Primer";
import { InfoTip } from "./components/InfoTip";
import { VariableSelectionCaseStudy } from "./components/VariableSelectionCaseStudy";
import { AcademicNote } from "./components/AcademicNote";
import { ReadingList } from "./components/ReadingList";
import { ProjectStructure } from "./components/ProjectStructure";

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
  const regression = useJson<ProfileRegression>("profile_regression.json");

  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [categoryVar, setCategoryVar] = useState<(typeof CATEGORY_VARS)[number]>("household_income_bracket");
  const [scatterVar, setScatterVar] = useState<(typeof SCATTER_VARS)[number]>("mother_iq");
  const [asciiBg, setAsciiBg] = useState<boolean>(() => {
    try {
      return localStorage.getItem("growing-minds-ascii-bg") === "on";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle("ascii-bg-on", asciiBg);
    try {
      localStorage.setItem("growing-minds-ascii-bg", asciiBg ? "on" : "off");
    } catch {
      // localStorage unavailable (e.g. private browsing) — theme just won't persist
    }
  }, [asciiBg]);

  const [glassBlur, setGlassBlur] = useState<boolean>(() => {
    try {
      return localStorage.getItem("growing-minds-glass-blur") === "on";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle("glass-on", glassBlur);
    try {
      localStorage.setItem("growing-minds-glass-blur", glassBlur ? "on" : "off");
    } catch {
      // localStorage unavailable (e.g. private browsing) — preference just won't persist
    }
  }, [glassBlur]);

  const profileHasSelection = hasSelection(profile);

  const scoreResult = useMemo(() => {
    if (!overview || !byCategory || !byBinary || !variableStats || !regression) return null;
    return computeScore(profile, { overview, byCategory, byBinary, variableStats, regression });
  }, [profile, overview, byCategory, byBinary, variableStats, regression]);

  const percentile = useMemo(() => {
    if (!scoreResult || !distributions) return 50;
    return percentileFromDistribution(scoreResult.score, distributions.child_iq);
  }, [scoreResult, distributions]);

  const percentileBand = useMemo((): [number, number] => {
    if (!scoreResult || !distributions) return [50, 50];
    return [
      percentileFromDistribution(scoreResult.band[0], distributions.child_iq),
      percentileFromDistribution(scoreResult.band[1], distributions.child_iq),
    ];
  }, [scoreResult, distributions]);

  // Computed live (not hardcoded) so the "Why variable selection matters"
  // case study always reflects the current engine, not a stale test result.
  const idealCeiling = useMemo(() => {
    if (!overview || !byCategory || !byBinary || !variableStats || !regression || !distributions) return null;
    const result = computeScore(buildIdealProfile(), { overview, byCategory, byBinary, variableStats, regression });
    return { score: result.score, percentile: percentileFromDistribution(result.score, distributions.child_iq) };
  }, [overview, byCategory, byBinary, variableStats, regression, distributions]);

  const naiveR2 = regression ? regression.marginalR.reduce((sum, r) => sum + r * r, 0) : 0;

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
      {asciiBg && <AsciiFlowerBackground />}
      <header className="app-header">
        <div className="app-header-title">
          <Baby size={26} strokeWidth={2} />
          <div>
            <h1>Where Do You Sit?</h1>
            <p>Explore your position among 50,000 simulated childhood profiles.</p>
          </div>
        </div>
        <div className="app-header-actions">
          <AsciiFlowerToggle enabled={asciiBg} onToggle={() => setAsciiBg((v) => !v)} />
          <GlassBlurToggle enabled={glassBlur} onToggle={() => setGlassBlur((v) => !v)} />
          <ThemeToggle />
          <a
            className="icon-button"
            href="https://github.com/forageopen/growing-minds"
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
            pregnancy, nutrition, education, and early environment relate to a single narrow measure of cognitive
            performance: a childhood IQ score. Build a rough profile based on your own background below, or
            explore the population as a whole.
          </p>
        </section>

        <DisclaimerCallout>
          <p>
            <strong>This isn't an assessment of you or anyone else.</strong> The dataset is entirely synthetic, and
            nothing you enter here is stored or sent anywhere. IQ is a narrow, imperfect measure — see "About this
            dataset" near the bottom of the page for the full picture on methodology and limits.
          </p>
        </DisclaimerCallout>

        <Primer />

        {/* ---------------- 01 — Where do I sit? ---------------- */}
        <SectionHeader
          number="01"
          title="Where do I sit?"
          lede="Answer as many or as few questions as you like — the population average fills in anything you skip."
        />

        <AcademicNote title="Why show the whole population, not just you">
          <p>
            No single number can describe a childhood, so this page leads with a full picture instead of a
            verdict. Below, you'll see the whole population laid out as a curve, with whatever profile you build
            placed on top of it — never shown by itself.
          </p>
          <p>
            That's not just a design preference: when researchers tested how well people understand population
            statistics, comprehension roughly doubled when a chart kept the whole population visible instead of
            showing only the group being highlighted, and the effect was strongest for people who don't work with
            numbers often (Garcia-Retamero &amp; Galesic, 2010). Seeing the shape of everyone else is what makes
            one person's position mean anything at all.
          </p>
        </AcademicNote>

        <div className="chart-grid-2">
          <ChartCard title="Build a rough profile" subtitle="Based on your own background, growing up">
            <ProfileBuilder profile={profile} onChange={setProfile} onReset={() => setProfile(emptyProfile())} />
          </ChartCard>

          <ChartCard
            title={profileHasSelection ? "Where this profile sits" : "Where the population sits"}
            subtitle="A transparent index built from group averages for the factors you selected"
            explainer={
              <>
                <p>
                  The big number isn't a real IQ score — nobody took a test. It's simpler than that: start at the
                  population average, then add or subtract each factor's known effect for whatever you picked. It
                  only reflects the handful of factors you selected, nothing more.
                </p>
                <p>
                  It's shown as a range rather than one number because a single figure would look more precise
                  than it really is — see "Why variable selection matters" near the bottom of the page for exactly
                  how much this index can and can't claim.
                </p>
              </>
            }
          >
            {scoreResult && (
              <PositionSummary
                hasAnySelection={profileHasSelection}
                score={scoreResult.score}
                percentile={percentile}
                percentileBand={percentileBand}
                contributions={scoreResult.contributions}
              />
            )}
            {overview && distributions && scoreResult && (
              <div style={{ marginTop: 18 }}>
                <DensityChart
                  bins={distributions.child_iq}
                  markerValue={scoreResult.score}
                  markerBand={scoreResult.band}
                  markerLabel={profileHasSelection ? "You" : "Average"}
                />
              </div>
            )}
          </ChartCard>
        </div>

        <AcademicNote title="Why this is a range, not a single number">
          <p>
            People aren't great at guessing where they fall on a scale — and the people furthest from average tend
            to be the most confident they're near it. One study of health habits found this pattern again and
            again: people rated themselves as healthier than they were, and the people doing the least healthy
            things were usually the most surprised to hear it (Miller et al., 2019).
          </p>
          <p>
            Just showing someone a comparison doesn't fix this on its own, either — later research found that
            generic "here's the average person" feedback barely changed anyone's self-assessment, and what
            actually helped was telling people how far off guesses like theirs usually are (Fellner-Röhling et
            al., 2023). That's why the number above is shown as a range, with a plain explanation of what it
            leaves out, instead of one clean figure you're left to read however you'd like.
          </p>
        </AcademicNote>

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
            explainer={
              <p>
                The arrows show a plausible <em>order</em> — genetics and SES come first, then prenatal exposure,
                then early environment, then the measured outcome. They are not proof that one box causes the
                next: the sublabels are <InfoTip term="r" /> correlations and group-mean gaps, and neither one
                establishes causation on its own.
              </p>
            }
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
            explainer={
              <p>
                Each dot is the average IQ of children born that year; the shaded band is ±1{" "}
                <InfoTip term="sd" /> — the range covering roughly two-thirds of children born that year. A rising
                line describes the population, not individuals — it doesn't mean any specific child is "getting
                smarter."
              </p>
            }
          >
            <FlynnEffectChart data={flynnEffect} />
          </ChartCard>
        )}

        <AcademicNote title="Why there's more than one chart here">
          <p>
            One chart never tells the whole story. Researchers who studied how people read charts about fairness
            in classrooms found that a chart showing individuals draws attention to specific outliers, a chart
            showing groups invites more careful, contextual thinking, and a single summary number can feel more
            certain than it really is — each view teaches you something different, and none of them alone is
            enough (Reinholz et al., 2023).
          </p>
          <p>
            That's why the next two charts sit side by side: one ranks each factor's own link to child IQ, the
            other shows how those factors overlap with each other — something a ranked list can't tell you.
          </p>
          <p>
            And interactivity by itself doesn't make any of this easier to understand, for what it's worth. In
            controlled experiments, adding hover effects and toggles to an already-clear chart didn't improve how
            well people reasoned about it, and sometimes made things worse. What did help was interaction that
            asked people to guess first and then showed them the answer (Okan et al., 2015; Mosca et al., 2021).
            That's the spirit every interactive element on this page was built with.
          </p>
        </AcademicNote>

        <div className="chart-grid-2">
          {correlations && (
            <ChartCard
              title="Strongest predictors of child IQ"
              subtitle="Pearson correlation of each factor with child IQ — dot position and color encode direction and strength"
              explainer={
                <p>
                  Each row is one variable's <InfoTip term="r" /> with child IQ. Distance from the center line is
                  strength; color is direction. This ranks by strength alone — a strong correlation here doesn't
                  mean a strong real-world effect, and it isn't causation (<InfoTip term="causation" />
                  ).
                </p>
              }
            >
              <LollipopChart data={correlations} labels={COLUMN_LABELS} />
            </ChartCard>
          )}

          {correlationMatrix && (
            <ChartCard
              title="How predictors relate to each other"
              subtitle="Pairwise correlation matrix across key numeric factors"
              explainer={
                <p>
                  Every cell is the <InfoTip term="r" /> between its row and column variable — including pairs that
                  don't involve child IQ at all. This is what tells you when two predictors overlap, which is
                  exactly the problem the profile-builder engine (see "Why variable selection matters" below) had
                  to correct for.
                </p>
              }
            >
              <CorrelationHeatmap variables={correlationMatrix.variables} values={correlationMatrix.values} labels={COLUMN_LABELS} />
            </ChartCard>
          )}
        </div>

        {overview && byCategory && (
          <ChartCard
            title="Category effects on IQ"
            subtitle="Group mean IQ vs. the population mean — your selection (if any) is marked"
            explainer={
              <p>
                Each dot is one group's average child IQ; the dashed line is the population average. Distance from
                the line is the group's gap in IQ points — a plain difference, not a percentage or a probability.
              </p>
            }
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
            explainer={
              <p>
                Two dots connected by a line: one for children without the factor, one for children with it. The
                line's length is the <InfoTip term="effectSize" /> in IQ points — often a more honest number to
                look at than a correlation alone, since it's in the outcome's real units.
              </p>
            }
          >
            <DumbbellChart rows={dumbbellRows} presentLabel="present" absentLabel="absent" />
          </ChartCard>
        )}

        {scatterSample && (
          <ChartCard
            title="Parent IQ &amp; home environment vs. child IQ"
            subtitle="1,500-child sample with marginal distributions on each axis and a fitted trend line"
            explainer={
              <p>
                Each dot is one sampled child. The strips on top and right show each variable's distribution on
                its own (a <InfoTip term="density" />-style view); the dashed line is the best straight-line fit.
                A trend line describes the overall pattern — it says nothing about what happens for any one child.
              </p>
            }
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

        <AcademicNote title="What &quot;fixed&quot; actually means">
          <p>
            Calling something "fixed" doesn't mean it was always going to happen — it means it's already happened,
            for this particular child. Researchers who mapped out how children's well-being actually gets shaped
            found long chains of cause and effect: government funding decisions affect how long families wait for
            services, which affects caregiver stress, which affects a child's day-to-day environment (Poon et al.,
            2022).
          </p>
          <p>
            None of those links show up in a snapshot of one child's history. So when a factor below is labeled
            "fixed," that's only true in the narrow sense that nothing can be done about it now — it may still be
            exactly the kind of thing worth investing in for the next child.
          </p>
        </AcademicNote>

        {correlations && (
          <ChartCard
            title="Fixed history vs. shapeable environment"
            subtitle="Same dataset, split by whether a caregiver could still influence the factor today"
            explainer={
              <p>
                The r values here are raw <InfoTip term="r" /> with child IQ for each variable on its own — not
                the corrected coefficients the profile-builder engine uses internally (see below). They're kept
                as plain correlations here because the point of this chart is ranking factors by their own
                association, not combining them into one number.
              </p>
            }
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

        {/* ---------------- variable-selection case study ---------------- */}
        <SectionHeader
          number="—"
          title="Why variable selection matters"
          lede="Two real decisions from building this page, and what each one cost — for anyone setting up their own analysis."
        />

        <AcademicNote title="Why several variables together are harder to reason about than one">
          <p>
            Looking at several variables at once is harder than it sounds, and most of us are worse at it than
            we'd guess. Studies of how people reason about samples and evidence show that even careful, numerate
            readers make mistakes when combining several pieces of statistical information — and those mistakes
            shrink the more comfortable someone is with numbers to begin with (Chesney &amp; Obrecht, 2011).
          </p>
          <p>
            Separate research on students working with real scientific datasets found that the people who
            actually understood what was going on weren't the ones who could read a single chart correctly — they
            were the ones who could compare charts against each other and connect the data back to an explanation
            (Resnick, Kastens, &amp; Shipley, 2018). The case study below tries to make that kind of comparison
            explicit instead of assuming you'll do it in your head.
          </p>
        </AcademicNote>

        {regression && idealCeiling && (
          <ChartCard title="A case study in this project's own data" subtitle="Computed live from the current engine">
            <VariableSelectionCaseStudy
              naiveR2={naiveR2}
              correctedR2={regression.modelR2}
              idealScore={idealCeiling.score}
              idealPercentile={idealCeiling.percentile}
            />
          </ChartCard>
        )}

        <AcademicNote title="Why this is something to use, not just read">
          <p>
            Data is more useful when it's something you can push back on, not just something you're told. One
            project paired population statistics with people's own stories, turning a one-way report into
            something closer to a conversation (Rojas &amp; Ju, 2009), and other researchers have found real value
            in letting people explore and compare data themselves rather than just handing them a finished
            conclusion (Heer &amp; Hellerstein, 2009).
          </p>
          <p>
            That's really the point of building this page as something you interact with instead of a report you
            read once: understanding a population's patterns is only useful if it leaves you with something to do
            with it.
          </p>
        </AcademicNote>

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

        <ChartCard title="Source & methodology" subtitle="What 'synthetic' means for this specific dataset">
          <div className="methodology-text">
            <p>
              Every row is procedurally generated — no real child or study participant is reproduced, and privacy
              is guaranteed by construction. But the generator's parameters are calibrated to published research
              rather than invented: the parental-midpoint–to–child-IQ correlation is set to ~0.53 (Reed &amp;
              Rich), childhood heritability to the ~0.4 range reported by twin/adoption studies, iodine deficiency
              to roughly -7 to -12 IQ points (multiple meta-analyses), and lead exposure, prematurity, low birth
              weight, and breastfeeding's SES-confounded effect are modeled the same way.
            </p>
            <p>
              Regression to the mean and a Flynn-effect drift by birth year are built in deliberately. These
              sources shaped the simulator's design only — no data from them is reproduced here.
            </p>
            <p>
              The dataset creator is explicit that this is an educational modeling tool, not a psychological
              assessment or a statement about any real person or group — and deliberately excludes race or
              ethnicity as a predictor, since framing group IQ differences as genetic has no scientific basis.
            </p>
          </div>
          <p className="methodology-source">
            Source:{" "}
            <a href="https://www.kaggle.com/datasets/sergionefedov/child-iq-genes-environment" target="_blank" rel="noreferrer">
              Child IQ: Genes &amp; Environment
            </a>{" "}
            (Kaggle, sergionefedov, CC0).
          </p>
        </ChartCard>

        <DisclaimerCallout>
          <p>
            <strong>The full disclaimer, in case you skipped it up top:</strong> no real child or study participant
            appears in this dataset — every row is procedurally generated. The relationships modeled here are
            informed by findings reported in published research and meta-analyses, including parental-IQ
            correlations, childhood heritability estimates, iodine deficiency, lead exposure, and environmental
            influences on development. Those findings were used to calibrate the synthetic model above and should
            not be interpreted as measurements or predictions of real individuals.
          </p>
          <p>
            IQ is a narrow and imperfect measure of certain aspects of cognitive performance. It does not measure a
            person's worth, character, creativity, or future potential. The profile you can build on this page is
            an exploration of population-level patterns, not a prediction of your own ability or development.
            Nothing you enter here is stored, sent anywhere, or used for anything beyond this page.
          </p>
        </DisclaimerCallout>

        <ChartCard title="Further reading" subtitle="The research cited in the notes throughout this page">
          <ReadingList />
        </ChartCard>

        <SectionHeader
          number="—"
          title="The full picture"
          lede="Every question this project was built to answer, laid out in order — the structure behind everything above."
        />

        <ChartCard title="Project notes" subtitle="A complete breakdown, not a summary">
          <ProjectStructure />
        </ChartCard>

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
