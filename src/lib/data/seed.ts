import type {
  ActivityEvent,
  Alert,
  AlertSeverity,
  AlertStatus,
  Customer,
  Device,
  DeviceStatus,
  DeviceType,
  OS,
  Patch,
  Site,
  Technician,
  Ticket,
  TicketChannel,
  TicketPriority,
  TicketStatus,
  TimeseriesPoint,
} from "@/lib/types";
import { NOW_MS } from "@/lib/utils";

/* ------------------------------- helpers -------------------------------- */

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x5eed_2026);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;
const shuffle = <T>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

function isoAgo(
  daysAgo: number,
  hoursAgo = 0,
  minutesAgo = 0,
): string {
  const ms =
    NOW_MS - ((daysAgo * 24 + hoursAgo) * 60 + minutesAgo) * 60 * 1000;
  return new Date(ms).toISOString();
}

function pad(n: number | string, len = 3): string {
  return String(n).padStart(len, "0");
}

/* ------------------------------- customers ------------------------------ */

interface CustomerSeed {
  name: string;
  industry: string;
  initials: string;
  color: string;
  plan: Customer["plan"];
  city: string;
  country: string;
  mrr: number;
  contactName: string;
}

const CUSTOMER_SEEDS: CustomerSeed[] = [
  {
    name: "Northwind Logistics",
    industry: "Transportation & Logistics",
    initials: "NL",
    color: "#4f46e5",
    plan: "Enterprise",
    city: "Amsterdam",
    country: "Netherlands",
    mrr: 4820,
    contactName: "Sanne de Vries",
  },
  {
    name: "Summit Health Group",
    industry: "Healthcare",
    initials: "SH",
    color: "#0ea5e9",
    plan: "Growth",
    city: "Denver",
    country: "United States",
    mrr: 3650,
    contactName: "Marcus Reed",
  },
  {
    name: "Brightpath Legal",
    industry: "Legal Services",
    initials: "BL",
    color: "#f59e0b",
    plan: "Professional",
    city: "London",
    country: "United Kingdom",
    mrr: 1890,
    contactName: "Amara Okafor",
  },
  {
    name: "Corex Manufacturing",
    industry: "Manufacturing",
    initials: "CM",
    color: "#ef4444",
    plan: "Enterprise",
    city: "Detroit",
    country: "United States",
    mrr: 5240,
    contactName: "Dale Foster",
  },
  {
    name: "Lumen Financial",
    industry: "Financial Services",
    initials: "LF",
    color: "#10b981",
    plan: "Enterprise",
    city: "Zurich",
    country: "Switzerland",
    mrr: 6110,
    contactName: "Nadia Brunner",
  },
  {
    name: "Apex Construction",
    industry: "Construction",
    initials: "AC",
    color: "#8b5cf6",
    plan: "Professional",
    city: "Sydney",
    country: "Australia",
    mrr: 2120,
    contactName: "Liam Carter",
  },
  {
    name: "Verdant Foods",
    industry: "Food & Beverage",
    initials: "VF",
    color: "#16a34a",
    plan: "Growth",
    city: "Cape Town",
    country: "South Africa",
    mrr: 2760,
    contactName: "Thandi Mokoena",
  },
  {
    name: "Orbital Media",
    industry: "Media & Entertainment",
    initials: "OM",
    color: "#ec4899",
    plan: "Growth",
    city: "Toronto",
    country: "Canada",
    mrr: 2980,
    contactName: "Grace Lam",
  },
  {
    name: "Highrise Property",
    industry: "Real Estate",
    initials: "HP",
    color: "#0891b2",
    plan: "Essential",
    city: "Dubai",
    country: "United Arab Emirates",
    mrr: 940,
    contactName: "Omar Haddad",
  },
  {
    name: "Beacon Education Trust",
    industry: "Education",
    initials: "BE",
    color: "#f97316",
    plan: "Essential",
    city: "Boston",
    country: "United States",
    mrr: 1180,
    contactName: "Priya Raman",
  },
];

