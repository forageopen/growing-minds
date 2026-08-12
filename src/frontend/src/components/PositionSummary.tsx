import { percentileLabel } from "../lib/profile";

interface Props {
  hasAnySelection: boolean;
  score: number;
  percentile: number;
  contributions: { label: string; delta: number }[];
}

export function PositionSummary({ hasAnySelection, score, percentile, contributions }: Props) {
  const top = contributions.slice(0, 3);

  return (
    <div className="position-summary">
      <div className="position-headline">
        <div className="position-number">{Math.round(score)}</div>
        <div className="position-caption">
          <strong>{hasAnySelection ? "This profile's index" : "Population average"}</strong>
          <span>
            around the <strong>{percentile}<sup>th</sup> percentile</strong> — {percentileLabel(percentile)} of the
            50,000-child dataset
          </span>
        </div>
      </div>

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
