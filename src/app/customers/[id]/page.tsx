"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Plus,
  RefreshCw,
  Server,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { TicketComposer } from "@/components/TicketComposer";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, ProgressBar } from "@/components/ui";
import {
  deviceStatusDot,
  deviceStatusStyle,
  planStyle,
  priorityStyle,
  severityStyle,
  ticketStatusLabel,
  ticketStatusStyle,
} from "@/lib/meta";
import { cn, formatCurrency, osLabel, percent, timeAgo, usageTone } from "@/lib/utils";

type Tab = "devices" | "tickets" | "alerts" | "sites";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { customers, devices, tickets, alerts, sites, patches } = useApp();
  const [tab, setTab] = useState<Tab>("devices");
  const [composerOpen, setComposerOpen] = useState(false);

  const customer = customers.find((c) => c.id === params.id);
  if (!customer) notFound();

  const cDevices = devices.filter((d) => d.customerId === customer.id);
  const cTickets = tickets
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const cAlerts = alerts
    .filter((a) => a.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const cSites = sites.filter((s) => s.customerId === customer.id);

  const online = cDevices.filter((d) => d.status === "online").length;
  const offline = cDevices.filter((d) => d.status === "offline").length;
  const activeAlerts = cAlerts.filter((a) => a.status === "active").length;
  const openTickets = cTickets.filter((t) => t.status !== "resolved").length;
  const cPatches = patches.filter((p) =>
    cDevices.some((d) => d.id === p.deviceId),
  );
  const patchCompliance = cPatches.length
    ? (cPatches.filter((p) => p.status === "installed").length / cPatches.length) * 100
    : 100;
  const health = Math.max(
    10,
    Math.min(100, 100 - activeAlerts * 3.5 - openTickets * 4 - offline * 6),
  );
  const avg = (fn: (v: number) => number) =>
    cDevices.length ? fn(cDevices.reduce((s, d) => s + d.diskUsage, 0) / cDevices.length) : 0;

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "devices", label: "Devices", count: cDevices.length },
    { id: "tickets", label: "Tickets", count: cTickets.length },
    { id: "alerts", label: "Alerts", count: cAlerts.length },
    { id: "sites", label: "Sites", count: cSites.length },
  ];

  return (
    <div className="animate-fade-in">
      <Link
        href="/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>

      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={customer.name} color={customer.color} size={56} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <Badge className={planStyle[customer.plan]}>{customer.plan}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{customer.industry}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> {customer.contactEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" /> {customer.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {customer.city}, {customer.country}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="md">
            <RefreshCw className="size-4" />
            Sync
          </Button>
          <Button variant="primary" size="md" onClick={() => setComposerOpen(true)}>
            <Plus className="size-4" />
            New ticket
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Devices", value: `${online}/${cDevices.length}`, hint: "online" },
          { label: "Active alerts", value: String(activeAlerts), hint: "unresolved" },
          { label: "Open tickets", value: String(openTickets), hint: "in queue" },
          { label: "MRR", value: formatCurrency(customer.mrr), hint: "recurring" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <p className="text-xs text-slate-400">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Account health" subtitle="Composite operational score" />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-3">
            {[
              { label: "Health score", value: health, tone: health >= 80 ? "emerald" : health >= 55 ? "amber" : "red" as const },
              { label: "Patch compliance", value: patchCompliance, tone: patchCompliance >= 80 ? "emerald" : "amber" as const },
              { label: "Avg. disk usage", value: avg((v) => v), tone: usageTone(avg((v) => v)) as "emerald" | "amber" | "red" },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600">{m.label}</span>
                  <span className="text-lg font-bold tabular-nums text-slate-900">
                    {percent(m.value)}
                  </span>
                </div>
                <ProgressBar
                  value={m.value}
                  tone={m.tone as "emerald" | "amber" | "red"}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Primary contact" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={customer.contactName} color={customer.color} size={40} />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {customer.contactName}
                </p>
                <p className="text-xs text-slate-500">
                  Customer since {new Date(customer.createdAt).getUTCFullYear()}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-700">{customer.contactEmail}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-700">{customer.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Sites</dt>
                <dd className="font-medium text-slate-700">{cSites.length}</dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>

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

        {tab === "devices" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">OS</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/devices/${device.id}`}
                        className="flex items-center gap-2 font-medium text-slate-800 hover:text-brand-600"
                      >
                        {device.type === "server" ? (
                          <Server className="size-4 text-slate-400" />
                        ) : (
                          <Monitor className="size-4 text-slate-400" />
                        )}
                        {device.hostname}
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
                    <td className="px-3 py-3 text-slate-500">
                      {osLabel(device.os)}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {timeAgo(device.lastSeen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "tickets" ? (
          cTickets.length === 0 ? (
            <EmptyState title="No tickets" description="This customer has no tickets yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {cTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50"
                  >
                    <span className="font-mono text-xs text-slate-400">
                      #{ticket.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                      {ticket.subject}
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

        {tab === "alerts" ? (
          cAlerts.length === 0 ? (
            <EmptyState title="No alerts" description="No monitoring alerts for this customer." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {cAlerts.slice(0, 20).map((alert) => (
                <li key={alert.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Badge className={severityStyle[alert.severity]}>
                    {alert.severity}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-400">{alert.category}</p>
                  </div>
                  <Badge className="bg-slate-100 capitalize text-slate-500 ring-slate-500/20">
                    {alert.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "sites" ? (
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {cSites.map((site) => (
              <div
                key={site.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <MapPin className="size-4 text-slate-400" />
                  {site.name}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">{site.address}</p>
                <p className="text-xs text-slate-500">
                  {site.city}, {site.country}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {cDevices.filter((d) => d.siteId === site.id).length} devices
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <TicketComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        defaultCustomerId={customer.id}
      />
    </div>
  );
}