export const customers: Customer[] = CUSTOMER_SEEDS.map((seed, i) => ({
  id: `cust-${pad(i + 1, 2)}`,
  name: seed.name,
  industry: seed.industry,
  initials: seed.initials,
  color: seed.color,
  plan: seed.plan,
  createdAt: isoAgo(randInt(180, 900)),
  contactName: seed.contactName,
  contactEmail: `${seed.contactName.toLowerCase().replace(/[^a-z]+/g, ".")}@${seed.name
    .toLowerCase()
    .replace(/[^a-z]+/g, "")}.com`,
  phone: `+1 (${randInt(200, 989)}) ${randInt(200, 999)}-${pad(randInt(0, 9999), 4)}`,
  city: seed.city,
  country: seed.country,
  mrr: seed.mrr,
}));

/* --------------------------------- sites -------------------------------- */

const SITE_SUFFIXES = ["HQ", "North Campus", "Warehouse", "Branch", "DC-1"];

export const sites: Site[] = customers.flatMap((customer, ci) => {
  const count =
    customer.plan === "Enterprise" ? 3 : customer.plan === "Growth" ? 2 : 1;
  const suffixes = shuffle(SITE_SUFFIXES).slice(0, count);
  return suffixes.map((suffix, si) => ({
    id: `site-${pad(ci + 1, 2)}-${si + 1}`,
    customerId: customer.id,
    name: `${customer.city} ${suffix}`,
    address: `${randInt(1, 240)} ${pick([
      "Market Street",
      "Innovation Way",
      "Harbour Road",
      "Kings Avenue",
      "Brooks Lane",
      "Central Plaza",
    ])}`,
    city: customer.city,
    country: customer.country,
  }));
});

/* ------------------------------- technicians ---------------------------- */

const TECH_SEEDS: Array<[string, Technician["role"]]> = [
  ["Teboho Mohale", "Admin"],
  ["Ava Thompson", "Technician"],
  ["Daniel Kim", "Technician"],
  ["Sofia Almeida", "Technician"],
  ["Noah Bennett", "Dispatcher"],
  ["Mia Rossi", "Technician"],
  ["Ethan Wright", "Technician"],
  ["Zara Patel", "Technician"],
  ["Lucas Meyer", "Dispatcher"],
  ["Chloe Dubois", "Read Only"],
];

const TECH_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

export const technicians: Technician[] = TECH_SEEDS.map(([name, role], i) => ({
  id: `tech-${pad(i + 1, 2)}`,
  name,
  email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ")[1].toLowerCase()}@atera-demo.io`,
  role,
  color: TECH_COLORS[i % TECH_COLORS.length],
  status: chance(0.75) ? "online" : chance(0.5) ? "away" : "offline",
}));

/* -------------------------------- devices ------------------------------- */

const OS_VERSIONS: Record<OS, string[]> = {
  windows: [
    "Windows 11 Pro 24H2",
    "Windows 11 Pro 23H2",
    "Windows 11 Enterprise",
    "Windows Server 2022",
    "Windows Server 2019",
  ],
  macos: ["macOS 15.1 Sequoia", "macOS 14.7 Sonoma", "macOS 13.7 Ventura"],
  linux: ["Ubuntu 24.04 LTS", "Ubuntu 22.04 LTS", "Debian 12", "RHEL 9.4"],
};

const CPU_MODELS = [
  "Intel Core i7-13700",
  "Intel Core i5-12400",
  "AMD Ryzen 7 5800X",
  "AMD Ryzen 5 5600",
  "Apple M3 Pro",
  "Apple M2",
  "Intel Xeon Silver 4314",
];

const MANUFACTURERS = ["Dell", "Lenovo", "HP", "Apple", "ASUS", "Supermicro"];

const USERS = [
  "s.vries",
  "m.reed",
  "a.okafor",
  "d.foster",
  "n.brunner",
  "l.carter",
  "t.mokoena",
  "g.lam",
  "o.haddad",
  "p.raman",
  "frontdesk",
  "reception",
  "admin",
  "j.miller",
  "k.novak",
];

