import { useId, useMemo, useState } from "react";
import type { HistBin } from "../lib/types";
import { linearScale, niceTicks } from "../lib/scale";
import { kde } from "../lib/stats";
import { ChartTooltip } from "../components/ChartTooltip";
import { useReducedMotion } from "../lib/useReducedMotion";

interface Props {
  bins: HistBin[];
  color?: string;
  unit?: string;
  markerValue?: number;
  markerLabel?: string;
}

const W = 640;
const H = 220;
const M = { top: 30, right: 16, bottom: 28, left: 16 };

export function DensityChart({ bins, color = "var(--series-1)", unit = "", markerValue, markerLabel }: Props) {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const pathId = `density-comet-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const curve = useMemo(() => kde(bins, 80), [bins]);

  const x0 = bins[0].x0;
  const x1 = bins[bins.length - 1].x1;
  const x = linearScale([x0, x1], [M.left, W - M.right]);
  const y = linearScale([0, 1.05], [H - M.bottom, M.top]);

  const areaPath =
    `M${x(curve[0].x)},${y(0)} ` +
    curve.map((p) => `L${x(p.x)},${y(p.y)}`).join(" ") +
    ` L${x(curve[curve.length - 1].x)},${y(0)} Z`;
  const linePath = curve.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x)},${y(p.y)}`).join(" ");

  const xTicks = niceTicks(x0, x1, 5);

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHoverX(px);
  }

  const nearest = hoverX !== null
    ? curve.reduce((best, p) => (Math.abs(x(p.x) - hoverX) < Math.abs(x(best.x) - hoverX) ? p : best), curve[0])
    : null;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Smoothed distribution curve">
        {xTicks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={M.top} y2={H - M.bottom} className="grid-line" />
            <text x={x(t)} y={H - M.bottom + 18} className="axis-label" textAnchor="middle">
              {t}{unit}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={color} opacity={0.16} className="breathe-area" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path id={pathId} d={linePath} fill="none" stroke="none" />
        {!reducedMotion && (
          <circle r={4} fill={color}>
            <animateMotion dur="5s" repeatCount="indefinite">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        )}
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="axis-baseline" />

        {nearest && (
          <line x1={x(nearest.x)} x2={x(nearest.x)} y1={M.top} y2={H - M.bottom} className="crosshair" />
        )}

        {markerValue !== undefined && (
          <g className="you-marker">
            <line x1={x(markerValue)} x2={x(markerValue)} y1={M.top - 14} y2={H - M.bottom} stroke="var(--marker-you)" strokeWidth={2.5} />
            <circle cx={x(markerValue)} cy={M.top - 14} r={5.5} fill="var(--marker-you)" className="pulse-dot" />
            <text x={x(markerValue)} y={M.top - 22} textAnchor="middle" className="you-marker-label">
              {markerLabel ?? "You"}
            </text>
          </g>
        )}

        <rect
          x={M.left}
          y={M.top}
          width={W - M.left - M.right}
          height={H - M.top - M.bottom}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverX(null)}
        />
      </svg>
      {nearest && (
        <ChartTooltip x={x(nearest.x)} y={y(nearest.y) - 10} visible>
          <strong>{nearest.x.toFixed(1)}{unit}</strong>
          <div className="tooltip-muted">relative density {Math.round(nearest.y * 100)}%</div>
        </ChartTooltip>
      )}
    </div>
  );
}
