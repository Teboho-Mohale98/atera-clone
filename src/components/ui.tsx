import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dot)} /> : null}
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type ButtonSize = "sm" | "md" | "icon";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus-visible:outline-brand-600",
  secondary:
    "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:outline-red-600",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-slate-400",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  icon: "size-8 justify-center",
};

export function Button({
  children,
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  disabled,
  onClick,
  title,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Avatar({
  name,
  color,
  size = 32,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? "#4f46e5",
        fontSize: size * 0.38,
      }}
    >
      {initials(name)}
    </span>
  );
}

const TONES = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  brand: "bg-brand-600",
  sky: "bg-sky-500",
};

export function ProgressBar({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all", TONES[tone])}
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {icon ? (
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export const fieldClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