function macAddress(): string {
  return Array.from({ length: 6 }, () =>
    pad(randInt(0, 255).toString(16), 2).toUpperCase(),
  ).join(":");
}

function pickOs(type: DeviceType): OS {
  if (type === "server") return chance(0.6) ? "windows" : "linux";
  return chance(0.7) ? "windows" : chance(0.5) ? "macos" : "linux";
}

export const devices: Device[] = customers.flatMap((customer, ci) => {
  const customerSites = sites.filter((s) => s.customerId === customer.id);
  const count =
    customer.plan === "Enterprise"
      ? randInt(9, 12)
      : customer.plan === "Growth"
        ? randInt(6, 9)
        : randInt(3, 5);

  return Array.from({ length: count }, (_, di) => {
    const site = pick(customerSites);
    const type: DeviceType = chance(0.15) ? "server" : "workstation";
    const os = pickOs(type);
    const statusRoll = rand();
    const status: DeviceStatus =
      statusRoll > 0.12
        ? "online"
        : statusRoll > 0.04
          ? "warning"
          : "offline";
    const prefix = customer.initials;
    const hostname = `${prefix}-${type === "server" ? "SRV" : "WS"}-${pad(di + 1, 3)}`;
    const ramTotalGb = type === "server" ? pick([32, 64, 128, 256]) : pick([8, 16, 32]);
    const diskTotalGb = type === "server" ? pick([512, 1024, 2048]) : pick([256, 512, 1024]);

    return {
      id: `dev-${pad(ci + 1, 2)}-${pad(di + 1, 3)}`,
      hostname,
      customerId: customer.id,
      siteId: site.id,
      os,
      osVersion: pick(OS_VERSIONS[os]),
      type,
      status,
      lastSeen:
        status === "offline"
          ? isoAgo(randInt(1, 9), randInt(0, 23))
          : isoAgo(0, 0, randInt(0, 40)),
      agentVersion: chance(0.8) ? "4.8.2" : "4.7.9",
      ipAddress: `10.${randInt(0, 40)}.${randInt(0, 40)}.${randInt(2, 250)}`,
      macAddress: macAddress(),
      cpuModel: type === "server" ? "Intel Xeon Silver 4314" : pick(CPU_MODELS),
      cpuCores: type === "server" ? pick([16, 24, 32]) : pick([4, 6, 8, 10, 12]),
      cpuUsage:
        status === "offline"
          ? 0
          : status === "warning"
            ? randInt(78, 97)
            : randInt(6, 62),
      ramTotalGb,
      ramUsage:
        status === "offline"
          ? 0
          : status === "warning"
            ? randInt(80, 96)
            : randInt(22, 71),
      diskTotalGb,
      diskUsage: status === "offline" ? randInt(40, 60) : randInt(38, 94),
      loggedInUser: status === "offline" ? "—" : pick(USERS),
      serial: `${pick(["JH", "PF", "CN", "5CG"])}${randInt(100000, 999999)}`,
      manufacturer: pick(MANUFACTURERS),
      model:
        type === "server"
          ? pick(["PowerEdge R650", "ThinkSystem SR650", "ProLiant DL380"])
          : pick(["Latitude 5540", "ThinkPad T14", "MacBook Pro 14", "EliteBook 840"]),
      tags: shuffle([
        chance(0.6) ? "managed" : "unmanaged",
        chance(0.5) ? "backup-enabled" : "no-backup",
        chance(0.4) ? "bitlocker" : "encryption-pending",
        chance(0.3) ? "vip-user" : "standard",
      ]).slice(0, 3),
      purchasedAt: isoAgo(randInt(120, 1400)),
    };
  });
});

/* --------------------------------- alerts ------------------------------- */

