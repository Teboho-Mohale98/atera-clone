import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts";

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "up",
  icon,
  spark,
  sparkColor,
  footer,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon?: ReactNode;
  spark?: number[];
  sparkColor?: string;
  footer?: ReactNode;
  className?: string;
}) {
  const deltaClass =
    deltaTone === "up"
      ? "text-emerald-600"
      : deltaTone === "down"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {delta ? (
            <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", deltaClass)}>
              {delta}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        ) : null}
      </div>
      {spark ? (
        <div className="mt-3 -mb-1">
          <Sparkline data={spark} color={sparkColor ?? "#4f46e5"} />
        </div>
      ) : null}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
