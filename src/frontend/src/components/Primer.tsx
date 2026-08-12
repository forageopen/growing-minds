import { GLOSSARY } from "../lib/glossary";

const PRIMER_TERMS: (keyof typeof GLOSSARY)[] = ["r", "percentile", "sd", "causation"];

export function Primer() {
  return (
    <details className="primer">
      <summary>New to reading data charts? A 60-second primer</summary>
      <dl className="primer-terms">
        {PRIMER_TERMS.map((key) => {
          const entry = GLOSSARY[key];
          return (
            <div key={key}>
              <dt>{entry.term}</dt>
              <dd>{entry.definition}</dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}
