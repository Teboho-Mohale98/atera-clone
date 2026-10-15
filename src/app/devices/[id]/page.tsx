"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  History,
  KeyRound,
  MemoryStick,
  MonitorUp,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Tag,
  Wifi,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, ProgressBar } from "@/components/ui";
import {
  deviceStatusDot,
  deviceStatusStyle,
  patchSeverityStyle,
  patchStatusStyle,
  priorityStyle,
  severityStyle,
  ticketStatusLabel,
  ticketStatusStyle,
} from "@/lib/meta";
import { cn, formatDate, formatDateTime, osLabel, percent, timeAgo, usageTone } from "@/lib/utils";

type Tab = "alerts" | "patches" | "tickets";

export default function DeviceDetailPage() {
  const params = useParams<{ id: string }>();
  const { devices, customers, sites, alerts, tickets, patches, pushToast } =
    useApp();
  const [tab, setTab] = useState<Tab>("alerts");

  const device = devices.find((d) => d.id === params.id);
  if (!device) notFound();

  const customer = customers.find((c) => c.id === device.customerId);
  const site = sites.find((s) => s.id === device.siteId);
  const deviceAlerts = alerts
    .filter((a) => a.deviceId === device.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const devicePatches = patches.filter((p) => p.deviceId === device.id);
  const deviceTickets = tickets
    .filter((t) => t.deviceId === device.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const facts: Array<[string, string]> = [
    ["Hostname", device.hostname],
    ["Operating system", `${osLabel(device.os)} · ${device.osVersion}`],
    ["Manufacturer", device.manufacturer],
    ["Model", device.model],
    ["Serial number", device.serial],
    ["CPU", `${device.cpuModel} (${device.cpuCores} cores)`],
    ["IP address", device.ipAddress],
    ["MAC address", device.macAddress],
    ["Agent version", `v${device.agentVersion}`],
    ["Logged-in user", device.loggedInUser],
    ["Purchased", formatDate(device.purchasedAt)],
    ["Site", site?.name ?? "—"],
  ];

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "alerts", label: "Alerts", count: deviceAlerts.length },
    { id: "patches", label: "Patches", count: devicePatches.length },
    { id: "tickets", label: "Tickets", count: deviceTickets.length },
  ];

  return (
    <div className="animate-fade-in">
      <Link
        href="/devices"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Back to devices
      </Link>

      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          {device.type === "server" ? (
            <Server className="size-7" />
          ) : (
            <MonitorUp className="size-7" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {device.hostname}
            </h1>
            <Badge
              className={deviceStatusStyle[device.status]}
              dot={deviceStatusDot[device.status]}
            >
              {device.status}
            </Badge>
            <Badge className="bg-slate-100 text-slate-600 ring-slate-500/20 capitalize">
              {device.type}
            </Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <Link
              href={`/customers/${customer?.id}`}
              className="flex items-center gap-2 hover:text-brand-600"
            >
              <Avatar name={customer?.name ?? "?"} color={customer?.color} size={20} />
              {customer?.name}
            </Link>
            <span className="flex items-center gap-1.5">
              <Wifi className="size-3.5" /> {device.ipAddress}
            </span>
            <span className="flex items-center gap-1.5">
              <History className="size-3.5" /> {timeAgo(device.lastSeen)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => pushToast("Establishing secure remote session…", "info")}
          >
            <MonitorUp className="size-4" />
            Remote connect
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => pushToast("Script queued on agent", "info")}
          >
            <Play className="size-4" />
            Run script
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => pushToast("Agent restart command sent")}
          >
            <RefreshCw className="size-4" />
            Restart agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Resource utilization"
              subtitle="Live metrics reported by the agent"
            />
            <div className="grid gap-5 px-5 py-5 sm:grid-cols-3">
              {[
                {
                  icon: Cpu,
                  label: "CPU",
                  value: device.cpuUsage,
                  detail: `${device.cpuCores} cores · ${device.cpuModel}`,
                },
                {
                  icon: MemoryStick,
                  label: "Memory",
                  value: device.ramUsage,
                  detail: `${device.ramTotalGb} GB total`,
                },
                {
                  icon: HardDrive,
                  label: "Disk",
                  value: device.diskUsage,
                  detail: `${device.diskTotalGb} GB total`,
                },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <metric.icon className="size-4 text-slate-400" />
                      {metric.label}
                    </span>
                    <span className="text-lg font-bold tabular-nums text-slate-900">
                      {percent(metric.value)}
                    </span>
                  </div>
                  <ProgressBar value={metric.value} tone={usageTone(metric.value)} />
                  <p className="mt-2 truncate text-xs text-slate-400">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex gap-1 border-b border-slate-100 px-3 pt-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors",
                    tab === t.id
                      ? "border-b-2 border-brand-600 text-brand-700"
                      : "border-b-2 border-transparent text-slate-500 hover:text-slate-800",
                  )}
                >
                  {t.label}
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {tab === "alerts" ? (
              deviceAlerts.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck className="size-6" />}
                  title="No alerts for this device"
                  description="This endpoint is healthy. Alerts raised by the monitoring engine will appear here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {deviceAlerts.map((alert) => (
                    <li key={alert.id} className="flex items-start gap-3 px-5 py-3.5">
                      <Badge className={severityStyle[alert.severity]}>
                        {alert.severity}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {alert.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {alert.description}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {alert.category} · {formatDateTime(alert.createdAt)}
                        </p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-500 ring-slate-500/20">
                        {alert.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === "patches" ? (
              devicePatches.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck className="size-6" />}
                  title="No patches tracked"
                  description="Patch records appear for Windows endpoints managed by the agent."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {devicePatches.map((patch) => (
                    <li key={patch.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">
                            {patch.kb}
                          </span>
                          <Badge className={patchSeverityStyle[patch.severity]}>
                            {patch.severity}
                          </Badge>
                        </span>
                        <span className="mt-1 block text-sm text-slate-800">
                          {patch.title}
                        </span>
                      </span>
                      <Badge className={patchStatusStyle[patch.status]}>
                        {patch.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === "tickets" ? (
              deviceTickets.length === 0 ? (
                <EmptyState
                  icon={<KeyRound className="size-6" />}
                  title="No linked tickets"
                  description="Tickets associated with this device will be listed here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {deviceTickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-slate-800">
                            #{ticket.number} · {ticket.subject}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {ticket.category} · {timeAgo(ticket.createdAt)}
                          </span>
                        </span>
                        <Badge className={priorityStyle[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={ticketStatusStyle[ticket.status]}>
                          {ticketStatusLabel[ticket.status]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="System information" />
            <dl className="divide-y divide-slate-100">
              {facts.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 px-5 py-2.5"
                >
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-right text-xs font-medium text-slate-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Tags" subtitle="Applied asset labels" />
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {device.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-brand-50 capitalize text-brand-700 ring-brand-600/20"
                >
                  <Tag className="size-3" />
                  {tag.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
