"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  activity as seedActivity,
  alerts as seedAlerts,
  customers as seedCustomers,
  devices as seedDevices,
  patches as seedPatches,
  sites as seedSites,
  technicians as seedTechnicians,
  tickets as seedTickets,
  timeseries as seedTimeseries,
  computeOverview,
} from "@/lib/data/seed";
import type {
  Alert,
  AlertStatus,
  ActivityEvent,
  Customer,
  Device,
  Patch,
  Site,
  Technician,
  Ticket,
  TicketComment,
  TicketPriority,
  TicketStatus,
  TimeseriesPoint,
} from "@/lib/types";
import { NOW_MS } from "@/lib/utils";

export interface NewTicketInput {
  subject: string;
  description: string;
  customerId: string;
  deviceId?: string;
  priority: TicketPriority;
  category: string;
  assigneeId: string;
}

export interface Toast {
  id: string;
  message: string;
  tone: "success" | "info" | "warning";
}

interface AppState {
  devices: Device[];
  alerts: Alert[];
  tickets: Ticket[];
  customers: Customer[];
  sites: Site[];
  technicians: Technician[];
  patches: Patch[];
  activity: ActivityEvent[];
  timeseries: TimeseriesPoint[];
  toasts: Toast[];
  overview: ReturnType<typeof computeOverview>;
  ackAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  reopenAlert: (id: string) => void;
  bulkAck: (ids: string[]) => void;
  setTicketStatus: (id: string, status: TicketStatus) => void;
  setTicketPriority: (id: string, priority: TicketPriority) => void;
  assignTicket: (id: string, assigneeId: string) => void;
  addTicketComment: (
    id: string,
    body: string,
    author: string,
    role: string,
  ) => void;
  createTicket: (input: NewTicketInput) => Ticket;
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

let toastCounter = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [devices] = useState<Device[]>(seedDevices);
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [customers] = useState<Customer[]>(seedCustomers);
  const [sites] = useState<Site[]>(seedSites);
  const [technicians] = useState<Technician[]>(seedTechnicians);
  const [patches] = useState<Patch[]>(seedPatches);
  const [activity] = useState<ActivityEvent[]>(seedActivity);
  const [timeseries] = useState<TimeseriesPoint[]>(seedTimeseries);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setAlertStatus = useCallback(
    (id: string, status: AlertStatus) => {
      const nowIso = new Date(NOW_MS).toISOString();
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                acknowledgedAt:
                  status === "acknowledged"
                    ? nowIso
                    : status === "active"
                      ? undefined
                      : a.acknowledgedAt,
                resolvedAt:
                  status === "resolved"
                    ? nowIso
                    : status === "active"
                      ? undefined
                      : a.resolvedAt,
              }
            : a,
        ),
      );
    },
    [],
  );

  const ackAlert = useCallback(
    (id: string) => {
      setAlertStatus(id, "acknowledged");
      pushToast("Alert acknowledged");
    },
    [pushToast, setAlertStatus],
  );

  const resolveAlert = useCallback(
    (id: string) => {
      setAlertStatus(id, "resolved");
      pushToast("Alert marked as resolved");
    },
    [pushToast, setAlertStatus],
  );

  const reopenAlert = useCallback(
    (id: string) => {
      setAlertStatus(id, "active");
      pushToast("Alert reopened", "info");
    },
    [pushToast, setAlertStatus],
  );

  const bulkAck = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const nowIso = new Date(NOW_MS).toISOString();
      setAlerts((prev) =>
        prev.map((a) =>
          idSet.has(a.id) && a.status === "active"
            ? { ...a, status: "acknowledged", acknowledgedAt: nowIso }
            : a,
        ),
      );
      pushToast(`${ids.length} alert${ids.length === 1 ? "" : "s"} acknowledged`);
    },
    [pushToast],
  );

  const patchTicket = useCallback(
    (id: string, updater: (t: Ticket) => Ticket) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...updater(t), updatedAt: new Date(NOW_MS).toISOString() }
            : t,
        ),
      );
    },
    [],
  );

  const setTicketStatus = useCallback(
    (id: string, status: TicketStatus) => {
      patchTicket(id, (t) => ({ ...t, status }));
      pushToast(`Ticket moved to ${status.replace("_", " ")}`);
    },
    [patchTicket, pushToast],
  );

  const setTicketPriority = useCallback(
    (id: string, priority: TicketPriority) => {
      patchTicket(id, (t) => ({ ...t, priority }));
      pushToast(`Priority set to ${priority}`, "info");
    },
    [patchTicket, pushToast],
  );

  const assignTicket = useCallback(
    (id: string, assigneeId: string) => {
      patchTicket(id, (t) => ({ ...t, assigneeId }));
      pushToast("Ticket reassigned", "info");
    },
    [patchTicket, pushToast],
  );

  const addTicketComment = useCallback(
    (id: string, body: string, author: string, role: string) => {
      const comment: TicketComment = {
        id: `cmt-${Date.now()}`,
        author,
        role,
        body,
        createdAt: new Date(NOW_MS).toISOString(),
        internal: false,
      };
      patchTicket(id, (t) => ({ ...t, comments: [...t.comments, comment] }));
      pushToast("Reply added");
    },
    [patchTicket, pushToast],
  );

  const createTicket = useCallback(
    (input: NewTicketInput): Ticket => {
      const nowIso = new Date(NOW_MS).toISOString();
      const number =
        tickets.reduce((max, t) => Math.max(max, t.number), 1100) + 1;
      const customer = customers.find((c) => c.id === input.customerId);
      const ticket: Ticket = {
        id: `tkt-${number}`,
        number,
        subject: input.subject,
        description: input.description,
        customerId: input.customerId,
        deviceId: input.deviceId,
        priority: input.priority,
        status: "open",
        channel: "portal",
        category: input.category,
        assigneeId: input.assigneeId,
        requester: customer?.contactName ?? "Unknown",
        createdAt: nowIso,
        updatedAt: nowIso,
        dueAt: new Date(
          NOW_MS +
            (input.priority === "urgent"
              ? 4
              : input.priority === "high"
                ? 8
                : input.priority === "medium"
                  ? 24
                  : 72) *
              3600 *
              1000,
        ).toISOString(),
        comments: [],
      };
      setTickets((prev) => [ticket, ...prev]);
      pushToast(`Ticket #${number} created`);
      return ticket;
    },
    [customers, pushToast, tickets],
  );

  const overview = useMemo(
    () => computeOverview(devices, alerts, tickets, customers, patches),
    [devices, alerts, tickets, customers, patches],
  );

  const value = useMemo<AppState>(
    () => ({
      devices,
      alerts,
      tickets,
      customers,
      sites,
      technicians,
      patches,
      activity,
      timeseries,
      toasts,
      overview,
      ackAlert,
      resolveAlert,
      reopenAlert,
      bulkAck,
      setTicketStatus,
      setTicketPriority,
      assignTicket,
      addTicketComment,
      createTicket,
      pushToast,
      dismissToast,
    }),
    [
      devices,
      alerts,
      tickets,
      customers,
      sites,
      technicians,
      patches,
      activity,
      timeseries,
      toasts,
      overview,
      ackAlert,
      resolveAlert,
      reopenAlert,
      bulkAck,
      setTicketStatus,
      setTicketPriority,
      assignTicket,
      addTicketComment,
      createTicket,
      pushToast,
      dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
