import type {
  AlertSeverity,
  AlertStatus,
  DeviceStatus,
  Plan,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";

export const deviceStatusStyle: Record<DeviceStatus, string> = {
  online: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  offline: "bg-slate-100 text-slate-600 ring-slate-500/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export const deviceStatusDot: Record<DeviceStatus, string> = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  warning: "bg-amber-500",
};

export const severityStyle: Record<AlertSeverity, string> = {
  critical: "bg-red-50 text-red-700 ring-red-600/20",
  high: "bg-orange-50 text-orange-700 ring-orange-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export const severityBar: Record<AlertSeverity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
};

export const alertStatusStyle: Record<AlertStatus, string> = {
  active: "bg-red-50 text-red-700 ring-red-600/20",
  acknowledged: "bg-amber-50 text-amber-700 ring-amber-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

export const alertStatusLabel: Record<AlertStatus, string> = {
  active: "Active",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export const priorityStyle: Record<TicketPriority, string> = {
  urgent: "bg-red-50 text-red-700 ring-red-600/20",
  high: "bg-orange-50 text-orange-700 ring-orange-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const ticketStatusStyle: Record<TicketStatus, string> = {
  open: "bg-sky-50 text-sky-700 ring-sky-600/20",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
};

export const priorityRank: Record<TicketPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const planStyle: Record<Plan, string> = {
  Essential: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Professional: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Growth: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Enterprise: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
};

export const severityOrder: AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const patchSeverityStyle: Record<string, string> = {
  critical: "bg-red-50 text-red-700 ring-red-600/20",
  important: "bg-orange-50 text-orange-700 ring-orange-600/20",
  moderate: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export const patchStatusStyle: Record<string, string> = {
  installed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
};
