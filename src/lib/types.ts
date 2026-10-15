export type OS = "windows" | "macos" | "linux";
export type DeviceType = "workstation" | "server";
export type DeviceStatus = "online" | "offline" | "warning";

export type Plan = "Essential" | "Professional" | "Growth" | "Enterprise";

export interface Customer {
  id: string;
  name: string;
  industry: string;
  initials: string;
  color: string;
  plan: Plan;
  createdAt: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  city: string;
  country: string;
  mrr: number;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Device {
  id: string;
  hostname: string;
  customerId: string;
  siteId: string;
  os: OS;
  osVersion: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeen: string;
  agentVersion: string;
  ipAddress: string;
  macAddress: string;
  cpuModel: string;
  cpuCores: number;
  cpuUsage: number;
  ramTotalGb: number;
  ramUsage: number;
  diskTotalGb: number;
  diskUsage: number;
  loggedInUser: string;
  serial: string;
  manufacturer: string;
  model: string;
  tags: string[];
  purchasedAt: string;
}

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  deviceId: string;
  customerId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "pending" | "resolved";
export type TicketChannel = "email" | "phone" | "portal" | "chat" | "alert";

export interface TicketComment {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: string;
  internal: boolean;
}

export interface Ticket {
  id: string;
  number: number;
  subject: string;
  description: string;
  customerId: string;
  deviceId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  category: string;
  assigneeId: string;
  requester: string;
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  comments: TicketComment[];
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Technician" | "Dispatcher" | "Read Only";
  color: string;
  status: "online" | "away" | "offline";
}

export interface Patch {
  id: string;
  deviceId: string;
  kb: string;
  title: string;
  severity: "critical" | "important" | "moderate" | "low";
  status: "pending" | "installed" | "failed";
  releasedAt: string;
}

export interface ActivityEvent {
  id: string;
  kind:
    | "alert"
    | "ticket"
    | "device"
    | "patch"
    | "billing"
    | "security"
    | "customer";
  message: string;
  actor: string;
  createdAt: string;
}

export interface TimeseriesPoint {
  label: string;
  alerts: number;
  resolved: number;
  tickets: number;
  closed: number;
}
