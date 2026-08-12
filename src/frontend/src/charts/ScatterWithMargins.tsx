import { useMemo, useState } from "react";
import type { ScatterPoint } from "../lib/types";
import { linearScale, niceTicks } from "../lib/scale";
import { linreg } from "../lib/stats";
import { ChartTooltip } from "../components/ChartTooltip";

interface Props {
  points: ScatterPoint[];
  xKey: "mother_iq" | "father_iq" | "parental_ses" | "home_stimulation_score";
  xLabel: string;
}

const W = 640;
const H = 420;
const MARGIN_SIZE = 44;
const M = { top: MARGIN_SIZE, right: 16, bottom: 40, left: 44 };
const PLOT_H = H - M.top - MARGIN_SIZE - M.bottom;

function marginalCounts(values: number[], domain: [number, number], bins: number) {
  const [d0, d1] = domain;
  const width = (d1 - d0) / bins || 1;
  const counts = Array(bins).fill(0);
  for (const v of values) {
    let idx = Math.floor((v - d0) / width);
    idx = Math.max(0, Math.min(bins - 1, idx));
    counts[idx]++;
  }
  return counts;
}

export function ScatterWithMargins({ points, xKey, xLabel }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const xVals = points.map((p) => p[xKey]);
  const yVals = points.map((p) => p.child_iq);
  const xDomain: [number, number] = [Math.min(...xVals), Math.max(...xVals)];
  const yDomain: [number, number] = [Math.min(...yVals), Math.max(...yVals)];

  const x = linearScale(xDomain, [M.left, W - M.right]);
  const y = linearScale(yDomain, [H - M.bottom, M.top + MARGIN_SIZE]);

  const { slope, intercept } = useMemo(
    () => linreg(points.map((p) => ({ x: p[xKey], y: p.child_iq }))),
    [points, xKey]
  );

  const topCounts = useMemo(() => marginalCounts(xVals, xDomain, 30), [xVals, xDomain]);
  const rightCounts = useMemo(() => marginalCounts(yVals, yDomain, 30), [yVals, yDomain]);
  const maxTop = Math.max(...topCounts);
  const maxRight = Math.max(...rightCounts);

  const xTicks = niceTicks(xDomain[0], xDomain[1], 5);
  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Scatter of ${xLabel} against child IQ with marginal distributions`}>
        {yTicks.map((t) => (
          <line key={t} x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="grid-line" />
        ))}
        {yTicks.map((t) => (
          <text key={t} x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="axis-label">
            {t}
          </text>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - M.bottom + 18} textAnchor="middle" className="axis-label">
            {t}
          </text>
        ))}

        {/* top marginal density strip */}
        <g>
          {topCounts.map((c, i) => {
            const barW = (W - M.left - M.right) / topCounts.length;
            const bx = M.left + i * barW;
            const bh = (c / maxTop) * (MARGIN_SIZE - 8);
            return <rect key={i} x={bx} y={MARGIN_SIZE - bh} width={barW - 1} height={bh} fill="var(--series-1)" opacity={0.35} />;
          })}
        </g>
        {/* right marginal density strip */}
        <g>
          {rightCounts.map((c, i) => {
            const barH = PLOT_H / rightCounts.length;
            const by = M.top + MARGIN_SIZE + i * barH;
            const bw = (c / maxRight) * (MARGIN_SIZE - 8);
            return <rect key={i} x={W - M.right} y={by} width={bw} height={barH - 1} fill="var(--series-1)" opacity={0.35} />;
          })}
        </g>

        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p[xKey])}
            cy={y(p.child_iq)}
            r={hover === i ? 5 : 2.6}
            fill={p.high_cognitive_potential ? "var(--series-8)" : "var(--series-1)"}
            opacity={hover === i ? 1 : 0.55}
            className={p.high_cognitive_potential ? "pulse-dot" : undefined}
            style={{ cursor: "pointer", animationDelay: p.high_cognitive_potential ? `${(i % 14) * 0.18}s` : undefined }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}

        <line
          x1={x(xDomain[0])}
          y1={y(slope * xDomain[0] + intercept)}
          x2={x(xDomain[1])}
          y2={y(slope * xDomain[1] + intercept)}
          stroke="var(--abd-text-primary)"
          strokeWidth={2}
          opacity={0.55}
          className="flow-dash-slow"
        />

        <line x1={M.left} x2={M.left} y1={M.top + MARGIN_SIZE} y2={H - M.bottom} className="axis-baseline" />
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="axis-baseline" />
      </svg>
      {hover !== null && (
        <ChartTooltip x={x(points[hover][xKey])} y={y(points[hover].child_iq) - 12} visible>
          <strong>{xLabel} {points[hover][xKey]}</strong>
          <div>child IQ {points[hover].child_iq}</div>
          {points[hover].high_cognitive_potential && <div className="tooltip-muted">top decile</div>}
        </ChartTooltip>
      )}
      <div className="legend-row">
        <span className="legend-swatch" style={{ background: "var(--series-1)" }} /> typical range
        <span className="legend-swatch" style={{ background: "var(--series-8)" }} /> top-decile IQ
      </div>
    </div>
  );
}
