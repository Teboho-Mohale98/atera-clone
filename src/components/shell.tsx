"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MonitorSmartphone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  BarChart3,
  X,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Button, Avatar } from "@/components/ui";
import { Toaster } from "@/components/Toaster";
import { TicketComposer } from "@/components/TicketComposer";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "alerts" | "tickets";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { href: "/devices", label: "Devices", icon: MonitorSmartphone },
      { href: "/alerts", label: "Alerts", icon: BellRing, badge: "alerts" },
      { href: "/tickets", label: "Tickets", icon: LifeBuoy, badge: "tickets" },
      { href: "/patches", label: "Patch Management", icon: ShieldCheck },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/customers", label: "Customers", icon: Building2 },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-1">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-black text-white shadow-lg shadow-brand-900/40">
        A
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-white">
          Atera
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-300">
          RMM + PSA
        </span>
      </span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { overview } = useApp();

  const badgeValue = (badge?: NavItem["badge"]) => {
    if (badge === "alerts") return overview.activeAlerts;
    if (badge === "tickets") return overview.openTickets;
    return 0;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/5 px-4">
        <Logo />
      </div>

      <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = badgeValue(item.badge);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-600/15 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-[18px] shrink-0",
                        active
                          ? "text-brand-300"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && count > 0 ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                          item.badge === "alerts"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-brand-500/20 text-brand-200",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="mb-3 rounded-lg bg-white/5 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Managed agents</span>
            <span className="tabular-nums text-slate-400">
              {overview.totalDevices}/100
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              style={{ width: `${Math.min(100, overview.totalDevices)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {overview.customers} customers · {Math.round(overview.avgDisk)}% avg
            disk
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <Avatar name="Teboho Mohale" color="#6366f1" size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              Teboho Mohale
            </p>
            <p className="truncate text-[10px] text-slate-500">
              Administrator
            </p>
          </div>
          <ChevronDown className="size-3.5 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

function Topbar({
  onOpenMenu,
  onNewTicket,
}: {
  onOpenMenu: () => void;
  onNewTicket: () => void;
}) {
  const { overview, alerts } = useApp();
  const criticalActive = alerts.filter(
    (a) => a.status === "active" && a.severity === "critical",
  ).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search devices, tickets, customers…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="primary" size="md" onClick={onNewTicket}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">New ticket</span>
        </Button>

        <Link
          href="/alerts"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="Alerts"
        >
          <Bell className="size-5" />
          {overview.activeAlerts > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {overview.activeAlerts}
            </span>
          ) : null}
        </Link>

        <div className="ml-1 flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-800">Teboho Mohale</p>
            <p className="text-[10px] text-slate-400">
              {criticalActive > 0
                ? `${criticalActive} critical open`
                : "All systems nominal"}
            </p>
          </div>
          <Avatar name="Teboho Mohale" color="#4f46e5" size={34} />
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="flex min-h-full">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-slate-950 lg:block">
        <SidebarContent />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="animate-slide-in-right absolute inset-y-0 left-0 w-64 bg-slate-950">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar
          onOpenMenu={() => setMenuOpen(true)}
          onNewTicket={() => setComposerOpen(true)}
        />
        <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
      </div>

      <TicketComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
      <Toaster />
    </div>
  );
}