const ALERT_TEMPLATES: Array<{
  category: string;
  title: string;
  description: string;
  severity: AlertSeverity;
}> = [
  {
    category: "Performance",
    title: "CPU usage above threshold",
    description:
      "Sustained CPU utilization has exceeded 90% for more than 10 minutes.",
    severity: "high",
  },
  {
    category: "Performance",
    title: "Memory pressure detected",
    description:
      "Available physical memory dropped below 10% of total capacity.",
    severity: "high",
  },
  {
    category: "Storage",
    title: "Low disk space on C:\\",
    description:
      "Free disk space is below the configured 10% threshold. Cleanup or expansion required.",
    severity: "critical",
  },
  {
    category: "Security",
    title: "Antivirus definitions out of date",
    description:
      "The endpoint protection definitions have not been updated in over 72 hours.",
    severity: "medium",
  },
  {
    category: "Security",
    title: "Multiple failed login attempts",
    description:
      "Windows Security log recorded 12 failed interactive logon attempts.",
    severity: "critical",
  },
  {
    category: "Patch Management",
    title: "Critical security update missing",
    description:
      "A critical OS security update has been pending installation for 14 days.",
    severity: "high",
  },
  {
    category: "Backup",
    title: "Backup job failed",
    description:
      "The scheduled nightly backup job did not complete successfully.",
    severity: "critical",
  },
  {
    category: "Availability",
    title: "Agent heartbeat missed",
    description:
      "No heartbeat received from the Atera agent within the expected interval.",
    severity: "medium",
  },
  {
    category: "Hardware",
    title: "SMART predictive failure warning",
    description:
      "The primary storage device reported a SMART predictive failure.",
    severity: "critical",
  },
  {
    category: "Network",
    title: "High packet loss on uplink",
    description:
      "The monitoring probe recorded 8% packet loss over the last hour.",
    severity: "low",
  },
  {
    category: "Compliance",
    title: "Encryption not enabled",
    description: "Full disk encryption has not been enabled on this endpoint.",
    severity: "medium",
  },
  {
    category: "Services",
    title: "Windows service stopped unexpectedly",
    description:
      "A monitored service transitioned to a stopped state without a scheduled change.",
    severity: "low",
  },
];

export const alerts: Alert[] = [];
{
  const count = 58;
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const device = pick(devices);
    const template = pick(ALERT_TEMPLATES);
    const key = `${device.id}:${template.title}`;
    if (used.has(key)) continue;
    used.add(key);

    const ageHours = randInt(0, 72);
    const createdAt = isoAgo(0, ageHours, randInt(0, 59));
    const statusRoll = rand();
    const status: AlertStatus =
      ageHours < 6 && statusRoll < 0.7
        ? "active"
        : statusRoll < 0.45
          ? "acknowledged"
          : "resolved";

    alerts.push({
      id: `alert-${pad(alerts.length + 1, 3)}`,
      deviceId: device.id,
      customerId: device.customerId,
      severity: template.severity,
      status,
      title: template.title,
      description: template.description,
      category: template.category,
      createdAt,
      acknowledgedAt:
        status === "acknowledged" || status === "resolved"
          ? isoAgo(0, Math.max(0, ageHours - 1), randInt(0, 59))
          : undefined,
      resolvedAt:
        status === "resolved"
          ? isoAgo(0, Math.max(0, ageHours - 2), randInt(0, 59))
          : undefined,
    });
  }
}

/* -------------------------------- tickets ------------------------------- */

