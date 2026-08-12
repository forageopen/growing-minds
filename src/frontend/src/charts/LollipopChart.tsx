import { useState } from "react";
import type { CorrelationEntry } from "../lib/types";
import { linearScale } from "../lib/scale";
import { ChartTooltip } from "../components/ChartTooltip";

interface Props {
  data: CorrelationEntry[];
  labels: Record<string, string>;
}

const W = 720;
const ROW_H = 30;
const M = { top: 8, right: 48, bottom: 24, left: 190 };

export function LollipopChart({ data, labels }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const H = M.top + M.bottom + data.length * ROW_H;

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.r)), 0.1);
  const x = linearScale([-maxAbs, maxAbs], [M.left, W - M.right]);
  const zero = x(0);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Predictors ranked by correlation strength with child IQ">
        <line x1={zero} x2={zero} y1={M.top} y2={H - M.bottom} className="axis-baseline" />
        {[-maxAbs / 2, maxAbs / 2].map((t) => (
          <line key={t} x1={x(t)} x2={x(t)} y1={M.top} y2={H - M.bottom} className="grid-line" />
        ))}

        {data.map((d, i) => {
          const cy = M.top + i * ROW_H + ROW_H / 2;
          const positive = d.r >= 0;
          const color = positive ? "var(--diverging-pos)" : "var(--diverging-neg)";
          const isHover = hover === d.column;
          return (
            <g
              key={d.column}
              onMouseEnter={() => setHover(d.column)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <text x={M.left - 12} y={cy} textAnchor="end" dominantBaseline="middle" className="lollipop-label">
                {labels[d.column] ?? d.column}
              </text>
              <line x1={zero} x2={x(d.r)} y1={cy} y2={cy} stroke={color} strokeWidth={isHover ? 3 : 2} strokeLinecap="round" opacity={isHover ? 1 : 0.85} />
              <circle cx={x(d.r)} cy={cy} r={isHover ? 6 : 4.5} fill={color} stroke="var(--chart-surface)" strokeWidth={1.5} />
              {isHover && (
                <text x={x(d.r) + (positive ? 12 : -12)} y={cy} textAnchor={positive ? "start" : "end"} dominantBaseline="middle" className="lollipop-value">
                  {d.r.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover && (() => {
        const d = data.find((e) => e.column === hover)!;
        const i = data.indexOf(d);
        const cy = M.top + i * ROW_H + ROW_H / 2;
        return (
          <ChartTooltip x={x(d.r)} y={cy - 34} visible>
            <strong>{labels[d.column] ?? d.column}</strong>
            <div>r = {d.r.toFixed(3)}</div>
            <div className="tooltip-muted">{d.r >= 0 ? "positive association" : "negative association"} with child IQ</div>
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
