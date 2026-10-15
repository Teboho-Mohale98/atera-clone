"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, EmptyState, fieldClassName } from "@/components/ui";
import { Gauge } from "@/components/charts";
import { patchSeverityStyle, patchStatusStyle } from "@/lib/meta";
import { cn, formatDate } from "@/lib/utils";

export default function PatchesPage() {
  const { patches, devices, customers, pushToast } = useApp();
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [query, setQuery] = useState("");

  const device = useCallback(
    (id: string) => devices.find((d) => d.id === id),
    [devices],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patches
      .filter((p) => {
        if (status !== "all" && p.status !== status) return false;
        if (severity !== "all" && p.severity !== severity) return false;
        const dev = device(p.deviceId);
        if (customerId !== "all" && dev?.customerId !== customerId) return false;
        if (q && !`${p.kb} ${p.title} ${dev?.hostname ?? ""}`.toLowerCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) => {
        const rank = { failed: 0, pending: 1, installed: 2 } as const;
        if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
        return new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime();
      });
  }, [patches, status, severity, customerId, query, device]);

  const counts = useMemo(
    () => ({
      installed: patches.filter((p) => p.status === "installed").length,
      pending: patches.filter((p) => p.status === "pending").length,
      failed: patches.filter((p) => p.status === "failed").length,
    }),
    [patches],
  );
  const compliance = patches.length
    ? (counts.installed / patches.length) * 100
    : 100;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Patch Management"
        description="Deployment status of OS and application updates across Windows endpoints."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => pushToast("Patch scan queued for all agents", "info")}
            >
              <RefreshCw className="size-4" />
              Scan now
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => pushToast("Approved patches deploying…")}
            >
              <ShieldCheck className="size-4" />
              Deploy approved
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="flex items-center justify-center p-5">
          <Gauge value={compliance} label="Compliance" color="#10b981" />
        </Card>
        {[
          { label: "Installed", value: counts.installed, tone: "text-emerald-600" },
          { label: "Pending", value: counts.pending, tone: "text-amber-600" },
          { label: "Failed", value: counts.failed, tone: "text-red-600" },
        ].map((s) => (
          <Card key={s.label} className="flex flex-col justify-center p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {s.label}
            </p>
            <p className={cn("mt-1 text-3xl font-bold tabular-nums", s.tone)}>
              {s.value}
            </p>
            <p className="text-xs text-slate-400">of {patches.length} patches</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by KB, title, or device"
              className={cn(fieldClassName, "pl-9")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={cn(fieldClassName, "w-auto")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Any status</option>
              <option value="installed">Installed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              className={cn(fieldClassName, "w-auto")}
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="all">Any severity</option>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
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
            <Button variant="secondary" size="md">
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="No patches match"
            description="Adjust the filters to see patch records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Update</th>
                  <th className="px-3 py-3 font-medium">Device</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Severity</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Released</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 60).map((patch) => {
                  const dev = device(patch.deviceId);
                  const customer = customers.find((c) => c.id === dev?.customerId);
                  return (
                    <tr key={patch.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-500">
                          {patch.kb}
                        </span>
                        <span className="mt-0.5 block text-slate-800">
                          {patch.title}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {dev ? (
                          <Link
                            href={`/devices/${dev.id}`}
                            className="text-slate-600 hover:text-brand-600"
                          >
                            {dev.hostname}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {customer?.name ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={patchSeverityStyle[patch.severity]}>
                          {patch.severity}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={patchStatusStyle[patch.status]}>
                          {patch.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDate(patch.releasedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 60 ? (
              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
                Showing 60 of {filtered.length} records
              </p>
            ) : null}
          </div>
        )}
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        Patch data is simulated for demonstration purposes.
      </p>
    </div>
  );
}
