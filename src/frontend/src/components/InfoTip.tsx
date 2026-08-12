import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { GLOSSARY } from "../lib/glossary";

interface Props {
  term: keyof typeof GLOSSARY;
}

export function InfoTip({ term }: Props) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[term];

  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-trigger"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        aria-expanded={open}
        aria-label={`What is ${entry.term}?`}
      >
        <HelpCircle size={13} strokeWidth={2} />
      </button>
      {open && (
        <span className="info-tip-popover" role="tooltip">
          <strong>{entry.term}</strong>
          <span>{entry.definition}</span>
        </span>
      )}
    </span>
  );
}
