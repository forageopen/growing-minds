import { useMemo, useState } from "react";
import type { GroupStat } from "../lib/types";
import { linearScale, niceTicks } from "../lib/scale";
import { ChartTooltip } from "../components/ChartTooltip";

interface Props {
  data: GroupStat[];
}

const W = 720;
const H = 300;
const M = { top: 16, right: 20, bottom: 32, left: 44 };

export function FlynnEffectChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const points = useMemo(
    () =>
      data
        .map((d) => ({ year: Number(d.key), mean: d.mean, sd: d.sd, n: d.n }))
        .sort((a, b) => a.year - b.year),
    [data]
  );

  const years = points.map((p) => p.year);
  const x = linearScale([Math.min(...years), Math.max(...years)], [M.left, W - M.right]);

  const lo = Math.min(...points.map((p) => p.mean - p.sd));
  const hi = Math.max(...points.map((p) => p.mean + p.sd));
  const y = linearScale([lo, hi], [H - M.bottom, M.top]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year)},${y(p.mean)}`).join(" ");
  const bandTop = points.map((p) => `${x(p.year)},${y(p.mean + p.sd)}`).join(" L");
  const bandBottom = [...points].reverse().map((p) => `${x(p.year)},${y(p.mean - p.sd)}`).join(" L");
  const bandPath = `M${bandTop} L${bandBottom} Z`;

  const yTicks = niceTicks(lo, hi, 5);
  const xTicks = points.filter((_, i) => i % 2 === 0 || i === points.length - 1).map((p) => p.year);

  const hoverPoint = hover !== null ? points[hover] : null;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mean child IQ by birth year, showing the Flynn effect trend">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="grid-line" />
            <text x={M.left - 8} y={y(t)} className="axis-label" textAnchor="end" dominantBaseline="middle">
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - M.bottom + 20} className="axis-label" textAnchor="middle">
            {t}
          </text>
        ))}

        <path d={bandPath} fill="var(--series-1)" opacity={0.14} />
        <path d={linePath} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <circle
            key={p.year}
            cx={x(p.year)}
            cy={y(p.mean)}
            r={hover === i ? 5 : 3}
            fill="var(--series-1)"
            stroke="var(--chart-surface)"
            strokeWidth={1.5}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} className="axis-baseline" />
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="axis-baseline" />
      </svg>
      {hoverPoint && (
        <ChartTooltip x={x(hoverPoint.year)} y={y(hoverPoint.mean) - 12} visible>
          <strong>{hoverPoint.year}</strong>
          <div>Mean IQ {hoverPoint.mean.toFixed(1)} (±{hoverPoint.sd.toFixed(1)})</div>
          <div className="tooltip-muted">n = {hoverPoint.n.toLocaleString()}</div>
        </ChartTooltip>
      )}
    </div>
  );
}
