import { useState } from "react";
import type { GroupStat } from "../lib/types";
import { linearScale } from "../lib/scale";
import { ChartTooltip } from "../components/ChartTooltip";

interface Props {
  data: GroupStat[];
  populationMean: number;
  order?: string[];
  labelFor?: (key: string) => string;
  markerKey?: string;
}

const W = 640;
const ROW_H = 34;
const M = { top: 18, right: 24, bottom: 24, left: 140 };

export function DotPlotChart({ data, populationMean, order, labelFor, markerKey }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const keyed = data.map((d) => ({ ...d, key: String(d.key) }));
  const sorted = order
    ? order.map((k) => keyed.find((d) => d.key === k)).filter((d): d is GroupStat & { key: string } => !!d)
    : [...keyed].sort((a, b) => a.mean - b.mean);

  const H = M.top + M.bottom + sorted.length * ROW_H;
  const vals = sorted.map((d) => d.mean);
  const pad = 3;
  const x = linearScale(
    [Math.min(...vals, populationMean) - pad, Math.max(...vals, populationMean) + pad],
    [M.left, W - M.right]
  );

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mean child IQ by category, compared to the population mean">
        <line
          x1={x(populationMean)}
          x2={x(populationMean)}
          y1={M.top}
          y2={H - M.bottom}
          className="reference-line"
        />
        <text x={x(populationMean)} y={10} textAnchor="middle" className="axis-label">
          pop. mean {populationMean.toFixed(0)}
        </text>

        {sorted.map((d, i) => {
          const cy = M.top + 14 + i * ROW_H;
          const isHover = hover === d.key;
          const isYou = markerKey === d.key;
          const above = d.mean >= populationMean;
          return (
            <g key={d.key} onMouseEnter={() => setHover(d.key)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
              <text x={M.left - 12} y={cy} textAnchor="end" dominantBaseline="middle" className={isYou ? "lollipop-label you-row-label" : "lollipop-label"}>
                {labelFor ? labelFor(d.key) : d.key}
              </text>
              <line
                x1={x(populationMean)}
                x2={x(d.mean)}
                y1={cy}
                y2={cy}
                className="dotplot-stem flow-dash"
                style={{ animationDelay: `${i * 0.1}s`, animationDirection: above ? "normal" : "reverse" }}
              />
              {isYou && (
                <circle cx={x(d.mean)} cy={cy} r={12} fill="none" stroke="var(--marker-you)" strokeWidth={2} className="pulse-dot" opacity={0.7} />
              )}
              <circle
                cx={x(d.mean)}
                cy={cy}
                r={isHover ? 7 : 5.5}
                fill={isYou ? "var(--marker-you)" : above ? "var(--diverging-pos)" : "var(--diverging-neg)"}
                stroke="var(--chart-surface)"
                strokeWidth={1.5}
                className={isYou ? undefined : "pulse-dot"}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
              {isYou && (
                <text x={x(d.mean)} y={cy - 16} textAnchor="middle" className="you-marker-label">
                  You
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover && (() => {
        const d = sorted.find((e) => e.key === hover)!;
        const i = sorted.indexOf(d);
        const cy = M.top + 14 + i * ROW_H;
        return (
          <ChartTooltip x={x(d.mean)} y={cy - 34} visible>
            <strong>{labelFor ? labelFor(d.key) : d.key}</strong>
            <div>mean IQ {d.mean.toFixed(1)} ({d.mean >= populationMean ? "+" : ""}{(d.mean - populationMean).toFixed(1)} vs pop.)</div>
            <div className="tooltip-muted">n = {d.n.toLocaleString()}</div>
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
