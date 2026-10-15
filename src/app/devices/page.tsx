"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Download,
  Monitor,
  MonitorSmartphone,
  Plus,
  Search,
  Server,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, Badge, Button, Card, EmptyState, fieldClassName } from "@/components/ui";
import {
  deviceStatusDot,
  deviceStatusStyle,
} from "@/lib/meta";
import { cn, osLabel, percent, timeAgo, usageTone } from "@/lib/utils";
import type { Device } from "@/lib/types";

type SortKey = "hostname" | "customer" | "lastSeen" | "cpu";

function MiniBar({ value, label }: { value: number; label: string }) {
  const tone = usageTone(value);
  const color =
    tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-1.5" title={`${label}: ${percent(value)}`}>
      <span className="w-8 text-[10px] font-medium uppercase text-slate-400">
        {label}
      </span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <span
          className={cn("block h-full rounded-full", color)}
          style={{ width: `${Math.min(100, Math.max(3, value))}%` }}
        />
      </span>
      <span className="w-8 text-right text-[11px] tabular-nums text-slate-500">
        {percent(value)}
      </span>
    </div>
  );
}

export default function DevicesPage() {
  const { devices, customers, alerts } = useApp();
  const [query, setQuery] = useState("");
  const [customerId, setCustomerId] = useState("all");
  const [status, setStatus] = useState("all");
  const [os, setOs] = useState("all");
  const [sort, setSort] = useState<SortKey>("hostname");

  const alertCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of alerts) {
      if (a.status === "resolved") continue;
      map.set(a.deviceId, (map.get(a.deviceId) ?? 0) + 1);
    }
    return map;
  }, [alerts]);

  const customerName = useCallback(
    (id: string) => customers.find((c) => c.id === id)?.name ?? "—",
    [customers],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = devices.filter((d) => {
      if (customerId !== "all" && d.customerId !== customerId) return false;
      if (status !== "all" && d.status !== status) return false;
      if (os !== "all" && d.os !== os) return false;
      if (q) {
        const haystack = `${d.hostname} ${customerName(d.customerId)} ${d.ipAddress} ${d.loggedInUser}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "hostname") return a.hostname.localeCompare(b.hostname);
      if (sort === "customer")
        return customerName(a.customerId).localeCompare(customerName(b.customerId));
      if (sort === "cpu") return b.cpuUsage - a.cpuUsage;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
    return list;
  }, [devices, query, customerId, status, os, sort, customerName]);

  const statusCounts = useMemo(
    () => ({
      online: devices.filter((d) => d.status === "online").length,
      warning: devices.filter((d) => d.status === "warning").length,
      offline: devices.filter((d) => d.status === "offline").length,
    }),
    [devices],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Devices"
        description={`${devices.length} managed endpoints across ${customers.length} customers`}
        actions={
          <>
            <Button variant="secondary" size="md">
              <Download className="size-4" />
              Export
            </Button>
            <Button variant="primary" size="md">
              <Plus className="size-4" />
              Deploy agent
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        {[
          { label: "Online", value: statusCounts.online, tone: "text-emerald-600" },
          { label: "Warning", value: statusCounts.warning, tone: "text-amber-600" },
          { label: "Offline", value: statusCounts.offline, tone: "text-slate-500" },
        ].map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          >
            <span className={cn("text-lg font-bold tabular-nums", chip.tone)}>
              {chip.value}
            </span>
            <span className="text-xs text-slate-500">{chip.label}</span>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by hostname, customer, IP or user"
              className={cn(fieldClassName, "pl-9")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
            <select
              className={cn(fieldClassName, "w-auto")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Any status</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
            </select>
            <select
              className={cn(fieldClassName, "w-auto")}
              value={os}
              onChange={(e) => setOs(e.target.value)}
            >
              <option value="all">Any OS</option>
              <option value="windows">Windows</option>
              <option value="macos">macOS</option>
              <option value="linux">Linux</option>
            </select>
            <select
              className={cn(fieldClassName, "w-auto")}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="hostname">Sort: Hostname</option>
              <option value="customer">Sort: Customer</option>
              <option value="lastSeen">Sort: Last seen</option>
              <option value="cpu">Sort: CPU usage</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<MonitorSmartphone className="size-6" />}
            title="No devices match your filters"
            description="Try adjusting the search term or clearing a filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">
                    <span className="flex items-center gap-1">
                      Resources <ArrowUpDown className="size-3" />
                    </span>
                  </th>
                  <th className="px-3 py-3 font-medium">Alerts</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((device: Device) => {
                  const customer = customers.find(
                    (c) => c.id === device.customerId,
                  );
                  const count = alertCounts.get(device.id) ?? 0;
                  return (
                    <tr key={device.id} className="group hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/devices/${device.id}`}
                          className="flex items-center gap-3"
                        >
                          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            {device.type === "server" ? (
                              <Server className="size-4" />
                            ) : (
                              <Monitor className="size-4" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-slate-800 group-hover:text-brand-600">
                              {device.hostname}
                            </span>
                            <span className="block text-xs text-slate-400">
                              {osLabel(device.os)} · {device.loggedInUser}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className={deviceStatusStyle[device.status]}
                          dot={deviceStatusDot[device.status]}
                        >
                          {device.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <Avatar
                            name={customer?.name ?? "?"}
                            color={customer?.color}
                            size={24}
                          />
                          <span className="text-slate-600">
                            {customer?.name}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <MiniBar value={device.cpuUsage} label="CPU" />
                          <MiniBar value={device.ramUsage} label="RAM" />
                          <MiniBar value={device.diskUsage} label="Disk" />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {count > 0 ? (
                          <Badge className="bg-red-50 text-red-700 ring-red-600/20">
                            {count}
                          </Badge>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {timeAgo(device.lastSeen)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
