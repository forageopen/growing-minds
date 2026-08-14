import { CloudFog } from "lucide-react";

export function GlassBlurToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      className={`icon-button${enabled ? " icon-button-active" : ""}`}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={`Turn ${enabled ? "off" : "on"} the frosted-glass blur`}
      title={`Turn ${enabled ? "off" : "on"} the frosted-glass blur`}
    >
      <CloudFog size={18} />
    </button>
  );
}
