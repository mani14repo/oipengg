/**
 * PUMA Journey Intelligence — Backend for Frontend (BFF)
 *
 * Node.js / Express server acting as a secure proxy between the React frontend
 * and ServiceNow. Credentials are stored server-side only.
 *
 * To run: node bff/server.js
 */

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const DATA_MODE = process.env.DATA_MODE ?? "mock";
const PORT = process.env.PORT ?? 3001;

// ─── Mock data (mirrors src/data) ────────────────────────────────────────────

const MOCK_INCIDENTS = [
  {
    id: "inc-r5-001",
    number: "INC0012301",
    shortDescription: "Pricing discrepancy in EOS P&L output for group 45678",
    priority: "P2",
    state: "closed",
    assignmentGroup: "PUMA Support",
    applicationId: "comp-engine",
    reportedStageId: 8,
    relatedRiskId: "R5",
    openedAt: "2026-10-15T09:23:00Z",
    resolvedAt: "2026-10-15T14:45:00Z",
  },
  {
    id: "inc-r2-001",
    number: "INC0011901",
    shortDescription: "DFM forecast job stuck in queued state for 4 hours",
    priority: "P1",
    state: "closed",
    assignmentGroup: "PUMA SRE",
    applicationId: "dfm-api",
    reportedStageId: 7,
    relatedRiskId: "R2",
    openedAt: "2026-09-18T07:30:00Z",
    resolvedAt: "2026-09-18T12:15:00Z",
  },
  {
    id: "inc-h6-001",
    number: "INC0012201",
    shortDescription: "IRF formulary submitted but DFM forecast not initiated",
    priority: "P1",
    state: "closed",
    assignmentGroup: "PUMA SRE",
    applicationId: "irf-python",
    reportedStageId: 6,
    relatedRiskId: "H6",
    openedAt: "2026-10-10T08:00:00Z",
    resolvedAt: "2026-10-10T14:00:00Z",
  },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok", dataMode: DATA_MODE }));

// Incidents
app.get("/api/servicenow/incidents", (req, res) => {
  let items = [...MOCK_INCIDENTS];
  const { applicationId, priority, openedAfter, openedBefore, limit = "25" } = req.query;

  if (applicationId) items = items.filter((i) => i.applicationId === applicationId);
  if (priority) items = items.filter((i) => i.priority === priority);
  if (openedAfter) items = items.filter((i) => i.openedAt >= openedAfter);
  if (openedBefore) items = items.filter((i) => i.openedAt <= openedBefore);

  const lim = parseInt(limit, 10);
  res.json({ items: items.slice(0, lim), total: items.length });
});

app.get("/api/servicenow/incidents/:id", (req, res) => {
  const item = MOCK_INCIDENTS.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Problems (placeholder)
app.get("/api/servicenow/problems", (_req, res) => {
  res.json({ items: [], total: 0, message: "Live ServiceNow integration pending" });
});

// Changes (placeholder)
app.get("/api/servicenow/changes", (_req, res) => {
  res.json({ items: [], total: 0, message: "Live ServiceNow integration pending" });
});

// Problem tasks (placeholder)
app.get("/api/servicenow/problem-tasks", (_req, res) => {
  res.json({ items: [], total: 0, message: "Live ServiceNow integration pending" });
});

// Journey graph
app.get("/api/puma/journey", (_req, res) => {
  res.json({
    stages: 12,
    handoffs: 11,
    dataAsOf: new Date().toISOString(),
    message: "Full graph served from frontend seed data in mock mode",
  });
});

// Architecture issues (placeholder)
app.get("/api/architecture/issues", (_req, res) => {
  res.json({ items: [], message: "Architecture API integration pending" });
});

app.listen(PORT, () => {
  console.log(`PUMA BFF server running on http://localhost:${PORT} [${DATA_MODE} mode]`);
});