const TICKET_SUBJECTS: Array<{
  subject: string;
  category: string;
  body: string;
}> = [
  {
    subject: "Unable to connect to the VPN",
    category: "Networking",
    body: "User reports the corporate VPN client fails to establish a tunnel from the branch office since this morning.",
  },
  {
    subject: "Outlook stuck on loading profile",
    category: "Email",
    body: "Outlook hangs on the loading profile screen. Restarting the application did not resolve the issue.",
  },
  {
    subject: "New starter onboarding — access request",
    category: "Service Request",
    body: "Please provision a new user account, email, and access to the shared finance drive for a starter next Monday.",
  },
  {
    subject: "Printer offline on floor 3",
    category: "Hardware",
    body: "The network printer on the third floor is showing offline for all users on that VLAN.",
  },
  {
    subject: "Suspicious phishing email reported",
    category: "Security",
    body: "User forwarded a suspicious email requesting credentials. Requesting analysis and possible org-wide block.",
  },
  {
    subject: "Laptop running very slowly",
    category: "Performance",
    body: "The device is extremely slow when opening multiple browser tabs. Reported by the user this morning.",
  },
  {
    subject: "Password reset required",
    category: "Service Request",
    body: "User is locked out after a failed password reset and needs the account unlocked.",
  },
  {
    subject: "Backup verification failed",
    category: "Backup",
    body: "Nightly backup verification job reported a checksum mismatch on the file server.",
  },
  {
    subject: "Shared drive permissions incorrect",
    category: "Access",
    body: "The marketing team cannot access the shared creative drive after the folder reorganisation.",
  },
  {
    subject: "Software installation request — Figma",
    category: "Service Request",
    body: "Design team requests Figma desktop be installed and licensed on two machines.",
  },
  {
    subject: "Email delivery delays",
    category: "Email",
    body: "Multiple users report delays of up to 30 minutes receiving external mail.",
  },
  {
    subject: "Monitor flickering after update",
    category: "Hardware",
    body: "External monitor began flickering after the latest graphics driver update.",
  },
  {
    subject: "Wi-Fi drops in meeting rooms",
    category: "Networking",
    body: "Wireless connectivity intermittently drops in the east wing meeting rooms during video calls.",
  },
  {
    subject: "Antivirus alert on workstation",
    category: "Security",
    body: "Endpoint protection quarantined a potentially unwanted application. Requesting review.",
  },
  {
    subject: "Server certificate expiring soon",
    category: "Infrastructure",
    body: "The TLS certificate for the intranet portal expires in 14 days. Requesting renewal.",
  },
];

const CHANNELS: TicketChannel[] = ["email", "phone", "portal", "chat", "alert"];

function slaHours(priority: TicketPriority): number {
  switch (priority) {
    case "urgent":
      return 4;
    case "high":
      return 8;
    case "medium":
      return 24;
    default:
      return 72;
  }
}

const TECH_ASSIGNEES = technicians.filter(
  (t) => t.role === "Technician" || t.role === "Admin",
);

export const tickets: Ticket[] = [];
{
  const count = 62;
  for (let i = 0; i < count; i++) {
    const template = TICKET_SUBJECTS[i % TICKET_SUBJECTS.length];
    const customer = pick(customers);
    const customerDevices = devices.filter((d) => d.customerId === customer.id);
    const device = chance(0.6) ? pick(customerDevices) : undefined;
    const priority: TicketPriority = pick([
      "low",
      "medium",
      "medium",
      "high",
      "high",
      "urgent",
    ]);
    const createdHoursAgo = randInt(1, 24 * 21);
    const statusRoll = rand();
    const status: TicketStatus =
      statusRoll < 0.28
        ? "open"
        : statusRoll < 0.56
          ? "in_progress"
          : statusRoll < 0.72
            ? "pending"
            : "resolved";
    const assignee = pick(TECH_ASSIGNEES);
    const createdAt = isoAgo(0, createdHoursAgo, randInt(0, 59));
    const updatedAt = isoAgo(0, Math.max(0, createdHoursAgo - randInt(0, 5)), randInt(0, 59));
    const dueAt = new Date(
      new Date(createdAt).getTime() + slaHours(priority) * 3600 * 1000,
    ).toISOString();

    const comments: Ticket["comments"] = [];
    const commentCount = status === "open" ? randInt(0, 1) : randInt(1, 3);
    for (let c = 0; c < commentCount; c++) {
      comments.push({
        id: `cmt-${pad(i + 1, 3)}-${c + 1}`,
        author: c % 2 === 0 ? assignee.name : customer.contactName,
        role: c % 2 === 0 ? assignee.role : "Customer",
        body:
          c % 2 === 0
            ? pick([
                "Thanks for the report — I'm investigating now and will update you shortly.",
                "I've reproduced the issue and applied a fix. Please confirm on your end.",
                "Scheduled a maintenance window to apply the required changes.",
                "Could you please provide a screenshot of the error you're seeing?",
              ])
            : pick([
                "Still seeing the same issue after the restart.",
                "That appears to have resolved it, thank you!",
                "It happens intermittently, mostly in the mornings.",
                "Adding our office manager to this thread for visibility.",
              ]),
        createdAt: isoAgo(0, Math.max(0, createdHoursAgo - c * 2 - 1), randInt(0, 59)),
        internal: false,
      });
    }

    tickets.push({
      id: `tkt-${pad(i + 1, 3)}`,
      number: 1042 + i,
      subject: template.subject,
      description: template.body,
      customerId: customer.id,
      deviceId: device?.id,
      priority,
      status,
      channel: pick(CHANNELS),
      category: template.category,
      assigneeId: assignee.id,
      requester: customer.contactName,
      createdAt,
      updatedAt,
      dueAt,
      comments,
    });
  }
}

