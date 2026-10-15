# AteraClone

A polished, full-featured front-end demo of an **Atera**-style IT management platform — remote monitoring & management (RMM) plus professional services automation (PSA) — built with Next.js, TypeScript, and Tailwind CSS.

> **Disclaimer:** This is an independent educational/portfolio project. It is **not** affiliated with, endorsed by, or connected to Atera. All data is synthetic and generated locally; there is no backend, database, or authentication.

## Highlights

- **Dashboard** — fleet health, active alerts, ticket volume, patch posture, and 14-day trend charts.
- **Devices (RMM)** — agent inventory with status, OS, CPU/RAM/disk telemetry, per-device detail with activity timeline.
- **Alerts** — severity-tagged alert queue with acknowledge / resolve / reopen and bulk actions.
- **Tickets (PSA)** — filterable table and Kanban board, priority & status workflows, agent assignment, threaded comments, and a ticket composer.
- **Customers & Sites** — customer health scores, contacts, associated devices, tickets, and alerts.
- **Patch Management** — OS/software patch compliance with per-device targets.
- **Reports** — utilization, SLA, and resolution metrics rendered with dependency-free SVG charts.
- **Settings** — organization, branding, and preference surfaces.

Interactions are backed by an in-memory store (React context) with optimistic-style updates and toast notifications — no persistence, so a refresh restores the seeded state.

## Tech stack

- **Next.js 16** (App Router, Turbopack) with **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (via `@tailwindcss/turbopack`, theme tokens in `globals.css`)
- **lucide-react** icons
- Hand-rolled **SVG charts** (no charting dependency)

## Getting started

```bash
npm install
npm run dev      # start the dev server at http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npx tsc --noEmit # type-check
```

## Project structure

```
src/
  app/                 # routes (App Router)
    page.tsx           # dashboard
    devices/           # list + [id] detail
    alerts/
    tickets/           # table + board, [id] detail
    customers/         # list + [id] detail
    patches/
    reports/
    settings/
    layout.tsx         # root layout, wraps AppProvider > AppShell
    globals.css        # Tailwind v4 theme + brand tokens
  components/          # AppShell, charts, UI primitives, toasts, modals
  lib/
    data/seed.ts       # deterministic synthetic dataset + derived metrics
    store.tsx          # in-memory app state, mutations, toasts
    types.ts           # domain types
    utils.ts           # formatters, time helpers, deterministic NOW
    meta.ts            # status/severity/priority style maps
```

Demo data is fully deterministic: every timestamp is derived from a fixed `NOW` constant in `src/lib/utils.ts`, which keeps server and client renders identical (no hydration mismatches).

## Deployment

The app builds to static/SSR output and deploys to **Vercel** with zero configuration:

```bash
vercel        # preview deployment
vercel --prod # production deployment
```

Or import the repository at [vercel.com/new](https://vercel.com/new).
