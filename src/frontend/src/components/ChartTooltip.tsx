interface Props {
  x: number;
  y: number;
  visible: boolean;
  children: React.ReactNode;
}

export function ChartTooltip({ x, y, visible, children }: Props) {
  if (!visible) return null;
  return (
    <div
      className="chart-tooltip"
      style={{ left: x, top: y, opacity: visible ? 1 : 0 }}
      role="tooltip"
    >
      {children}
    </div>
  );
}