/* -------------------------------- patches ------------------------------- */

const PATCH_TITLES = [
  { kb: "KB5041585", title: "Cumulative Update for Windows 11 (24H2)", severity: "critical" as const },
  { kb: "KB5043145", title: "Servicing Stack Update", severity: "important" as const },
  { kb: "KB5039212", title: ".NET Framework Security Update", severity: "critical" as const },
  { kb: "KB5040442", title: "Cumulative Update for Windows Server 2022", severity: "critical" as const },
  { kb: "KB5037771", title: "Microsoft Defender Definitions", severity: "moderate" as const },
  { kb: "KB5036893", title: "Edge Chromium Security Update", severity: "important" as const },
];

export const patches: Patch[] = [];
{
  const windowsDevices = devices.filter((d) => d.os === "windows");
  for (const device of windowsDevices) {
    const patchCount = randInt(1, 3);
    for (let p = 0; p < patchCount; p++) {
      const template = pick(PATCH_TITLES);
      const statusRoll = rand();
      patches.push({
        id: `patch-${patches.length + 1}`,
        deviceId: device.id,
        kb: template.kb,
        title: template.title,
        severity: template.severity,
        status:
          statusRoll < 0.55
            ? "installed"
            : statusRoll < 0.88
              ? "pending"
              : "failed",
        releasedAt: isoAgo(randInt(2, 60)),
      });
    }
  }
}

/* -------------------------------- activity ------------------------------ */

export const activity: ActivityEvent[] = [
  {
    id: "act-1",
    kind: "security",
    message: "Elevated alert acknowledged on 3 endpoints at Corex Manufacturing",
    actor: "Ava Thompson",
    createdAt: isoAgo(0, 0, 12),
  },
  {
    id: "act-2",
    kind: "ticket",
    message: "Ticket #1093 resolved and requester notified",
    actor: "Daniel Kim",
    createdAt: isoAgo(0, 0, 41),
  },
  {
    id: "act-3",
    kind: "patch",
    message: "12 critical patches deployed to Lumen Financial workstations",
    actor: "System",
    createdAt: isoAgo(0, 1, 5),
  },
  {
    id: "act-4",
    kind: "device",
    message: "New agent enrolled — NWL-WS-014 (Northwind Logistics)",
    actor: "System",
    createdAt: isoAgo(0, 2, 30),
  },
  {
    id: "act-5",
    kind: "alert",
    message: "Backup job failure resolved on CM-SRV-002",
    actor: "Sofia Almeida",
    createdAt: isoAgo(0, 3, 18),
  },
  {
    id: "act-6",
    kind: "billing",
    message: "Monthly invoice generated for 10 managed customers",
    actor: "System",
    createdAt: isoAgo(0, 6, 0),
  },
  {
    id: "act-7",
    kind: "customer",
    message: "Onboarding checklist completed for Beacon Education Trust",
    actor: "Teboho Mohale",
    createdAt: isoAgo(0, 8, 45),
  },
  {
    id: "act-8",
    kind: "security",
    message: "Phishing campaign blocked across 42 mailboxes",
    actor: "Security Engine",
    createdAt: isoAgo(1, 2, 10),
  },
  {
    id: "act-9",
    kind: "ticket",
    message: "3 urgent tickets escalated to on-call engineer",
    actor: "Noah Bennett",
    createdAt: isoAgo(1, 5, 20),
  },
  {
    id: "act-10",
    kind: "device",
    message: "2 endpoints flagged offline at Highrise Property",
    actor: "Monitoring",
    createdAt: isoAgo(1, 9, 0),
  },
  {
    id: "act-11",
    kind: "patch",
    message: "Patch compliance report published for October",
    actor: "System",
    createdAt: isoAgo(2, 1, 0),
  },
  {
    id: "act-12",
    kind: "alert",
    message: "SMART failure warning raised on VF-SRV-001",
    actor: "Monitoring",
    createdAt: isoAgo(2, 4, 33),
  },
];

