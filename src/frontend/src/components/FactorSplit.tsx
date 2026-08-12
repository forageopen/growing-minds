import { Lock, Sprout } from "lucide-react";
import type { CorrelationEntry } from "../lib/types";
import { COLUMN_LABELS, FIXED_COLUMNS, MODIFIABLE_COLUMNS, prettyKey } from "../lib/labels";

interface Props {
  correlations: CorrelationEntry[];
}

export function FactorSplit({ correlations }: Props) {
  const fixed = correlations.filter((c) => FIXED_COLUMNS.has(c.column)).slice(0, 6);
  const modifiable = correlations.filter((c) => MODIFIABLE_COLUMNS.has(c.column)).slice(0, 6);

  return (
    <div className="factor-split">
      <div className="factor-column">
        <h4><Lock size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Already settled, by the time you're reading this</h4>
        <p>Parental background, pregnancy history, and birth circumstances — real associations, but not something anyone can act on retroactively.</p>
        <ul className="factor-list">
          {fixed.map((c) => (
            <li key={c.column}>
              <span>{COLUMN_LABELS[c.column] ?? prettyKey(c.column)}</span>
              <span className="factor-r">r = {c.r.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="factor-column">
        <h4><Sprout size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Still shapeable for a child today</h4>
        <p>Smaller individual associations than genetics or SES, but these are the levers actually available to a caregiver, teacher, or policy going forward.</p>
        <ul className="factor-list">
          {modifiable.map((c) => (
            <li key={c.column}>
              <span>{COLUMN_LABELS[c.column] ?? prettyKey(c.column)}</span>
              <span className="factor-r">r = {c.r.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
