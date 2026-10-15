"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Columns3,
  List,
  Plus,
  Search,
  LifeBuoy,
  Clock,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { TicketComposer } from "@/components/TicketComposer";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  fieldClassName,
} from "@/components/ui";
import {
  priorityRank,
  priorityStyle,
  ticketStatusLabel,
  ticketStatusStyle,
} from "@/lib/meta";
import { cn, dueLabel, timeAgo } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/lib/types";

const STATUSES: TicketStatus[] = ["open", "in_progress", "pending", "resolved"];

export default function TicketsPage() {
  const { tickets, customers, technicians, setTicketStatus } = useApp();
  const [composerOpen, setComposerOpen] = useState(false);
  const [view, setView] = useState<"table" | "board">("table");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [query, setQuery] = useState("");

  const customerName = useCallback(
    (id: string) => customers.find((c) => c.id === id)?.name ?? "—",
    [customers],
  );
  const techName = (id: string) =>
    technicians.find((t) => t.id === id)?.name ?? "Unassigned";
  const techColor = (id: string) =>
    technicians.find((t) => t.id === id)?.color ?? "#94a3b8";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets
      .filter((t) => {
        if (status !== "all" && t.status !== status) return false;
        if (priority !== "all" && t.priority !== priority) return false;
        if (customerId !== "all" && t.customerId !== customerId) return false;
        if (assigneeId !== "all" && t.assigneeId !== assigneeId) return false;
        if (q) {
          const haystack = `#${t.number} ${t.subject} ${t.category} ${customerName(t.customerId)}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.status === "resolved" && b.status !== "resolved") return 1;
        if (b.status === "resolved" && a.status !== "resolved") return -1;
        const pr = priorityRank[a.priority] - priorityRank[b.priority];
        if (pr !== 0) return pr;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [tickets, query, status, priority, customerId, assigneeId, customerName]);

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      pending: tickets.filter((t) => t.status === "pending").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    }),
    [tickets],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tickets"
        description="Service desk queue across every customer and technician."
        actions={
          <>
            <Button
              variant={view === "table" ? "subtle" : "secondary"}
              size="sm"
              onClick={() => setView("table")}
            >
              <List className="size-4" />
              Table
            </Button>
            <Button
              variant={view === "board" ? "subtle" : "secondary"}
              size="sm"
              onClick={() => setView("board")}
            >
              <Columns3 className="size-4" />
              Board
            </Button>
            <Button variant="primary" size="md" onClick={() => setComposerOpen(true)}>
              <Plus className="size-4" />
              New ticket
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? "all" : s)}
            className={cn(
              "rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-colors",
              status === s
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <p className="text-xl font-bold tabular-nums text-slate-900">
              {counts[s]}
            </p>
            <p className="text-xs text-slate-500">{ticketStatusLabel[s]}</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets by number, subject, or customer"
              className={cn(fieldClassName, "pl-9")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={cn(fieldClassName, "w-auto")}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">Any priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
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
            <select
              className={cn(fieldClassName, "w-auto")}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="all">Any assignee</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<LifeBuoy className="size-6" />}
            title="No tickets match"
            description="Adjust the filters or create a new ticket."
          />
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Ticket</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Priority</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Assignee</th>
                  <th className="px-5 py-3 font-medium">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ticket) => {
                  const customer = customers.find((c) => c.id === ticket.customerId);
                  const sla = dueLabel(ticket.dueAt);
                  return (
                    <tr key={ticket.id} className="group hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link href={`/tickets/${ticket.id}`} className="block">
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">
                              #{ticket.number}
                            </span>
                            <span className="font-medium text-slate-800 group-hover:text-brand-600">
                              {ticket.subject}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {ticket.category} · {timeAgo(ticket.createdAt)} ·{" "}
                            {ticket.channel}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Avatar
                            name={customer?.name ?? "?"}
                            color={customer?.color}
                            size={22}
                          />
                          <span className="truncate">{customer?.name}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={priorityStyle[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={ticketStatusStyle[ticket.status]}>
                          {ticketStatusLabel[ticket.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Avatar
                            name={techName(ticket.assigneeId)}
                            color={techColor(ticket.assigneeId)}
                            size={22}
                          />
                          <span className="truncate">{techName(ticket.assigneeId)}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {ticket.status === "resolved" ? (
                          <span className="text-xs text-slate-400">Closed</span>
                        ) : (
                          <Badge
                            className={cn(
                              "flex w-fit items-center gap-1",
                              sla.overdue
                                ? "bg-red-50 text-red-700 ring-red-600/20"
                                : "bg-slate-100 text-slate-600 ring-slate-500/20",
                            )}
                          >
                            <Clock className="size-3" />
                            {sla.label}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 overflow-x-auto p-4 lg:grid-cols-4">
            {STATUSES.map((column) => {
              const columnTickets = filtered.filter((t) => t.status === column);
              return (
                <div key={column} className="min-w-[240px]">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          column === "open"
                            ? "bg-sky-500"
                            : column === "in_progress"
                              ? "bg-brand-500"
                              : column === "pending"
                                ? "bg-amber-500"
                                : "bg-emerald-500",
                        )}
                      />
                      {ticketStatusLabel[column]}
                    </span>
                    <span className="text-xs text-slate-400">
                      {columnTickets.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {columnTickets.map((ticket) => (
                      <BoardCard
                        key={ticket.id}
                        ticket={ticket}
                        customerName={customerName(ticket.customerId)}
                        customerColor={
                          customers.find((c) => c.id === ticket.customerId)?.color ??
                          "#94a3b8"
                        }
                        techName={techName(ticket.assigneeId)}
                        techColor={techColor(ticket.assigneeId)}
                        onMove={(s) => setTicketStatus(ticket.id, s)}
                      />
                    ))}
                    {columnTickets.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                        Empty
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <TicketComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}

function BoardCard({
  ticket,
  customerName,
  customerColor,
  techName,
  techColor,
  onMove,
}: {
  ticket: Ticket;
  customerName: string;
  customerColor: string;
  techName: string;
  techColor: string;
  onMove: (status: TicketStatus) => void;
}) {
  const sla = dueLabel(ticket.dueAt);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/tickets/${ticket.id}`} className="block">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-slate-400">
            #{ticket.number}
          </span>
          <Badge className={priorityStyle[ticket.priority]}>
            {ticket.priority}
          </Badge>
        </div>
        <p className="text-sm font-medium leading-snug text-slate-800">
          {ticket.subject}
        </p>
      </Link>
      <div className="mt-2.5 flex items-center gap-2">
        <Avatar name={customerName} color={customerColor} size={20} />
        <span className="truncate text-xs text-slate-500">{customerName}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Avatar name={techName} color={techColor} size={20} />
          <span className="text-[11px] text-slate-500">{techName.split(" ")[0]}</span>
        </div>
        {ticket.status !== "resolved" ? (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px]",
              sla.overdue ? "font-medium text-red-600" : "text-slate-400",
            )}
          >
            <Clock className="size-3" />
            {sla.label}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex gap-1">
        {STATUSES.filter((s) => s !== ticket.status).map((s) => (
          <button
            key={s}
            onClick={() => onMove(s)}
            title={`Move to ${ticketStatusLabel[s]}`}
            className="flex-1 rounded-md bg-slate-100 px-1 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            {ticketStatusLabel[s].split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