/* ----------------------------- timeseries ------------------------------- */

export const timeseries: TimeseriesPoint[] = Array.from({ length: 14 }, (_, i) => {
  const daysAgo = 13 - i;
  const date = new Date(NOW_MS - daysAgo * 86400000);
  const label = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const base = weekend ? 4 : 9;
  const alertsCount = base + randInt(-3, 9);
  const resolved = Math.max(1, alertsCount - randInt(-2, 4));
  const ticketsCount = Math.max(1, base - 1 + randInt(-2, 7));
  const closed = Math.max(1, ticketsCount - randInt(-2, 3));
  return {
    label,
    alerts: alertsCount,
    resolved,
    tickets: ticketsCount,
    closed,
  };
});

/* --------------------------- derived metrics ---------------------------- */

export interface Overview {
  totalDevices: number;
  online: number;
  offline: number;
  warning: number;
  activeAlerts: number;
  criticalAlerts: number;
  openTickets: number;
  urgentTickets: number;
  customers: number;
  mrr: number;
  avgCpu: number;
  avgRam: number;
  avgDisk: number;
  patchCompliance: number;
  slaCompliance: number;
  agentCoverage: number;
}

export function computeOverview(
  deviceList: Device[],
  alertList: Alert[],
  ticketList: Ticket[],
  customerList: Customer[],
  patchList: Patch[],
): Overview {
  const onlineDevices = deviceList.filter((d) => d.status !== "offline");
  const avg = (fn: (d: Device) => number) =>
    onlineDevices.length
      ? onlineDevices.reduce((sum, d) => sum + fn(d), 0) / onlineDevices.length
      : 0;

  const resolvedOrAcked = ticketList.filter(
    (t) => t.status === "resolved" || t.status === "pending",
  ).length;
  const installedPatches = patchList.filter((p) => p.status === "installed").length;

  return {
    totalDevices: deviceList.length,
    online: deviceList.filter((d) => d.status === "online").length,
    offline: deviceList.filter((d) => d.status === "offline").length,
    warning: deviceList.filter((d) => d.status === "warning").length,
    activeAlerts: alertList.filter((a) => a.status === "active").length,
    criticalAlerts: alertList.filter(
      (a) => a.status === "active" && a.severity === "critical",
    ).length,
    openTickets: ticketList.filter((t) => t.status !== "resolved").length,
    urgentTickets: ticketList.filter(
      (t) => t.status !== "resolved" && t.priority === "urgent",
    ).length,
    customers: customerList.length,
    mrr: customerList.reduce((sum, c) => sum + c.mrr, 0),
    avgCpu: avg((d) => d.cpuUsage),
    avgRam: avg((d) => d.ramUsage),
    avgDisk: avg((d) => d.diskUsage),
    patchCompliance: patchList.length
      ? (installedPatches / patchList.length) * 100
      : 100,
    slaCompliance: ticketList.length
      ? (resolvedOrAcked / ticketList.length) * 100
      : 100,
    agentCoverage: deviceList.length
      ? ((deviceList.length - alertList.filter((a) => a.title.includes("heartbeat")).length) /
          deviceList.length) *
        100
      : 100,
  };
}
