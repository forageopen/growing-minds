import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}

export function StatTile({ icon: Icon, label, value, sub }: Props) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-icon">
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="stat-tile-body">
        <div className="stat-tile-label">{label}</div>
        <div className="stat-tile-value">{value}</div>
        {sub && <div className="stat-tile-sub">{sub}</div>}
      </div>
    </div>
  );
}
