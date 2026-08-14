import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

// A sparse field of small pixel-mosaic flower silhouettes. Each flower is a
// fixed bitmap mask: interior pixels sit as a calm, steady fill, while the
// pixels along the shape's boundary intermittently "glitch" into a colored
// 8-bit data block with a tiny glyph, then settle back — as if the shape is
// continuously assembling itself out of noise. Purely decorative: aria-hidden,
// pointer-events: none, frozen to a single calm frame under reduced motion.

const FLOWER_MASK: number[][] = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
];
const MASK_H = FLOWER_MASK.length;
const MASK_W = FLOWER_MASK[0].length;

// A filled cell is "boundary" if any neighbor (or the mask edge) is empty.
const BOUNDARY: boolean[][] = FLOWER_MASK.map((row, r) =>
  row.map((v, c) => {
    if (!v) return false;
    const up = r > 0 ? FLOWER_MASK[r - 1][c] : 0;
    const down = r < MASK_H - 1 ? FLOWER_MASK[r + 1][c] : 0;
    const left = c > 0 ? row[c - 1] : 0;
    const right = c < MASK_W - 1 ? row[c + 1] : 0;
    return !(up && down && left && right);
  }),
);

const GLYPHS = ["0", "1", "2", "6", "8", "9", "#", "%", "&"];
const SLOT_W = 190;
const SLOT_H = 210;
const SLOT_DENSITY = 0.5;
const BASE_CELL_PX = 7;
const FRAME_MS = 140;
const GLITCH_PERIOD_MS = 2600;
const GLITCH_FRACTION = 0.32;
const ROTATION_PERIOD_MS = 32000;

function hash(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) ^ (a << 13);
  h = Math.imul(h ^ (h >>> 15), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function readVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function AsciiFlowerBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;
    const canvas = canvasEl;
    const ctx = ctxEl;

    let width = 0;
    let height = 0;
    let slotCols = 0;
    let slotRows = 0;
    let inkColor = "#8a7c8c";
    let accentColors: string[] = [];

    function readPalette() {
      inkColor = readVar("--abd-text-muted", "#8a7c8c");
      accentColors = [
        readVar("--series-1", "#80303e"), // burgundy, echoes the reference's red
        readVar("--series-4", "#b07d1f"), // ochre, echoes the reference's orange
        readVar("--series-7", "#3f597d"), // slate blue, echoes the reference's blue
      ];
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      slotCols = Math.ceil(width / SLOT_W) + 1;
      slotRows = Math.ceil(height / SLOT_H) + 1;
      ctx.font = `9px ${readVar("--font-mono", "monospace")}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    }

    function drawFlower(originX: number, originY: number, cellPx: number, sx: number, sy: number, nowMs: number) {
      for (let r = 0; r < MASK_H; r++) {
        for (let c = 0; c < MASK_W; c++) {
          if (!FLOWER_MASK[r][c]) continue;
          const px = originX + c * cellPx;
          const py = originY + r * cellPx;

          if (!BOUNDARY[r][c]) {
            ctx.fillStyle = withAlpha(inkColor, 0.2);
            ctx.fillRect(px, py, cellPx, cellPx);
            continue;
          }

          const cellPhase = hash(sx * 31 + c * 7 + 3, sy * 37 + r * 11 + 5);
          const period = GLITCH_PERIOD_MS * (0.7 + hash(sx * 13 + c, sy * 17 + r) * 0.8);
          const t = ((nowMs + cellPhase * period) % period) / period;

          if (t > GLITCH_FRACTION) {
            ctx.fillStyle = withAlpha(inkColor, 0.14);
            ctx.fillRect(px, py, cellPx, cellPx);
            continue;
          }

          const accent = accentColors[Math.floor(hash(sx * 19 + c * 5, sy * 23 + r * 9) * accentColors.length)];
          ctx.fillStyle = withAlpha(accent, 0.4);
          ctx.fillRect(px, py, cellPx, cellPx);
          ctx.strokeStyle = withAlpha(accent, 0.7);
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellPx - 1, cellPx - 1);

          if (cellPx >= 6) {
            const glyph = GLYPHS[Math.floor(hash(sx * 41 + c * 3, sy * 43 + r * 5) * GLYPHS.length)];
            ctx.fillStyle = withAlpha(inkColor, 0.5);
            ctx.fillText(glyph, px + cellPx / 2, py + cellPx / 2 + 0.5);
          }
        }
      }
    }

    function drawFrame(nowMs: number) {
      ctx.clearRect(0, 0, width, height);
      for (let sy = 0; sy < slotRows; sy++) {
        for (let sx = 0; sx < slotCols; sx++) {
          if (hash(sx, sy) > SLOT_DENSITY) continue;
          const jx = (hash(sx * 3 + 1, sy * 5 + 2) - 0.5) * SLOT_W * 0.5;
          const jy = (hash(sx * 7 + 3, sy * 11 + 4) - 0.5) * SLOT_H * 0.5;
          const cellPx = BASE_CELL_PX * (0.75 + hash(sx * 53 + 9, sy * 59 + 13) * 0.55);
          const originX = sx * SLOT_W + jx;
          const originY = sy * SLOT_H + jy;
          const flowerW = MASK_W * cellPx;
          const flowerH = MASK_H * cellPx;
          const centerX = originX + flowerW / 2;
          const centerY = originY + flowerH / 2;

          const spinDir = hash(sx * 61 + 17, sy * 67 + 19) < 0.5 ? -1 : 1;
          const spinPeriod = ROTATION_PERIOD_MS * (0.6 + hash(sx * 71 + 23, sy * 73 + 29) * 0.8);
          const spinPhase = hash(sx * 79 + 31, sy * 83 + 37) * Math.PI * 2;
          const angle = spinDir * ((nowMs / spinPeriod) * Math.PI * 2 + spinPhase);

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          ctx.translate(-flowerW / 2, -flowerH / 2);
          drawFlower(0, 0, cellPx, sx, sy, nowMs);
          ctx.restore();
        }
      }
    }

    readPalette();
    resize();
    drawFrame(0);

    let rafId = 0;
    let lastFrame = 0;

    function loop(now: number) {
      if (now - lastFrame >= FRAME_MS) {
        lastFrame = now;
        drawFrame(now);
      }
      rafId = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      if (reducedMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    }

    let resizeTimer: number | undefined;
    function handleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        drawFrame(reducedMotion ? 0 : performance.now());
      }, 200);
    }

    const themeObserver = new MutationObserver(() => {
      readPalette();
      drawFrame(reducedMotion ? 0 : performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (!reducedMotion) {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      themeObserver.disconnect();
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="ascii-flower-bg" aria-hidden="true" />;
}
