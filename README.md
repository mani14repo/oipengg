# PUMA Journey Intelligence

End-to-End Underwriting Reliability & Operational Intelligence workbench for the PUMA platform.

## Overview

PUMA Journey Intelligence is an interactive operational intelligence workbench that visualizes the PUMA underwriting platform's 12-stage journey, connecting business journey → applications → architecture → risks → incidents → problems → changes → corrective actions → toil → reliability outcomes.

**Analysis Period:** July 1 – October 30, 2026  
**Data Mode:** Mock data (ServiceNow integration via BFF server in Phase 5)

## Tech Stack

- **React 19** + TypeScript + Vite 8
- **Tailwind CSS v4** (CSS-based theming, no config file)
- **Zustand** (client state), **TanStack Query v5** (server state)
- **Recharts** (bar/line charts), **React Flow** (dependency graphs, Phase 2)
- **React Router v7**, **Zod**, **Framer Motion**
- **BFF Server** (Node.js/Express, port 3001) — ServiceNow credentials never exposed to browser

## Setup

```bash
npm install
npm run dev        # starts Vite dev server on http://localhost:5173
npm run build      # production build to dist/
npm run test       # runs Vitest unit tests
npm run bff        # starts BFF proxy server on port 3001 (Phase 5)
```

### Environment

Copy `.env.example` to `.env.local` and configure:

```
VITE_DATA_MODE=mock          # or 'api' for live ServiceNow
VITE_API_BASE_URL=http://localhost:3001
```

ServiceNow credentials go in `bff/.env` (never in `VITE_*` variables — they would be exposed to the browser).

## Application Structure

### Navigation

| Route | Page | Description |
|-------|------|-------------|
| `/` | Journey Explorer | 12-stage journey with 8 analytical lenses |
| `/architecture` | Architecture Explorer | Component map, hotspots, arch issues |
| `/risks` | Risks & Incidents | Risk overview, incident explorer, toil intelligence |
| `/reliability` | Reliability & Remediation | SLO status, systemic fixes, RCA pipeline |

### Journey Lenses

The Journey Explorer supports 8 lenses (switch via the lens selector):

- **Business** — Stage purpose, owners, actors
- **Risks** — Risk indicators per stage
- **Incidents** — Incident counts and trends
- **Architecture** — Component assignments
- **Handoffs** — Cross-system handoff points and reliability
- **Toil** — Manual work by stage
- **Reliability** — SLO/SLI status (evidence-based; unknown ≠ healthy)
- **Remediation** — Problem/change/corrective action pipeline

## Key Design Decisions

**Evidence-first principle:** Unknown reliability status means insufficient telemetry, not healthy. All reliability states are explicitly tagged with their evidence source.

**R3 (Deadline Pressure) is overlapping:** It co-occurs with other risks and is excluded from mutually exclusive totals. The UI surfaces this with a warning banner.

**ServiceNow credentials in BFF only:** The Express BFF proxy (`bff/server.js`) manages all ServiceNow authentication. The React app only calls `/api/*` on its own origin.

**Stage 7 (DFM/Forecast Creation)** has the highest incident concentration (44 incidents) — it is the platform's primary architectural hotspot.

## Project Structure

```
src/
  app/           App shell, routing, providers
  components/    UI components by domain
    architecture/
    handoffs/
    journey/
    layout/
    reliability/
    remediation/
    risks/
    toil/
  data/          Seed/mock data
    mock/        Mock incident and toil data
  domain/        TypeScript interfaces (no business logic)
  integrations/  ServiceNow adapter (mock + live interfaces)
  lib/           Utility functions
  pages/         Route page components
  state/         Zustand stores
  tests/         Vitest unit tests
bff/             Express BFF proxy server
```

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Journey Explorer | ✅ Complete | 12-stage journey, 8 lenses, stage drill-down, handoff detail |
| 2 — Architecture | ✅ Complete | Component map, hotspots, arch issues, dependency sidebar |
| 3 — Operational Intelligence | ✅ Complete | Risk explorer, incident table, toil heatmap |
| 4 — Reliability | ✅ Complete | SLO status, systemic fixes, RCA pipeline |
| 5 — API Integration | 🔲 Planned | Live ServiceNow adapter, auth, end-to-end tests |
