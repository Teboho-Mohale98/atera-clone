"use client";

import { useRef, useState } from "react";
import type { TimeseriesPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------ Trend chart ------------------------------ */

interface Series {
  key: keyof Pick<TimeseriesPoint, "alerts" | "resolved" | "tickets" | "closed">;
  label: string;
  color: string;
}

function buildPath(points: Array<[number, number]>, smooth = true): string {
  if (points.length === 0) return "";
  if (points.length < 3 || !smooth) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  }
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

export function TrendChart({
  data,
  series,
  height = 260,
}: {
  data: TimeseriesPoint[];
  series: Series[];
  height?: number;
}) {
  const width = 760;
  const padX = 34;
  const padTop = 20;
  const padBottom = 30;
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(
    4,
    ...data.flatMap((d) => series.map((s) => d[s.key])),
  );
  const niceMax = Math.ceil(max / 4) * 4;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const xAt = (i: number) => padX + i * stepX;
  const yAt = (v: number) => padTop + innerH - (v / niceMax) * innerH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || data.length < 2) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, idx)));
  }

  const hoverPoint = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
      <div
        ref={ref}
        className="relative w-full"
        style={{ height }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          {gridLines.map((g) => (
            <line
              key={g}
              x1={padX}
              x2={width - padX}
              y1={padTop + innerH * g}
              y2={padTop + innerH * g}
              stroke="#e2e8f0"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {series.map((s) => {
            const pts = data.map(
              (d, i) => [xAt(i), yAt(d[s.key])] as [number, number],
            );
            return (
              <g key={s.key}>
                <path
                  d={`${buildPath(pts)} L${xAt(data.length - 1)},${padTop + innerH} L${xAt(0)},${padTop + innerH} Z`}
                  fill={s.color}
                  opacity={0.08}
                />
                <path
                  d={buildPath(pts)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
          {hover != null ? (
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={padTop}
              y2={padTop + innerH}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {hover != null
            ? series.map((s) => (
                <circle
                  key={s.key}
                  cx={xAt(hover)}
                  cy={yAt(data[hover][s.key])}
                  r={4}
                  fill="white"
                  stroke={s.color}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))
            : null}
        </svg>

        <div className="pointer-events-none absolute inset-x-0 -bottom-5 flex justify-between px-[30px] text-[10px] text-slate-400">
          {data.map((d, i) =>
            i % Math.ceil(data.length / 7) === 0 ? (
              <span key={d.label}>{d.label}</span>
            ) : null,
          )}
        </div>

        {hoverPoint ? (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(xAt(hover ?? 0) / width) * 100}%`,
            }}
          >
            <p className="mb-1 font-semibold text-slate-800">{hoverPoint.label}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-2 text-slate-600">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}:{" "}
                <span className="font-medium text-slate-900">
                  {hoverPoint[s.key]}
                </span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------- Donut ---------------------------------- */

export function DonutChart({
  data,
  size = 168,
  thickness = 20,
  centerLabel,
  centerValue,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const lengths = data.map((d) => (d.value / total) * circumference);
  const offsets = lengths.map((_, i) =>
    lengths.slice(0, i).reduce((sum, l) => sum + l, 0),
  );

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          {data.map((d, i) => (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${lengths[i]} ${circumference - lengths[i]}`}
              strokeDashoffset={-offsets[i]}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">
            {centerValue ?? total}
          </span>
          {centerLabel ? (
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto pl-4 font-semibold text-slate-900">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- Bars ---------------------------------- */

export function BarChart({
  data,
  height = 200,
  color = "#4f46e5",
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: d.color ?? color,
                minHeight: 4,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[10px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Gauge ---------------------------------- */

export function Gauge({
  value,
  label,
  size = 140,
  color = "#4f46e5",
}: {
  value: number;
  label?: string;
  size?: number;
  color?: string;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="-mt-4 flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-900">
          {Math.round(clamped)}%
        </span>
        {label ? <span className="text-xs text-slate-500">{label}</span> : null}
      </div>
    </div>
  );
}

/* ----------------------------- Sparkline -------------------------------- */

export function Sparkline({
  data,
  color = "#4f46e5",
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  const w = 100;
  const h = 32;
  const max = Math.max(1, ...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map(
    (v, i) =>
      [
        (i / (data.length - 1)) * w,
        h - ((v - min) / range) * (h - 4) - 2,
      ] as [number, number],
  );
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
    >
      <path d={area} fill={color} opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
