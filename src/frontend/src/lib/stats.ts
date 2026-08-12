import type { HistBin } from "./types";

// Gaussian-kernel density estimate over an already-binned histogram, resampled
// to `points` steps across the domain — turns coarse bins into a smooth curve
// without needing the raw per-row values in the browser.
export function kde(bins: HistBin[], points = 64): { x: number; y: number }[] {
  const x0 = bins[0].x0;
  const x1 = bins[bins.length - 1].x1;
  const total = bins.reduce((a, b) => a + b.count, 0) || 1;
  const width = bins[0].x1 - bins[0].x0 || 1;
  const bandwidth = width * 1.8;

  const mids = bins.map((b) => (b.x0 + b.x1) / 2);
  const weights = bins.map((b) => b.count / total);

  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const x = x0 + ((x1 - x0) * i) / points;
    let y = 0;
    for (let j = 0; j < mids.length; j++) {
      const u = (x - mids[j]) / bandwidth;
      y += weights[j] * Math.exp(-0.5 * u * u);
    }
    out.push({ x, y });
  }
  const maxY = Math.max(...out.map((p) => p.y)) || 1;
  return out.map((p) => ({ x: p.x, y: p.y / maxY }));
}

export function linreg(points: { x: number; y: number }[]) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  const slope = num / den;
  const intercept = my - slope * mx;
  return { slope, intercept };
}
