import { useState } from "react";
import { linearScale } from "../lib/scale";
import { ChartTooltip } from "../components/ChartTooltip";
import type { GroupStat } from "../lib/types";

export interface DumbbellRow {
  label: string;
  absent?: GroupStat;
  present?: GroupStat;
}

interface Props {
  rows: DumbbellRow[];
  presentLabel: string;
  absentLabel: string;
}

const W = 640;
const ROW_H = 40;
const M = { top: 20, right: 24, bottom: 24, left: 176 };

export function DumbbellChart({ rows, presentLabel, absentLabel }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const H = M.top + M.bottom + rows.length * ROW_H;

  const allVals = rows.flatMap((r) => [r.absent?.mean, r.present?.mean].filter((v): v is number => v !== undefined));
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const pad = (max - min) * 0.25 || 3;
  const x = linearScale([min - pad, max + pad], [M.left, W - M.right]);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mean child IQ with and without each risk factor">
        <g transform={`translate(0, ${M.top - 12})`}>
          <circle cx={W - M.right - 132} cy={0} r={4.5} fill="var(--series-6)" />
          <text x={W - M.right - 120} y={0} dominantBaseline="middle" className="legend-label">{absentLabel}</text>
          <circle cx={W - M.right - 40} cy={0} r={4.5} fill="var(--series-8)" />
          <text x={W - M.right - 28} y={0} dominantBaseline="middle" className="legend-label">{presentLabel}</text>
        </g>

        {rows.map((r, i) => {
          if (!r.absent || !r.present) return null;
          const cy = M.top + 16 + i * ROW_H;
          const isHover = hover === i;
          return (
            <g key={r.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
              <text x={M.left - 12} y={cy} textAnchor="end" dominantBaseline="middle" className="lollipop-label">
                {r.label}
              </text>
              <line x1={x(r.absent.mean)} x2={x(r.present.mean)} y1={cy} y2={cy} className="dumbbell-connector" strokeWidth={isHover ? 3 : 2} />
              <circle cx={x(r.absent.mean)} cy={cy} r={isHover ? 7 : 5.5} fill="var(--series-6)" stroke="var(--chart-surface)" strokeWidth={1.5} />
              <circle cx={x(r.present.mean)} cy={cy} r={isHover ? 7 : 5.5} fill="var(--series-8)" stroke="var(--chart-surface)" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      {hover !== null && rows[hover].absent && rows[hover].present && (() => {
        const r = rows[hover];
        const cy = M.top + 16 + hover * ROW_H;
        const gap = r.present!.mean - r.absent!.mean;
        return (
          <ChartTooltip x={(x(r.absent!.mean) + x(r.present!.mean)) / 2} y={cy - 40} visible>
            <strong>{r.label}</strong>
            <div>{absentLabel} {r.absent!.mean.toFixed(1)} → {presentLabel} {r.present!.mean.toFixed(1)}</div>
            <div className="tooltip-muted">gap {gap >= 0 ? "+" : ""}{gap.toFixed(1)} IQ pts</div>
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
