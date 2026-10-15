"use client";

import { Download, FileText, TrendingUp } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Avatar, Badge, Button, Card, CardHeader, ProgressBar } from "@/components/ui";
import { BarChart, DonutChart, Gauge, TrendChart } from "@/components/charts";
import { planStyle, priorityStyle, ticketStatusLabel } from "@/lib/meta";
import { formatCurrency, percent, usageTone } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/lib/types";

export default function ReportsPage() {
  const { overview, timeseries, tickets, devices, customers, technicians, alerts, pushToast } =
    useApp();

  const osData = [
    { label: "Windows", value: devices.filter((d) => d.os === "windows").length, color: "#0ea5e9" },
    { label: "macOS", value: devices.filter((d) => d.os === "macos").length, color: "#8b5cf6" },
    { label: "Linux", value: devices.filter((d) => d.os === "linux").length, color: "#10b981" },
  ];

  const priorities: TicketPriority[] = ["urgent", "high", "medium", "low"];
  const priorityData = priorities.map((p) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    value: tickets.filter((t) => t.priority === p).length,
    color:
      p === "urgent"
        ? "#ef4444"
        : p === "high"
          ? "#f97316"
          : p === "medium"
            ? "#f59e0b"
            : "#94a3b8",
  }));

  const categoryCounts = Object.entries(
    alerts.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topCustomers = [...customers]
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 6);

  const technicianLoad = technicians
    .filter((t) => t.role === "Technician" || t.role === "Admin")
    .map((tech) => {
      const assigned = tickets.filter(
        (t) => t.assigneeId === tech.id && t.status !== "resolved",
      );
      const resolved = tickets.filter(
        (t) => t.assigneeId === tech.id && t.status === "resolved",
      ).length;
      return { tech, assigned: assigned.length, resolved };
    })
    .sort((a, b) => b.assigned - a.assigned);

  const statusBreakdown = (
    ["open", "in_progress", "pending", "resolved"] as TicketStatus[]
  ).map((s) => ({
    status: s,
    count: tickets.filter((t) => t.status === s).length,
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Operational and business analytics across the managed estate."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => pushToast("Scheduled monthly report", "info")}
            >
              <FileText className="size-4" />
              Schedule
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => pushToast("Exporting report bundle…")}
            >
              <Download className="size-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avg. resolution health"
          value={percent(overview.slaCompliance)}
          icon={<TrendingUp className="size-5" />}
          delta="SLA compliance"
          deltaTone="up"
        />
        <StatCard
          label="Devices online"
          value={`${overview.online}/${overview.totalDevices}`}
          delta={`${percent((overview.online / overview.totalDevices) * 100)} availability`}
          deltaTone="neutral"
        />
        <StatCard
          label="Patch compliance"
          value={percent(overview.patchCompliance)}
          delta="Across Windows fleet"
          deltaTone="up"
        />
        <StatCard
          label="MRR"
          value={formatCurrency(overview.mrr)}
          delta={`${overview.customers} customers`}
          deltaTone="up"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Service desk volume"
            subtitle="Alerts and tickets over 14 days"
          />
          <div className="px-5 pb-8 pt-5">
            <TrendChart
              data={timeseries}
              series={[
                { key: "tickets", label: "Tickets opened", color: "#4f46e5" },
                { key: "closed", label: "Tickets closed", color: "#10b981" },
                { key: "alerts", label: "Alerts raised", color: "#ef4444" },
              ]}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Endpoint OS mix" />
          <div className="px-5 py-6">
            <DonutChart data={osData} centerValue={String(devices.length)} centerLabel="Devices" />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Tickets by priority" />
          <div className="px-5 py-6">
            <BarChart data={priorityData} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Top alert categories" />
          <div className="space-y-3 px-5 py-5">
            {categoryCounts.map(([category, count]) => {
              const max = categoryCounts[0][1];
              return (
                <div key={category}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{category}</span>
                    <span className="tabular-nums text-slate-500">{count}</span>
                  </div>
                  <ProgressBar
                    value={(count / max) * 100}
                    tone="brand"
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Fleet health" subtitle="Key compliance indicators" />
          <div className="grid grid-cols-2 gap-3 px-5 py-6">
            <Gauge value={overview.patchCompliance} label="Patches" color="#10b981" />
            <Gauge value={overview.slaCompliance} label="SLA" color="#4f46e5" />
            <Gauge value={100 - overview.avgDisk} label="Disk free" color="#0ea5e9" />
            <Gauge value={100 - overview.avgRam} label="Mem free" color="#f59e0b" />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Top customers by MRR"
            subtitle="Recurring revenue contribution"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 text-right font-medium">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={c.name} color={c.color} size={26} />
                        <span className="font-medium text-slate-800">{c.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={planStyle[c.plan]}>{c.plan}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-800">
                      {formatCurrency(c.mrr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Technician workload"
            subtitle="Open assignments and resolved volume"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Technician</th>
                  <th className="px-3 py-3 font-medium">Open</th>
                  <th className="px-5 py-3 font-medium">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {technicianLoad.map(({ tech, assigned, resolved }) => (
                  <tr key={tech.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={tech.name} color={tech.color} size={26} />
                        <span className="font-medium text-slate-800">{tech.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={assigned > 6 ? "bg-red-50 text-red-700 ring-red-600/20" : "bg-slate-100 text-slate-600 ring-slate-500/20"}>
                        {assigned}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Ticket status distribution" />
          <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-4">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="rounded-lg border border-slate-200 p-4">
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {s.count}
                </p>
                <p className="text-xs text-slate-500">
                  {ticketStatusLabel[s.status]}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Average metrics" />
          <div className="space-y-3 px-5 py-5">
            {[
              { label: "Avg. CPU", value: overview.avgCpu },
              { label: "Avg. memory", value: overview.avgRam },
              { label: "Avg. disk", value: overview.avgDisk },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="tabular-nums text-slate-500">
                    {percent(m.value)}
                  </span>
                </div>
                <ProgressBar value={m.value} tone={usageTone(m.value)} />
              </div>
            ))}
            <p className="pt-2 text-xs text-slate-400">
              Snapshot generated moments ago
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {priorities.map((p) => (
          <Badge key={p} className={priorityStyle[p]}>
            {tickets.filter((t) => t.priority === p).length} {p}
          </Badge>
        ))}
      </div>
    </div>
  );
}
