"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  Cpu,
  HardDrive,
  LifeBuoy,
  MonitorSmartphone,
  Server,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  ProgressBar,
} from "@/components/ui";
import { DonutChart, Gauge, TrendChart } from "@/components/charts";
import { severityStyle, severityBar } from "@/lib/meta";
import {
  formatCurrency,
  percent,
  timeAgo,
  usageTone,
} from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, typeof BellRing> = {
  alert: BellRing,
  ticket: Ticket,
  device: MonitorSmartphone,
  patch: ShieldCheck,
  billing: TrendingUp,
  security: ShieldAlert,
  customer: Users,
};

export default function DashboardPage() {
  const { overview, alerts, tickets, devices, customers, activity, timeseries } =
    useApp();

  const activeAlerts = alerts
    .filter((a) => a.status !== "resolved")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const severityData = [
    {
      label: "Critical",
      value: alerts.filter(
        (a) => a.status !== "resolved" && a.severity === "critical",
      ).length,
      color: "#ef4444",
    },
    {
      label: "High",
      value: alerts.filter(
        (a) => a.status !== "resolved" && a.severity === "high",
      ).length,
      color: "#f97316",
    },
    {
      label: "Medium",
      value: alerts.filter(
        (a) => a.status !== "resolved" && a.severity === "medium",
      ).length,
      color: "#f59e0b",
    },
    {
      label: "Low",
      value: alerts.filter(
        (a) => a.status !== "resolved" && a.severity === "low",
      ).length,
      color: "#0ea5e9",
    },
  ];

  const customerHealth = customers
    .map((c) => {
      const cDevices = devices.filter((d) => d.customerId === c.id);
      const offline = cDevices.filter((d) => d.status === "offline").length;
      const active = alerts.filter(
        (a) => a.customerId === c.id && a.status === "active",
      ).length;
      const open = tickets.filter(
        (t) => t.customerId === c.id && t.status !== "resolved",
      ).length;
      const score = Math.max(
        12,
        Math.min(100, 100 - active * 3.5 - open * 4 - offline * 6),
      );
      return { customer: c, deviceCount: cDevices.length, active, open, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 6);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Live operational health across every managed customer."
        actions={
          <>
            <Button variant="secondary" size="md">
              <Wrench className="size-4" />
              Run maintenance
            </Button>
            <Button variant="primary" size="md">
              <TrendingUp className="size-4" />
              Executive report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Managed devices"
          value={overview.totalDevices}
          icon={<MonitorSmartphone className="size-5" />}
          delta={`${overview.online} online · ${overview.offline} offline`}
          deltaTone="neutral"
          spark={timeseries.map((t) => t.tickets + t.alerts).slice(-10)}
          sparkColor="#4f46e5"
        />
        <StatCard
          label="Active alerts"
          value={overview.activeAlerts}
          icon={<BellRing className="size-5" />}
          delta={`${overview.criticalAlerts} critical`}
          deltaTone={overview.criticalAlerts > 0 ? "down" : "up"}
          spark={timeseries.map((t) => t.alerts).slice(-10)}
          sparkColor="#ef4444"
        />
        <StatCard
          label="Open tickets"
          value={overview.openTickets}
          icon={<LifeBuoy className="size-5" />}
          delta={`${overview.urgentTickets} urgent · SLA ${percent(overview.slaCompliance)}`}
          deltaTone="neutral"
          spark={timeseries.map((t) => t.tickets).slice(-10)}
          sparkColor="#0ea5e9"
        />
        <StatCard
          label="Monthly recurring"
          value={formatCurrency(overview.mrr)}
          icon={<TrendingUp className="size-5" />}
          delta={`${overview.customers} active customers`}
          deltaTone="up"
          spark={timeseries.map((t) => t.closed + t.resolved).slice(-10)}
          sparkColor="#10b981"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Alert & ticket throughput"
            subtitle="Tickets raised vs. resolved over the last 14 days"
            action={
              <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                14-day window
              </Badge>
            }
          />
          <div className="px-5 pb-8 pt-5">
            <TrendChart
              data={timeseries}
              series={[
                { key: "alerts", label: "Alerts raised", color: "#ef4444" },
                { key: "resolved", label: "Alerts resolved", color: "#10b981" },
                { key: "tickets", label: "Tickets opened", color: "#4f46e5" },
                { key: "closed", label: "Tickets closed", color: "#f59e0b" },
              ]}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Alerts by severity"
            subtitle="Currently unresolved"
          />
          <div className="px-5 py-6">
            <DonutChart
              data={severityData}
              centerValue={String(overview.activeAlerts)}
              centerLabel="Active"
            />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent alerts"
            subtitle="Highest signal from the last 72 hours"
            action={
              <Link
                href="/alerts"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            }
          />
          <ul className="divide-y divide-slate-100">
            {activeAlerts.map((alert) => {
              const device = devices.find((d) => d.id === alert.deviceId);
              const customer = customers.find(
                (c) => c.id === alert.customerId,
              );
              return (
                <li
                  key={alert.id}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={`h-9 w-1.5 shrink-0 rounded-full ${severityBar[alert.severity]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {alert.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {device?.hostname} · {customer?.name}
                    </p>
                  </div>
                  <Badge className={severityStyle[alert.severity]}>
                    {alert.severity}
                  </Badge>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                    {timeAgo(alert.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Activity stream" subtitle="Latest events" />
          <ul className="space-y-4 px-5 py-4">
            {activity.slice(0, 6).map((event) => {
              const Icon = ACTIVITY_ICONS[event.kind] ?? BellRing;
              return (
                <li key={event.id} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs leading-relaxed text-slate-700">
                      {event.message}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {event.actor} · {timeAgo(event.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Customer health"
            subtitle="Composite score: alerts, tickets, and device availability"
            action={
              <Link
                href="/customers"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                All customers
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-3 py-2.5 font-medium">Devices</th>
                  <th className="px-3 py-2.5 font-medium">Alerts</th>
                  <th className="px-3 py-2.5 font-medium">Tickets</th>
                  <th className="px-5 py-2.5 font-medium">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerHealth.map((row) => (
                  <tr key={row.customer.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/customers/${row.customer.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <Avatar
                          name={row.customer.name}
                          color={row.customer.color}
                          size={28}
                        />
                        <span className="font-medium text-slate-800">
                          {row.customer.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">
                      {row.deviceCount}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">
                      {row.active}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">
                      {row.open}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={row.score}
                          tone={
                            row.score >= 80
                              ? "emerald"
                              : row.score >= 55
                                ? "amber"
                                : "red"
                          }
                          className="w-24"
                        />
                        <span className="tabular-nums text-xs font-medium text-slate-600">
                          {Math.round(row.score)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Fleet performance"
            subtitle="Averages across online endpoints"
          />
          <div className="grid grid-cols-2 gap-4 px-5 py-6">
            <Gauge value={overview.patchCompliance} label="Patch compliance" color="#10b981" />
            <Gauge value={overview.slaCompliance} label="SLA compliance" color="#4f46e5" />
          </div>
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            {[
              { icon: Cpu, label: "Avg. CPU", value: overview.avgCpu },
              { icon: Server, label: "Avg. memory", value: overview.avgRam },
              { icon: HardDrive, label: "Avg. disk", value: overview.avgDisk },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <metric.icon className="size-3.5 text-slate-400" />
                    {metric.label}
                  </span>
                  <span className="tabular-nums font-medium text-slate-700">
                    {percent(metric.value)}
                  </span>
                </div>
                <ProgressBar value={metric.value} tone={usageTone(metric.value)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <AlertTriangle className="size-3.5" />
        Demo environment with simulated data — no live endpoints are connected.
      </p>
    </div>
  );
}
