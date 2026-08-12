import { useState } from "react";
import { ChartTooltip } from "../components/ChartTooltip";
import { useReducedMotion } from "../lib/useReducedMotion";

interface Props {
  variables: string[];
  values: number[][];
  labels: Record<string, string>;
}

const CELL = 56;
const M = { top: 8, right: 8, bottom: 8, left: 150 };

function diverge(r: number): string {
  const t = Math.min(1, Math.abs(r));
  const hue = r >= 0 ? "var(--diverging-pos)" : "var(--diverging-neg)";
  return `color-mix(in oklab, ${hue} ${Math.round(t * 100)}%, var(--diverging-mid))`;
}

export function CorrelationHeatmap({ variables, values, labels }: Props) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const reducedMotion = useReducedMotion();
  const n = variables.length;
  const W = M.left + M.right + n * CELL;
  const H = M.top + M.bottom + n * CELL + 90;

  const matrixSize = n * CELL;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Correlation matrix among numeric predictors and child IQ">
        <defs>
          <clipPath id="heatmap-clip">
            <rect x={0} y={0} width={matrixSize} height={matrixSize} rx={4} />
          </clipPath>
          <linearGradient id="heatmap-shimmer-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--abd-text-primary)" stopOpacity={0} />
            <stop offset="50%" stopColor="var(--abd-text-primary)" stopOpacity={0.16} />
            <stop offset="100%" stopColor="var(--abd-text-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(${M.left}, ${M.top + 90})`}>
          {variables.map((rowVar, ri) => (
            <text key={rowVar} x={-10} y={ri * CELL + CELL / 2} textAnchor="end" dominantBaseline="middle" className="lollipop-label">
              {labels[rowVar] ?? rowVar}
            </text>
          ))}
          {variables.map((colVar, ci) => (
            <text
              key={colVar}
              transform={`translate(${ci * CELL + CELL / 2}, -10) rotate(-40)`}
              textAnchor="start"
              className="lollipop-label"
            >
              {labels[colVar] ?? colVar}
            </text>
          ))}
          {values.map((row, ri) =>
            row.map((v, ci) => {
              const isHover = hover?.[0] === ri && hover?.[1] === ci;
              return (
                <g key={`${ri}-${ci}`} onMouseEnter={() => setHover([ri, ci])} onMouseLeave={() => setHover(null)}>
                  <rect
                    x={ci * CELL + 2}
                    y={ri * CELL + 2}
                    width={CELL - 4}
                    height={CELL - 4}
                    rx={4}
                    fill={diverge(v)}
                    stroke={isHover ? "var(--abd-text-primary)" : "transparent"}
                    strokeWidth={1.5}
                    style={{ cursor: "pointer" }}
                  />
                  <text
                    x={ci * CELL + CELL / 2}
                    y={ri * CELL + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="heatmap-value"
                    fill={Math.abs(v) > 0.55 ? "#ffffff" : "var(--abd-text-primary)"}
                  >
                    {v.toFixed(2)}
                  </text>
                </g>
              );
            })
          )}
          <g clipPath="url(#heatmap-clip)" style={{ pointerEvents: "none" }}>
            <rect x={0} y={-matrixSize * 0.3} width={matrixSize * 0.5} height={matrixSize * 1.6} fill="url(#heatmap-shimmer-gradient)" transform="skewX(-20)">
              {!reducedMotion && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`${-matrixSize};${matrixSize * 1.3}`}
                  dur="4.2s"
                  repeatCount="indefinite"
                  additive="sum"
                />
              )}
            </rect>
          </g>
        </g>
      </svg>
      {hover && (
        <ChartTooltip x={M.left + hover[1] * CELL + CELL / 2} y={M.top + 90 + hover[0] * CELL} visible>
          <strong>{labels[variables[hover[0]]] ?? variables[hover[0]]} × {labels[variables[hover[1]]] ?? variables[hover[1]]}</strong>
          <div>r = {values[hover[0]][hover[1]].toFixed(3)}</div>
        </ChartTooltip>
      )}
    </div>
  );
}
