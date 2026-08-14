import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

// A sparse field of tiny ASCII "plants," each independently cycling through
// a full growth -> bloom -> wilt -> rest loop (metamorphosis), staggered by
// a per-cell hash so the field never pulses in sync. Purely decorative:
// aria-hidden, pointer-events: none, and frozen to a single frame when the
// user prefers reduced motion.

type Role = "seed" | "stem" | "bloom" | "wilt";

const PEAK = "\0"; // sentinel: swapped for a per-cell bloom glyph at draw time

const STAGES: { ch: string; role: Role }[] = [
  { ch: "·", role: "seed" },
  { ch: "`", role: "seed" },
  { ch: "'", role: "stem" },
  { ch: "i", role: "stem" },
  { ch: "!", role: "stem" },
  { ch: "Y", role: "stem" },
  { ch: "y", role: "bloom" },
  { ch: PEAK, role: "bloom" },
  { ch: PEAK, role: "bloom" },
  { ch: "y", role: "bloom" },
  { ch: "Y", role: "wilt" },
  { ch: ",", role: "wilt" },
  { ch: ".", role: "wilt" },
  { ch: " ", role: "seed" },
  { ch: " ", role: "seed" },
];

const BLOOM_GLYPHS = ["*", "%", "@", "+", "#", "&"];
const CELL_W = 28;
const CELL_H = 32;
const DENSITY = 0.22;
const FRAME_MS = 130;
const CYCLE_BASE_MS = 11000;
const CYCLE_JITTER_MS = 7000;

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

function alphaFor(role: Role): number {
  switch (role) {
    case "bloom":
      return 0.42;
    case "stem":
      return 0.24;
    case "wilt":
      return 0.18;
    default:
      return 0.12;
  }
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
    let cols = 0;
    let rows = 0;
    let seriesColors: string[] = [];
    let stemColor = "#4f7350";
    let wiltColor = "#8a7c8c";
    let seedColor = "#c9bdb0";

    function readPalette() {
      seriesColors = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => readVar(`--series-${n}`, "#4f7350"));
      stemColor = readVar("--series-2", "#4f7350");
      wiltColor = readVar("--abd-text-muted", "#8a7c8c");
      seedColor = readVar("--chart-axis", "#c9bdb0");
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
      cols = Math.ceil(width / CELL_W) + 1;
      rows = Math.ceil(height / CELL_H) + 1;
      ctx.font = `18px ${readVar("--font-mono", "monospace")}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    }

    function colorFor(role: Role, col: number, row: number): string {
      if (role === "bloom") {
        const idx = Math.floor(hash(col * 3 + 1, row * 5 + 2) * seriesColors.length);
        return seriesColors[idx] ?? stemColor;
      }
      if (role === "stem") return stemColor;
      if (role === "wilt") return wiltColor;
      return seedColor;
    }

    function drawFrame(nowMs: number) {
      ctx.clearRect(0, 0, width, height);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (hash(col, row) > DENSITY) continue;

          const phase = hash(col * 11 + 3, row * 17 + 7);
          const cycle = CYCLE_BASE_MS + hash(col * 19 + 5, row * 23 + 9) * CYCLE_JITTER_MS;
          const t = ((nowMs + phase * cycle) % cycle) / cycle;
          const stage = STAGES[Math.min(Math.floor(t * STAGES.length), STAGES.length - 1)];
          if (stage.ch === " ") continue;

          const ch =
            stage.ch === PEAK
              ? BLOOM_GLYPHS[Math.floor(hash(col * 29 + 13, row * 31 + 17) * BLOOM_GLYPHS.length)]
              : stage.ch;

          ctx.fillStyle = withAlpha(colorFor(stage.role, col, row), alphaFor(stage.role));
          ctx.fillText(ch, col * CELL_W + CELL_W / 2, row * CELL_H + CELL_H / 2);
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
