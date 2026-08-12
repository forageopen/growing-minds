interface Props {
  naiveR2: number;
  correctedR2: number;
  idealScore: number;
  idealPercentile: number;
}

export function VariableSelectionCaseStudy({ naiveR2, correctedR2, idealScore, idealPercentile }: Props) {
  const overstatement = ((naiveR2 - correctedR2) / correctedR2) * 100;

  return (
    <div className="case-study">
      <p>
        Before any chart gets drawn, someone has to decide which variables go into the analysis, how they get
        combined, and which ones get left out. Those decisions — not the chart styling — are what determine whether
        a visualization means something or just looks like it does. Two real examples from building this page:
      </p>

      <div className="case-study-block">
        <h4>1. Combining correlated variables without correcting for overlap</h4>
        <p>
          This tool's profile index originally added up each factor's own correlation with child IQ, one at a
          time. But several factors — maternal education, home stimulation, nutrition — all partly reflect the
          same socioeconomic status. Adding their raw correlations counts that overlap more than once.
        </p>
        <div className="case-study-numbers">
          <div>
            <span className="num-label">Naive sum of r²</span>
            <span className="num-value">{naiveR2.toFixed(3)}</span>
          </div>
          <div>
            <span className="num-label">Corrected multiple R²</span>
            <span className="num-value">{correctedR2.toFixed(3)}</span>
          </div>
        </div>
        <p>
          Adding the raw correlations overstated how much these factors explained together by about{" "}
          <strong>{overstatement.toFixed(0)}%</strong>. The fix was to work out each factor's own contribution
          properly, accounting for how much it overlaps with the others — the same correction any analysis needs
          before you can trust several variables added together, not just one at a time.
        </p>
      </div>

      <div className="case-study-block">
        <h4>2. Choosing not to collect a variable at all</h4>
        <p>
          <code>mother_iq</code> and <code>father_iq</code> are the two strongest predictors in this entire
          dataset — stronger than every environmental factor combined. The profile builder never asks for them,
          on purpose: estimating a parent's IQ isn't something a public tool should ask a stranger to do.
        </p>
        <div className="case-study-numbers">
          <div>
            <span className="num-label">Best possible profile, this tool's inputs only</span>
            <span className="num-value">{Math.round(idealScore)}</span>
          </div>
          <div>
            <span className="num-label">Percentile ceiling</span>
            <span className="num-value">{idealPercentile}th</span>
          </div>
        </div>
        <p>
          That's the ceiling — computed live, right now, from every remaining field set to its best value. No
          combination of the factors this tool collects can score higher, because the strongest predictors were
          excluded before the first chart was ever drawn. That's not a bug to fix; it's the visible cost of a
          variable-selection decision made for ethical reasons. A meaningful visualization discloses trade-offs
          like this instead of hiding them behind a confident-looking number.
        </p>
      </div>
    </div>
  );
}
