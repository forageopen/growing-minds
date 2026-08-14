import { Flower2 } from "lucide-react";

export function AsciiFlowerToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      className={`icon-button${enabled ? " icon-button-active" : ""}`}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={`Turn ${enabled ? "off" : "on"} the ASCII flower background`}
      title={`Turn ${enabled ? "off" : "on"} the ASCII flower background`}
    >
      <Flower2 size={18} />
    </button>
  );
}
