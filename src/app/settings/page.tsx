"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Save, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, Badge, Button, Card, CardHeader, Field, fieldClassName } from "@/components/ui";
import { cn } from "@/lib/utils";

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-600" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { technicians, pushToast } = useApp();

  const [orgName, setOrgName] = useState("Atera Demo MSP");
  const [contact, setContact] = useState("Teboho Mohale");
  const [email, setEmail] = useState("ops@atera-demo.io");
  const [timezone, setTimezone] = useState("UTC+00:00 London");

  const [thresholds, setThresholds] = useState({ cpu: 90, ram: 85, disk: 90 });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    ticketAssigned: true,
    slaBreach: true,
    weeklyDigest: false,
    patchFailures: true,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Organisation, monitoring thresholds, notifications, and access."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Organization profile" subtitle="Displayed to customers and on reports" />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Organization name">
              <input
                className={fieldClassName}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </Field>
            <Field label="Primary contact">
              <input
                className={fieldClassName}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </Field>
            <Field label="Support email">
              <input
                className={fieldClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Time zone">
              <select
                className={fieldClassName}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option>UTC+00:00 London</option>
                <option>UTC+01:00 Amsterdam</option>
                <option>UTC+02:00 Cape Town</option>
                <option>UTC-05:00 New York</option>
                <option>UTC+04:00 Dubai</option>
                <option>UTC+10:00 Sydney</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end border-t border-slate-100 px-5 py-3.5">
            <Button variant="primary" size="md" onClick={() => pushToast("Settings saved")}>
              <Save className="size-4" />
              Save changes
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Alert thresholds"
            subtitle="Trigger monitoring alerts when usage exceeds these limits"
          />
          <div className="space-y-5 px-5 py-5">
            {(
              [
                ["cpu", "CPU utilization"],
                ["ram", "Memory utilization"],
                ["disk", "Disk utilization"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{label}</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {thresholds[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={99}
                  value={thresholds[key]}
                  onChange={(e) =>
                    setThresholds((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-slate-100 px-5 py-3.5">
            <Button variant="secondary" size="md" onClick={() => pushToast("Thresholds updated", "info")}>
              Update thresholds
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Notifications" subtitle="Control which events reach your inbox" />
          <ul className="divide-y divide-slate-100">
            {(
              [
                ["criticalAlerts", "Critical alerts", "Immediate email for critical severity"],
                ["ticketAssigned", "Ticket assigned", "When a ticket is assigned to you"],
                ["slaBreach", "SLA breach", "When an SLA target is missed"],
                ["patchFailures", "Patch failures", "When a patch deployment fails"],
                ["weeklyDigest", "Weekly digest", "Summary of activity every Monday"],
              ] as const
            ).map(([key, label, hint]) => (
              <li key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{hint}</p>
                </div>
                <Switch
                  checked={notifications[key]}
                  onChange={(v) =>
                    setNotifications((prev) => ({ ...prev, [key]: v }))
                  }
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Team members" subtitle={`${technicians.length} users`} />
          <ul className="divide-y divide-slate-100">
            {technicians.map((tech) => (
              <li key={tech.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={tech.name} color={tech.color} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {tech.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{tech.email}</p>
                </div>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      tech.status === "online"
                        ? "bg-emerald-500"
                        : tech.status === "away"
                          ? "bg-amber-500"
                          : "bg-slate-400",
                    )}
                  />
                  <Badge className="bg-slate-100 text-slate-600 ring-slate-500/20">
                    {tech.role}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="API keys" subtitle="Programmatic access to the demo API" />
          <div className="divide-y divide-slate-100">
            {[
              { name: "Production", key: "atr_live_51H8x…9f2c", created: "Jun 2026" },
              { name: "Staging", key: "atr_test_77Kd…1a4e", created: "Sep 2026" },
            ].map((k) => (
              <div key={k.name} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <KeyRound className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{k.name}</p>
                  <p className="font-mono text-xs text-slate-500">{k.key}</p>
                </div>
                <span className="hidden text-xs text-slate-400 sm:block">
                  Created {k.created}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Copy key"
                  onClick={() => pushToast("API key copied to clipboard", "info")}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Danger zone" />
          <div className="px-5 py-5">
            <p className="text-sm text-slate-600">
              Resetting the demo restores all devices, alerts, and tickets to their
              seeded state.
            </p>
            <Button
              variant="danger"
              size="md"
              className="mt-4"
              onClick={() => pushToast("Demo data reset to defaults", "warning")}
            >
              <Trash2 className="size-4" />
              Reset demo data
            </Button>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <Check className="size-3.5" />
              All systems operational
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
