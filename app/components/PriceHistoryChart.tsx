"use client";

import { useMemo, useState } from "react";
import type { PriceHistoryPoint } from "@/app/lib/api";
import AppIcon from "@/app/components/AppIcon";

interface PriceHistoryChartProps {
  points: PriceHistoryPoint[];
  phoneName: string;
}

// viewBox units — the SVG scales to its container width via CSS while keeping
// this aspect ratio, so strokes stay crisp and uniform at any screen size.
const VB_W = 600;
const VB_H = 220;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 16;

function formatPrice(n: number) {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function PriceHistoryChart({ points, phoneName }: PriceHistoryChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    // Keep only valid, positive prices and sort chronologically.
    const clean = (points || [])
      .filter((p) => Number(p.price_pkr) > 0 && !isNaN(Date.parse(p.date)))
      .map((p) => ({ price: Number(p.price_pkr), time: Date.parse(p.date), date: p.date }))
      .sort((a, b) => a.time - b.time);

    if (clean.length < 2) return null;

    const prices = clean.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || 1; // avoid divide-by-zero on a flat line

    const innerW = VB_W - PAD_X * 2;
    const innerH = VB_H - PAD_TOP - PAD_BOTTOM;

    const coords = clean.map((p, i) => {
      const x = PAD_X + (clean.length === 1 ? innerW / 2 : (i / (clean.length - 1)) * innerW);
      // Flat series sits mid-height; otherwise scale within [min, max].
      const t = max === min ? 0.5 : (p.price - min) / span;
      const y = PAD_TOP + (1 - t) * innerH;
      return { ...p, x, y, xPct: (x / VB_W) * 100 };
    });

    const first = clean[0].price;
    const last = clean[clean.length - 1].price;
    const change = last - first;
    const changePct = first ? (change / first) * 100 : 0;

    return { coords, min, max, first, last, change, changePct };
  }, [points]);

  if (!chart) return null;

  const { coords, min, max, last, change, changePct } = chart;
  const dropped = change < 0;
  const unchanged = change === 0;
  const active = activeIndex != null ? coords[activeIndex] : null;

  return (
    <section className="bg-white border border-border-subtle rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center gap-2">
        <AppIcon name="trending_up" size={22} className="text-primary" />
        <h2 className="font-headline-md text-lg font-bold text-text-main">
          Price History for {phoneName}
        </h2>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
        <div className="p-3 md:p-4 text-center">
          <span className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider block">Current</span>
          <span className="text-sm md:text-base font-bold text-text-main">{formatPrice(last)}</span>
        </div>
        <div className="p-3 md:p-4 text-center">
          <span className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider block">Lowest</span>
          <span className="text-sm md:text-base font-bold text-price-green">{formatPrice(min)}</span>
        </div>
        <div className="p-3 md:p-4 text-center">
          <span className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider block">Change</span>
          <span
            className={`text-sm md:text-base font-bold inline-flex items-center gap-0.5 ${
              unchanged ? "text-text-muted" : dropped ? "text-price-green" : "text-rose-600"
            }`}
          >
            {!unchanged && (
              <AppIcon name={dropped ? "arrow_downward" : "arrow_upward"} size={14} />
            )}
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative p-4 md:p-6">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label={`Price history graph for ${phoneName}`}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="priceHistoryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #2563eb)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-primary, #2563eb)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area + line */}
          <path d={areaPathFrom(coords)} fill="url(#priceHistoryFill)" />
          <path
            d={linePathFrom(coords)}
            fill="none"
            stroke="var(--color-primary, #2563eb)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Active vertical guide */}
          {active && (
            <line
              x1={active.x}
              y1={PAD_TOP - 6}
              x2={active.x}
              y2={VB_H - PAD_BOTTOM}
              stroke="var(--color-border-subtle, #e5e7eb)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}

          {/* Dots */}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={activeIndex === i ? 5 : 3.5}
              fill="#fff"
              stroke="var(--color-primary, #2563eb)"
              strokeWidth={2}
            />
          ))}

          {/* Invisible hit areas for hover/touch */}
          {coords.map((c, i) => {
            const half = (VB_W - PAD_X * 2) / (coords.length - 1) / 2;
            return (
              <rect
                key={`hit-${i}`}
                x={c.x - half}
                y={0}
                width={half * 2}
                height={VB_H}
                fill="transparent"
                onMouseEnter={() => setActiveIndex(i)}
                onTouchStart={() => setActiveIndex(i)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {active && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full z-10 px-2.5 py-1.5 rounded-lg bg-text-main text-white text-xs shadow-lg whitespace-nowrap"
            style={{
              left: `clamp(56px, ${active.xPct}%, calc(100% - 56px))`,
              top: "10%",
            }}
          >
            <div className="font-bold">{formatPrice(active.price)}</div>
            <div className="text-white/70 text-[10px]">{formatDate(active.date)}</div>
          </div>
        )}
      </div>

      {/* Date range footer */}
      <div className="px-4 md:px-6 pb-4 flex items-center justify-between text-[10px] md:text-xs text-text-muted">
        <span>{formatDate(coords[0].date)}</span>
        <span>Highest: {formatPrice(max)}</span>
        <span>{formatDate(coords[coords.length - 1].date)}</span>
      </div>
    </section>
  );
}

// Path builders kept module-level so the JSX stays readable.
function linePathFrom(coords: { x: number; y: number }[]) {
  return coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
}

function areaPathFrom(coords: { x: number; y: number }[]) {
  if (!coords.length) return "";
  const baseline = VB_H - PAD_BOTTOM;
  return (
    `M ${coords[0].x.toFixed(1)} ${baseline.toFixed(1)} ` +
    coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ") +
    ` L ${coords[coords.length - 1].x.toFixed(1)} ${baseline.toFixed(1)} Z`
  );
}
