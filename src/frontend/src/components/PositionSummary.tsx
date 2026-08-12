import { percentileLabel } from "../lib/profile";

interface Props {
  hasAnySelection: boolean;
  score: number;
  percentile: number;
  percentileBand: [number, number];
  contributions: { label: string; delta: number }[];
}

export function PositionSummary({ hasAnySelection, score, percentile, percentileBand, contributions }: Props) {
  const top = contributions.slice(0, 3);
  const [lo, hi] = percentileBand;

  return (
    <div className="position-summary">
      <div className="position-headline">
        <div className="position-number">{Math.round(score)}</div>
        <div className="position-caption">
          <strong>{hasAnySelection ? "This profile's index" : "Population average"}</strong>
          <span>
            typically the <strong>{lo}<sup>th</sup>–{hi}<sup>th</sup> percentile</strong> band — {percentileLabel(percentile)} of
            the 50,000-child dataset
          </span>
        </div>
      </div>

      <p className="position-note">
        This is shown as a range, not one number, because it only reflects the handful of factors you chose to
        answer. It leaves out parental IQ and other traits we don't ask about — which happen to be the strongest
        predictors in this whole dataset — so it will rarely reach the extremes a real IQ test could.
      </p>

      {hasAnySelection && top.length > 0 && (
        <div className="position-contributions">
          <p>Factors moving this index the most:</p>
          <ul>
            {top.map((c) => (
              <li key={c.label}>
                <span className={c.delta >= 0 ? "delta-pos" : "delta-neg"}>
                  {c.delta >= 0 ? "+" : ""}
                  {c.delta.toFixed(1)}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
