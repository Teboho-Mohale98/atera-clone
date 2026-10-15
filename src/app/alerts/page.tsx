"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCheck,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, EmptyState, fieldClassName } from "@/components/ui";
import { severityBar, severityStyle, alertStatusStyle, alertStatusLabel } from "@/lib/meta";
import { cn, timeAgo } from "@/lib/utils";
import type { AlertSeverity, AlertStatus } from "@/lib/types";

const SEVERITIES: AlertSeverity[] = ["critical", "high", "medium", "low"];
const STATUS_TABS: Array<{ id: "all" | AlertStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "acknowledged", label: "Acknowledged" },
  { id: "resolved", label: "Resolved" },
];

export default function AlertsPage() {
  const {
    alerts,
    devices,
    customers,
    ackAlert,
    resolveAlert,
    reopenAlert,
    bulkAck,
  } = useApp();

  const [tab, setTab] = useState<"all" | AlertStatus>("active");
  const [severity, setSeverity] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts
      .filter((a) => {
        if (tab !== "all" && a.status !== tab) return false;
        if (severity !== "all" && a.severity !== severity) return false;
        if (customerId !== "all" && a.customerId !== customerId) return false;
        if (q) {
          const device = devices.find((d) => d.id === a.deviceId);
          const haystack = `${a.title} ${a.category} ${device?.hostname ?? ""}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const rank: Record<AlertSeverity, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        if (a.status !== b.status) return a.status === "active" ? -1 : 1;
        if (rank[a.severity] !== rank[b.severity])
          return rank[a.severity] - rank[b.severity];
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [alerts, devices, tab, severity, customerId, query]);

  const counts = useMemo(() => {
    const active = alerts.filter((a) => a.status === "active");
    return {
      critical: active.filter((a) => a.severity === "critical").length,
      high: active.filter((a) => a.severity === "high").length,
      medium: active.filter((a) => a.severity === "medium").length,
      low: active.filter((a) => a.severity === "low").length,
    };
  }, [alerts]);

  const allSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((a) => a.id)));
  }

  function acknowledgeSelected() {
    const ids = filtered
      .filter((a) => selected.has(a.id) && a.status === "active")
      .map((a) => a.id);
    if (ids.length === 0) return;
    bulkAck(ids);
    setSelected(new Set());
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Alerts"
        description="Monitoring engine output across the managed fleet."
        actions={
          <Button
            variant="primary"
            size="md"
            disabled={selected.size === 0}
            onClick={acknowledgeSelected}
          >
            <CheckCheck className="size-4" />
            Acknowledge selected ({selected.size})
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SEVERITIES.map((sev) => (
          <button
            key={sev}
            onClick={() => {
              setSeverity(severity === sev ? "all" : sev);
              setTab("active");
            }}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-colors",
              severity === sev
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <span className={cn("h-8 w-1.5 rounded-full", severityBar[sev])} />
            <span>
              <span className="block text-xl font-bold tabular-nums text-slate-900">
                {counts[sev]}
              </span>
              <span className="text-xs capitalize text-slate-500">{sev} active</span>
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">
          <div className="flex rounded-lg bg-slate-100 p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  tab === t.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search alerts, categories, or devices"
              className={cn(fieldClassName, "pl-9")}
            />
          </div>
          <select
            className={cn(fieldClassName, "w-auto")}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="all">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="No alerts here"
            description="Nothing matches the current filters — the fleet looks healthy."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            <li className="flex items-center gap-3 bg-slate-50/60 px-5 py-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                {filtered.length} alert{filtered.length === 1 ? "" : "s"}
              </span>
            </li>
            {filtered.map((alert) => {
              const device = devices.find((d) => d.id === alert.deviceId);
              const customer = customers.find((c) => c.id === alert.customerId);
              return (
                <li
                  key={alert.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 sm:flex-nowrap"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(alert.id)}
                    onChange={() => toggle(alert.id)}
                    className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span
                    className={cn("h-10 w-1.5 shrink-0 rounded-full", severityBar[alert.severity])}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {alert.title}
                      </p>
                      <Badge className={severityStyle[alert.severity]}>
                        {alert.severity}
                      </Badge>
                      <Badge className={alertStatusStyle[alert.status]}>
                        {alertStatusLabel[alert.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {alert.description}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {device ? (
                        <Link
                          href={`/devices/${device.id}`}
                          className="font-medium text-slate-500 hover:text-brand-600"
                        >
                          {device.hostname}
                        </Link>
                      ) : (
                        "Unknown device"
                      )}{" "}
                      · {customer?.name} · {alert.category} · {timeAgo(alert.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {alert.status === "active" ? (
                      <Button size="sm" variant="secondary" onClick={() => ackAlert(alert.id)}>
                        <Check className="size-3.5" />
                        Ack
                      </Button>
                    ) : null}
                    {alert.status !== "resolved" ? (
                      <Button size="sm" variant="primary" onClick={() => resolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => reopenAlert(alert.id)}>
                        <RotateCcw className="size-3.5" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
