import { useReducedMotion } from "../lib/useReducedMotion";

interface FlowNode {
  id: "A" | "B" | "C" | "D" | "E" | "F";
  label: string;
  sublabel: string;
  color: string;
  cx: number;
  cy: number;
}

interface Props {
  subtitles: Record<FlowNode["id"], string>;
}

const NODE_W = 148;
const NODE_H = 60;
const W = 960;
const H = 300;

const BASE_NODES: Omit<FlowNode, "sublabel">[] = [
  { id: "A", label: "Parental IQ & SES", color: "var(--series-1)", cx: 95, cy: 150 },
  { id: "B", label: "Prenatal environment", color: "var(--series-3)", cx: 320, cy: 68 },
  { id: "D", label: "Early-life environment", color: "var(--series-6)", cx: 320, cy: 232 },
  { id: "C", label: "Birth outcomes", color: "var(--series-2)", cx: 545, cy: 68 },
  { id: "E", label: "Child IQ", color: "var(--series-5)", cx: 730, cy: 150 },
  { id: "F", label: "Cognitive potential", color: "var(--series-8)", cx: 900, cy: 150 },
];

function right(n: Omit<FlowNode, "sublabel">) {
  return { x: n.cx + NODE_W / 2, y: n.cy };
}
function left(n: Omit<FlowNode, "sublabel">) {
  return { x: n.cx - NODE_W / 2, y: n.cy };
}

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const midX = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${midX},${a.y} ${midX},${b.y} ${b.x},${b.y}`;
}

function chainPath(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const midX = (p0.x + p1.x) / 2;
    d += ` C${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

export function CausalFlowChart({ subtitles }: Props) {
  const reducedMotion = useReducedMotion();
  const nodes: FlowNode[] = BASE_NODES.map((n) => ({ ...n, sublabel: subtitles[n.id] }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<FlowNode["id"], FlowNode>;

  const edges: [FlowNode["id"], FlowNode["id"]][] = [
    ["A", "B"],
    ["A", "D"],
    ["B", "C"],
    ["C", "E"],
    ["D", "E"],
    ["E", "F"],
  ];

  const MAIN_DUR = 8; // seconds for A -> B -> C -> E -> F
  const mainD = chainPath([right(byId.A), left(byId.B), right(byId.B), left(byId.C), right(byId.C), left(byId.E), right(byId.E), left(byId.F)]);
  const branchD = chainPath([right(byId.A), left(byId.D), right(byId.D), left(byId.E)]);
  const BRANCH_DUR = (MAIN_DUR / 4) * 3; // A->D->E covers the same distance-fraction as A->B->C->E

  // arrival times along the main chain (4 equal segments): B .25, C .5, E .75, F 1
  const arrival = {
    A: 0,
    B: MAIN_DUR * 0.25,
    C: MAIN_DUR * 0.5,
    D: BRANCH_DUR * 0.5,
    E: MAIN_DUR * 0.75,
    F: MAIN_DUR,
  };

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Causal pathway from parental and prenatal factors through to measured child IQ and cognitive potential">
        {edges.map(([from, to]) => (
          <path
            key={`${from}-${to}`}
            d={edgePath(right(byId[from]), left(byId[to]))}
            fill="none"
            stroke="var(--abd-border)"
            strokeWidth={2}
            markerEnd="url(#flow-arrowhead)"
          />
        ))}

        <defs>
          <marker id="flow-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--abd-border)" />
          </marker>
        </defs>

        {!reducedMotion && (
          <>
            {[0, 1, 2].map((i) => (
              <circle key={`main-${i}`} r={4.5} fill="var(--series-5)" opacity={0.9}>
                <animateMotion dur={`${MAIN_DUR}s`} repeatCount="indefinite" begin={`${i * (MAIN_DUR / 3)}s`}>
                  <mpath href="#flow-main-path" />
                </animateMotion>
              </circle>
            ))}
            <circle r={4} fill="var(--series-6)" opacity={0.85}>
              <animateMotion dur={`${BRANCH_DUR}s`} repeatCount="indefinite">
                <mpath href="#flow-branch-path" />
              </animateMotion>
            </circle>
          </>
        )}
        <path id="flow-main-path" d={mainD} fill="none" stroke="none" />
        <path id="flow-branch-path" d={branchD} fill="none" stroke="none" />

        {nodes.map((n) => (
          <g key={n.id}>
            {!reducedMotion && (
              <circle
                cx={n.cx}
                cy={n.cy}
                r={NODE_H / 2}
                fill="none"
                stroke={n.color}
                strokeWidth={2}
                opacity={0}
                className="node-pulse"
              >
                <animate
                  attributeName="r"
                  values={`${NODE_H / 2};${NODE_H / 2 + 20}`}
                  dur={`${n.id === "D" ? BRANCH_DUR : MAIN_DUR}s`}
                  begin={`${arrival[n.id]}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.55;0"
                  dur={`${n.id === "D" ? BRANCH_DUR : MAIN_DUR}s`}
                  begin={`${arrival[n.id]}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <rect
              x={n.cx - NODE_W / 2}
              y={n.cy - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={10}
              fill="var(--abd-surface)"
              stroke={n.color}
              strokeWidth={1.75}
            />
            <text x={n.cx} y={n.cy - 8} textAnchor="middle" className="flow-node-label">
              {n.label}
            </text>
            <text x={n.cx} y={n.cy + 12} textAnchor="middle" className="flow-node-sublabel" fill={n.color}>
              {n.sublabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
