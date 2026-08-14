import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

// A sparse field of larger, procedurally-drawn pixel flowers. Each flower is
// built live from polar coordinates around its own center: petals are lens
// shapes whose length and width breathe through a bloom -> wilt -> bloom
// cycle, each swaying and pulsing on its own independent timing so the whole
// shape reads as alive rather than a static sprite. Petal tips flicker into
// colored 8-bit data blocks with a tiny glyph, echoing the reference clip's
// glitchy edges. Purely decorative: aria-hidden, pointer-events: none,
// frozen to a single mid-bloom frame under reduced motion.

const PETAL_COUNT = 6;
const GLYPHS = ["0", "1", "2", "6", "8", "9", "#", "%", "&"];
const SLOT_W = 280;
const SLOT_H = 300;
const SLOT_DENSITY = 0.62;
const BASE_RADIUS = 105;
const BASE_CELL_PX = 8;
const FRAME_MS = 130;
const BLOOM_PERIOD_MS = 16000;
const GLITCH_PERIOD_MS = 2600;

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

function wrapAngle(a: number): number {
  let w = a;
  while (w > Math.PI) w -= Math.PI * 2;
  while (w < -Math.PI) w += Math.PI * 2;
  return w;
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
    let coreColor = "#b07d1f";
    let accentColors: string[] = [];
    let monoFont = "monospace";

    function readPalette() {
      inkColor = readVar("--abd-text-muted", "#8a7c8c");
      coreColor = readVar("--abd-brand-bold", "#b07d1f");
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
      monoFont = readVar("--font-mono", "monospace");
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    }

    function drawFlower(cx: number, cy: number, radius: number, cellPx: number, sx: number, sy: number, nowMs: number) {
      const bloomPeriod = BLOOM_PERIOD_MS * (0.75 + hash(sx * 13 + 1, sy * 17 + 2) * 0.6);
      const bloomPhase = hash(sx * 19 + 3, sy * 23 + 5) * Math.PI * 2;
      const bloomT = (Math.sin((nowMs / bloomPeriod) * Math.PI * 2 + bloomPhase) + 1) / 2;

      const coreRadius = radius * (0.14 + 0.05 * bloomT);
      const petalLenBase = radius * (0.3 + 0.7 * bloomT);
      const petalWidthBase = (0.18 + 0.14 * bloomT) * (Math.PI / PETAL_COUNT);

      const petalAngle: number[] = [];
      const petalLen: number[] = [];
      const petalHalfWidth: number[] = [];
      for (let i = 0; i < PETAL_COUNT; i++) {
        const baseAngle = (i / PETAL_COUNT) * Math.PI * 2;
        const swayPeriod = 5000 + hash(sx * 29 + i, sy * 31 + i * 2) * 4000;
        const swayPhase = hash(sx * 37 + i * 3, sy * 41 + i * 5) * Math.PI * 2;
        const sway = Math.sin((nowMs / swayPeriod) * Math.PI * 2 + swayPhase) * 0.06;
        petalAngle.push(baseAngle + sway);

        const lenPulsePeriod = 3600 + hash(sx * 43 + i, sy * 47 + i * 2) * 3000;
        const lenPulsePhase = hash(sx * 53 + i * 3, sy * 59 + i * 5) * Math.PI * 2;
        const lenPulse = 0.9 + 0.1 * Math.sin((nowMs / lenPulsePeriod) * Math.PI * 2 + lenPulsePhase);
        petalLen.push(petalLenBase * lenPulse);
        petalHalfWidth.push(petalWidthBase * (0.9 + 0.2 * hash(sx * 61 + i, sy * 67 + i * 2)));
      }

      ctx.font = `${Math.max(6, cellPx - 1)}px ${monoFont}`;

      const cells = Math.ceil((radius * 2) / cellPx);
      for (let ry = 0; ry < cells; ry++) {
        for (let rx = 0; rx < cells; rx++) {
          const dx = rx * cellPx - radius;
          const dy = ry * cellPx - radius;
          const rho = Math.sqrt(dx * dx + dy * dy);
          if (rho > radius) continue;
          const px = cx + dx;
          const py = cy + dy;

          if (rho <= coreRadius) {
            const pulse = 0.22 + 0.06 * Math.sin(nowMs / 1900 + sx * 3 + sy * 5);
            ctx.fillStyle = withAlpha(coreColor, pulse);
            ctx.fillRect(px, py, cellPx, cellPx);
            continue;
          }

          const theta = Math.atan2(dy, dx);
          let matched = -1;
          let matchedV = 0;
          for (let i = 0; i < PETAL_COUNT; i++) {
            const v = rho / petalLen[i];
            if (v > 1) continue;
            const widthAtV = petalHalfWidth[i] * Math.sin(Math.PI * v);
            if (Math.abs(wrapAngle(theta - petalAngle[i])) <= widthAtV) {
              matched = i;
              matchedV = v;
              break;
            }
          }
          if (matched === -1) continue;

          const cellHash = hash(sx * 97 + rx * 7 + 3, sy * 101 + ry * 11 + matched * 5);
          const glitchPeriod = GLITCH_PERIOD_MS * (0.7 + hash(sx * 103 + rx, sy * 107 + ry) * 0.8);
          const t = ((nowMs + cellHash * glitchPeriod) % glitchPeriod) / glitchPeriod;
          const glitchChance = 0.1 + 0.3 * matchedV;

          if (t > glitchChance) {
            ctx.fillStyle = withAlpha(inkColor, 0.18);
            ctx.fillRect(px, py, cellPx, cellPx);
            continue;
          }

          const accent = accentColors[Math.floor(hash(sx * 109 + rx * 5, sy * 113 + ry * 9) * accentColors.length)];
          ctx.fillStyle = withAlpha(accent, 0.42);
          ctx.fillRect(px, py, cellPx, cellPx);
          ctx.strokeStyle = withAlpha(accent, 0.7);
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellPx - 1, cellPx - 1);

          if (cellPx >= 6) {
            const glyph = GLYPHS[Math.floor(hash(sx * 127 + rx * 3, sy * 131 + ry * 5) * GLYPHS.length)];
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
          const radius = BASE_RADIUS * (0.8 + hash(sx * 53 + 9, sy * 59 + 13) * 0.55);
          const cellPx = BASE_CELL_PX * (0.85 + hash(sx * 151 + 17, sy * 157 + 19) * 0.4);
          const cx = sx * SLOT_W + jx + SLOT_W / 2;
          const cy = sy * SLOT_H + jy + SLOT_H / 2;
          drawFlower(cx, cy, radius, cellPx, sx, sy, nowMs);
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
