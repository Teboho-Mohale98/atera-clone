"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Lock,
  Monitor,
  Paperclip,
  Send,
  User,
} from "lucide-react";
import { useApp } from "@/lib/store";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  fieldClassName,
} from "@/components/ui";
import {
  priorityStyle,
  ticketStatusLabel,
  ticketStatusStyle,
} from "@/lib/meta";
import { cn, dueLabel, formatDateTime, timeAgo } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/lib/types";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    tickets,
    customers,
    devices,
    technicians,
    setTicketStatus,
    setTicketPriority,
    assignTicket,
    addTicketComment,
  } = useApp();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);

  const ticket = tickets.find((t) => t.id === params.id);
  if (!ticket) notFound();

  const customer = customers.find((c) => c.id === ticket.customerId);
  const device = devices.find((d) => d.id === ticket.deviceId);
  const assignee = technicians.find((t) => t.id === ticket.assigneeId);
  const sla = dueLabel(ticket.dueAt);

  const sortedComments = [...ticket.comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  function submitReply() {
    if (!reply.trim()) return;
    addTicketComment(ticket!.id, reply.trim(), "Teboho Mohale", "Administrator");
    setReply("");
    setInternal(false);
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/tickets"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Back to tickets
      </Link>

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-slate-400">
              #{ticket.number}
            </span>
            <Badge className={priorityStyle[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <Badge className={ticketStatusStyle[ticket.status]}>
              {ticketStatusLabel[ticket.status]}
            </Badge>
            {ticket.status !== "resolved" ? (
              <Badge
                className={cn(
                  "flex items-center gap-1",
                  sla.overdue
                    ? "bg-red-50 text-red-700 ring-red-600/20"
                    : "bg-slate-100 text-slate-600 ring-slate-500/20",
                )}
              >
                <Clock className="size-3" />
                SLA {sla.label}
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {ticket.subject}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Opened by {ticket.requester} · {ticket.category} · via{" "}
            {ticket.channel} · {timeAgo(ticket.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {ticket.status !== "resolved" ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setTicketStatus(ticket.id, "resolved")}
            >
              Resolve ticket
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setTicketStatus(ticket.id, "open")}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <p className="px-5 py-4 text-sm leading-relaxed text-slate-700">
              {ticket.description}
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Conversation"
              subtitle={`${sortedComments.length} message${sortedComments.length === 1 ? "" : "s"}`}
            />
            <div className="space-y-4 px-5 py-5">
              {sortedComments.length === 0 ? (
                <p className="text-sm text-slate-400">No replies yet.</p>
              ) : (
                sortedComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar name={comment.author} color="#64748b" size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {comment.author}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {comment.role}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          · {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write a reply…"
                className={fieldClassName}
              />
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={internal}
                    onChange={(e) => setInternal(e.target.checked)}
                    className="size-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <Lock className="size-3" />
                  Internal note
                </label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="md">
                    <Paperclip className="size-4" />
                    Attach
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={submitReply}
                    disabled={!reply.trim()}
                  >
                    <Send className="size-4" />
                    Send reply
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Properties" />
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Status
                </label>
                <select
                  className={fieldClassName}
                  value={ticket.status}
                  onChange={(e) =>
                    setTicketStatus(ticket.id, e.target.value as TicketStatus)
                  }
                >
                  {(Object.keys(ticketStatusLabel) as TicketStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {ticketStatusLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Priority
                </label>
                <select
                  className={fieldClassName}
                  value={ticket.priority}
                  onChange={(e) =>
                    setTicketPriority(ticket.id, e.target.value as TicketPriority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Assignee
                </label>
                <select
                  className={fieldClassName}
                  value={ticket.assigneeId}
                  onChange={(e) => assignTicket(ticket.id, e.target.value)}
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <dl className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="font-medium text-slate-700">
                    {formatDateTime(ticket.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Last update</dt>
                  <dd className="font-medium text-slate-700">
                    {timeAgo(ticket.updatedAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">SLA due</dt>
                  <dd
                    className={cn(
                      "font-medium",
                      sla.overdue ? "text-red-600" : "text-slate-700",
                    )}
                  >
                    {formatDateTime(ticket.dueAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          <Card>
            <CardHeader title="Related" />
            <div className="space-y-3 px-5 py-4">
              {customer ? (
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-brand-300 hover:bg-slate-50"
                >
                  <Avatar name={customer.name} color={customer.color} size={34} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {customer.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {customer.industry}
                    </p>
                  </div>
                </Link>
              ) : null}
              {device ? (
                <Link
                  href={`/devices/${device.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-brand-300 hover:bg-slate-50"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Monitor className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {device.hostname}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {device.osVersion}
                    </p>
                  </div>
                </Link>
              ) : null}
              {assignee ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <Avatar name={assignee.name} color={assignee.color} size={34} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {assignee.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {assignee.role}
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <User className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {ticket.requester}
                  </p>
                  <p className="truncate text-xs text-slate-500">Requester</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
