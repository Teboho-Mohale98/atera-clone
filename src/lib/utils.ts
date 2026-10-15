export const NOW = new Date("2026-10-15T09:30:00.000Z");
export const NOW_MS = NOW.getTime();

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const DATETIME_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATETIME_FMT.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const diff = NOW_MS - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function dueLabel(iso: string): { label: string; overdue: boolean } {
  const diff = new Date(iso).getTime() - NOW_MS;
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3600000);
  if (hours < 1) return { label: overdue ? "Overdue" : "<1h", overdue };
  if (hours < 24) return { label: overdue ? `${hours}h over` : `${hours}h`, overdue };
  const days = Math.floor(hours / 24);
  return { label: overdue ? `${days}d over` : `${days}d`, overdue };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function percent(value: number): string {
  return `${Math.round(value)}%`;
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function usageTone(value: number): "emerald" | "amber" | "red" {
  if (value >= 90) return "red";
  if (value >= 75) return "amber";
  return "emerald";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function osLabel(os: string): string {
  if (os === "macos") return "macOS";
  if (os === "windows") return "Windows";
  return "Linux";
}
