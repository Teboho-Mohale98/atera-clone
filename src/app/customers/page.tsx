"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Download, Plus, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, Badge, Button, Card, EmptyState, ProgressBar, fieldClassName } from "@/components/ui";
import { planStyle } from "@/lib/meta";
import { cn, formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const { customers, devices, tickets, alerts } = useApp();
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (plan !== "all" && c.plan !== plan) return false;
        if (q && !`${c.name} ${c.industry} ${c.city}`.toLowerCase().includes(q))
          return false;
        return true;
      })
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
          10,
          Math.min(100, 100 - active * 3.5 - open * 4 - offline * 6),
        );
        return { customer: c, deviceCount: cDevices.length, active, open, offline, score };
      });
  }, [customers, devices, tickets, alerts, query, plan]);

  const totalMrr = customers.reduce((s, c) => s + c.mrr, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description={`${customers.length} organisations · ${formatCurrency(totalMrr)} MRR`}
        actions={
          <>
            <Button variant="secondary" size="md">
              <Download className="size-4" />
              Export
            </Button>
            <Button variant="primary" size="md">
              <Plus className="size-4" />
              Add customer
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers or industries"
            className={cn(fieldClassName, "pl-9")}
          />
        </div>
        <select
          className={cn(fieldClassName, "sm:w-48")}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="all">All plans</option>
          <option value="Essential">Essential</option>
          <option value="Professional">Professional</option>
          <option value="Growth">Growth</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="No customers found"
            description="Try a different search term or plan filter."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ customer, deviceCount, active, open, score }) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Avatar name={customer.name} color={customer.color} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {customer.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {customer.industry}
                    </p>
                  </div>
                  <Badge className={planStyle[customer.plan]}>
                    {customer.plan}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      {deviceCount}
                    </p>
                    <p className="text-[11px] text-slate-500">Devices</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        active > 0 ? "text-red-600" : "text-slate-900",
                      )}
                    >
                      {active}
                    </p>
                    <p className="text-[11px] text-slate-500">Alerts</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      {open}
                    </p>
                    <p className="text-[11px] text-slate-500">Tickets</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Health score</span>
                    <span className="font-medium text-slate-700">
                      {Math.round(score)}/100
                    </span>
                  </div>
                  <ProgressBar
                    value={score}
                    tone={score >= 80 ? "emerald" : score >= 55 ? "amber" : "red"}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500">
                    {customer.city}, {customer.country}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(customer.mrr)}/mo
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
