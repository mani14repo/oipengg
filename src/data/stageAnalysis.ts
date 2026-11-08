// Stage-level analysis data ported from the reference HTML (PUMA_Journey_Health.html)
// Covers: stage risks, governance guidance, architecture, handoffs, and controls.

export type EvidenceLevel = "obs" | "doc" | "hyp" | "con" | "gap";
export type ControlPriority = "P0" | "P1" | "P2";
export type HandoffStatus =
  | "Not established"
  | "Gap observed"
  | "Partial"
  | "Not monitored"
  | "Partial (email)"
  | "Established";

export interface StageRisk {
  riskId: string;
  causeText: string;
}

export interface GovernanceTemplate {
  refId: string;
  title: string;
}

export interface GovernanceGuidance {
  direction: string;
  templates: GovernanceTemplate[];
}

export interface ArchExposure {
  text: string;
  confidence: EvidenceLevel;
}

export interface StageArch {
  areas: string[];
  components: string[];
  exposures: ArchExposure[];
}

export interface JourneyHandoffRecord {
  fromStage: number;
  toStage: number;
  name: string;
  type: string;
  status: HandoffStatus;
}

export interface ControlRecord {
  id: string;
  stages: number[];
  component: string;
  question: string;
  assessmentRef: string;
  evidence: string;
  status: "Documented gap" | "Not assessed" | "Established" | "Partial";
  priority: ControlPriority;
  owner: string;
  riskId: string;
}

// ── Stage Risks ──────────────────────────────────────────────────────────────

export const STAGE_RISKS: Record<number, StageRisk[]> = {
  1: [
    { riskId: "R3", causeText: "Proposal due date not carried downstream" },
    { riskId: "R4", causeText: "Salesforce access provisioned by hand" },
    { riskId: "H6", causeText: "Client details retyped into CPT" },
  ],
  2: [
    { riskId: "R4", causeText: "Manual case administration in CPT" },
    { riskId: "R4", causeText: "Same manager assigns and approves" },
    { riskId: "H6", causeText: "CPT task sync to EOS/IRF can fail silently" },
  ],
  3: [
    { riskId: "H7", causeText: "EOS save/refresh slow under concurrent load" },
    { riskId: "R4", causeText: "Model access depends on CPT task creation" },
    { riskId: "R5", causeText: "Assumptions typed with little validation" },
  ],
  4: [
    { riskId: "R2", causeText: "No completion target, no stuck-job detection" },
    { riskId: "R2", causeText: "Payload combinations not validated at AFP" },
    { riskId: "R1", causeText: "Every revision restarts from this stage" },
  ],
  5: [
    { riskId: "R4", causeText: "Custom path adds handoff to Rebate Analyst" },
  ],
  6: [
    { riskId: "R4", causeText: "UWT tasks don't always appear in IRF" },
    { riskId: "R5", causeText: "Rate/shift logic depends on manual table setup" },
    { riskId: "R2", causeText: "Forecast review jobs queue and stall" },
  ],
  7: [
    { riskId: "R2", causeText: "Every opportunity passes through DFM; heavy jobs back up others" },
    { riskId: "R5", causeText: "Input freshness and data migrations change outputs without detection" },
  ],
  8: [
    { riskId: "R2", causeText: "Depends on DFM output with no fallback if unavailable" },
    { riskId: "R5", causeText: "Pricing logic changes mid-season; outputs not compared against prior runs" },
  ],
  9: [
    { riskId: "R1", causeText: "Reruns don't always reproduce earlier results" },
    { riskId: "R5", causeText: "No explain/audit view for financial model outputs" },
  ],
  10: [
    { riskId: "R1", causeText: "Revisions send the opportunity back to stage 4" },
    { riskId: "R4", causeText: "Approver queue grows at peak period with no escalation" },
    { riskId: "R3", causeText: "No view of deal due dates for approvers" },
  ],
  11: [
    { riskId: "H6", causeText: "EOS to CPH to Salesforce payloads don't match" },
    { riskId: "H8", causeText: "Reports generated synchronously near proposal due date" },
    { riskId: "R5", causeText: "Generated proposal can differ from approved model" },
  ],
  12: [
    { riskId: "H6", causeText: "AFP write-back not monitored for failure" },
    { riskId: "R3", causeText: "Loss reasons not fed back to improve future modeling" },
  ],
};

// ── Governance Guidance per Risk ──────────────────────────────────────────────

export const GOV: Record<string, GovernanceGuidance> = {
  R1: {
    direction:
      "Version the inputs of every DFM run (formulary snapshot, rate tables, GCP feed hashes) and surface a diff when a rerun produces different outputs. Add a replay capability so any run can be reproduced from its archived inputs. Gate production releases of pricing logic behind a regression suite that compares outputs on a fixed sample set.",
    templates: [
      { refId: "SRE-AT-02", title: "Architecture Reliability & Failure-Mode Assessment" },
      { refId: "SRE-PB-15", title: "Post-Deployment Reliability Validation Playbook" },
    ],
  },
  R2: {
    direction:
      "Define data-request completion targets (SLOs) for the DFM pipeline and enforce admission control so heavy jobs cannot starve others. Add checkpoint/resume so an interrupted run does not restart from zero. Instrument all pipeline stages with error-rate and latency metrics that page support before underwriters notice failures.",
    templates: [
      { refId: "SLO-T", title: "SLO Document Template" },
      { refId: "SRE-PB-04", title: "SLI-SLO & Error Budget Engineering Playbook" },
      { refId: "SRE-AT-04", title: "Service-Level Reliability Assessment" },
      { refId: "SRE-AT-06", title: "Performance, Load & Capacity Readiness Assessment" },
    ],
  },
  R3: {
    direction:
      "Record the opportunity ID and proposal due date in every downstream system at intake. Build a cross-system view that shows each deal's due date and remaining time against pipeline stage. Alert the team when a deal is at risk of missing its deadline before it actually does.",
    templates: [
      { refId: "SLO-T", title: "SLO Document Template" },
      { refId: "ITSM-AT-06", title: "SLA Compliance & OLA Governance Assessment" },
      { refId: "ITSM-PB-01", title: "Incident Detection, Triage & Resolution Playbook" },
    ],
  },
  R4: {
    direction:
      "Automate CPT case administration and task-sync checks so underwriters spend their time modelling, not triaging workflow state. Measure toil per workflow step and set reduction targets. Enforce separation of duties in CPT so the assigning manager cannot also approve.",
    templates: [
      { refId: "SRE-AT-08", title: "Operational Ownership & Supportability Assessment" },
      { refId: "SRE-AT-10", title: "Toil Measurement & Automation Readiness Assessment" },
      { refId: "SRE-PB-12", title: "Reliability Toil Reduction Playbook" },
      { refId: "CMDB-PB-04", title: "CI Ownership, Lifecycle & Certification Playbook" },
    ],
  },
  R5: {
    direction:
      "Add reasonableness checks on DFM and Comp Engine outputs (rate corridors, year-on-year variance bounds) that flag anomalies before the proposal reaches the underwriter. Validate GCP feed freshness and schema completeness at ingest. Surface a provenance trail showing which data version was used in each pricing run.",
    templates: [
      { refId: "SRE-AT-13", title: "Application Dependency & Integration Health Assessment" },
      { refId: "SRE-PB-03", title: "Observability Engineering Playbook" },
      { refId: "ITSM-PB-07", title: "Known Error & Workaround Management Playbook" },
    ],
  },
  H6: {
    direction:
      "Contract-test the EOS → CPH → Salesforce payload schemas end-to-end and register them in a schema registry. Any change to a payload field must pass contract tests in CI before deployment. Monitor upload job completion and alert on failure within minutes.",
    templates: [
      { refId: "SRE-AT-13", title: "Application Dependency & Integration Health Assessment" },
      { refId: "CMDB-PB-05", title: "Service Dependency Mapping Playbook" },
      { refId: "ITSM-PB-05", title: "Change Enablement & Release Management Playbook" },
    ],
  },
  H7: {
    direction:
      "Define user-experience SLOs for EOS in Dynatrace (page-load P95 ≤ 3 s, save P95 ≤ 2 s) and alert when they breach. Load-test EOS at 90th-percentile concurrent underwriter sessions. Identify and remediate the top three resource contention sources on the shared AKS cluster.",
    templates: [
      { refId: "SRE-AT-06", title: "Performance, Load & Capacity Readiness Assessment" },
      { refId: "SRE-PB-06", title: "Performance & Capacity Engineering Playbook" },
      { refId: "SLO-T", title: "SLO Document Template" },
      { refId: "SRE-AT-03", title: "Observability Coverage & Instrumentation Assessment" },
    ],
  },
  H8: {
    direction:
      "Move proposal report generation to an async job queue with a completion webhook. Monitor job success rate, duration P95, and queue depth. Alert the operations team if a report job is still running 10 minutes before the proposal due date.",
    templates: [
      { refId: "SRE-AT-03", title: "Observability Coverage & Instrumentation Assessment" },
      { refId: "SRE-PB-03", title: "Observability Engineering Playbook" },
      { refId: "SRE-AT-15", title: "Post-Release Reliability Effectiveness Assessment" },
    ],
  },
};

// ── Architecture per Stage ────────────────────────────────────────────────────

export const STAGE_ARCH: Record<number, StageArch> = {
  1: {
    areas: ["A1", "A6"],
    components: ["Salesforce", "Salesforce → CPT Integration"],
    exposures: [
      { text: "No monitoring of Salesforce → CPT sync failures", confidence: "obs" },
      { text: "Proposal due-date field not propagated downstream at intake", confidence: "obs" },
    ],
  },
  2: {
    areas: ["A1", "A6"],
    components: ["CPT (Pega on AWS)", "CPT → IRF task sync"],
    exposures: [
      { text: "Approver = Assignee allowed in CPT — no separation of duties", confidence: "obs" },
      { text: "CPT task sync to IRF unreliable with no detection or alerting", confidence: "obs" },
      { text: "No stuck-task detection or escalation path in CPT", confidence: "obs" },
    ],
  },
  3: {
    areas: ["A2", "A5"],
    components: ["EOS UI (Angular / AKS)", "EOS API"],
    exposures: [
      { text: "EOS has no UX SLOs defined or monitored in Dynatrace", confidence: "obs" },
      { text: "EOS save/refresh degrades under concurrent underwriter load", confidence: "obs" },
      { text: "Underwriter assumptions entered manually with no reasonableness checks", confidence: "hyp" },
    ],
  },
  4: {
    areas: ["A2", "A5", "A6"],
    components: ["EOS API", "AFP microservices", "IRF Function App"],
    exposures: [
      { text: "AFP request schema has no server-side input validation", confidence: "obs" },
      { text: "No completion SLO or stuck-job detection on EOS → AFP → IRF path", confidence: "obs" },
      { text: "Every revision triggers a full re-run from this stage — no incremental path", confidence: "obs" },
    ],
  },
  5: {
    areas: ["A2", "A6"],
    components: ["AFP routing logic", "CPT / IRF task creation"],
    exposures: [
      { text: "Custom formulary path adds a manual handoff to Rebate Analyst", confidence: "obs" },
      { text: "No automated detection if AFP routing decision is incorrect", confidence: "hyp" },
    ],
  },
  6: {
    areas: ["A2", "A5", "A6"],
    components: ["IRF Function App", "Rate / shift tables"],
    exposures: [
      { text: "UWT tasks don't always appear in IRF — observed gap with no alerting", confidence: "obs" },
      { text: "Rate and shift logic depends on manual table setup with no validation gate", confidence: "obs" },
      { text: "Forecast review jobs queue under concurrent submissions", confidence: "obs" },
    ],
  },
  7: {
    areas: ["A3", "A4", "A5", "A6"],
    components: ["DFM API", "Azure Data Factory", "Databricks clusters", "ADLS", "GCP feeds"],
    exposures: [
      { text: "No admission control on DFM — heavy jobs starve concurrent lighter jobs", confidence: "obs" },
      { text: "14-module sequential pipeline with no checkpoint or resume capability", confidence: "gap" },
      { text: "No DFM API error-rate alerting configured in Dynatrace", confidence: "gap" },
      { text: "GCP → Azure data ingestion has no freshness SLA or completeness check", confidence: "gap" },
      { text: "Per-request Databricks cluster startup adds significant cold-start latency", confidence: "obs" },
      { text: "No circuit-breaker pattern if ADLS feeds are stale", confidence: "gap" },
      { text: "Data migration correctness not validated on ingest into ADLS", confidence: "gap" },
    ],
  },
  8: {
    areas: ["A3", "A4"],
    components: ["Comp Engine", "DFM output (ADLS)"],
    exposures: [
      { text: "Comp Engine has no fallback if DFM output is unavailable", confidence: "obs" },
      { text: "Pricing logic updated mid-season; prior runs not re-validated against new logic", confidence: "obs" },
      { text: "No regression test suite on Comp Engine pricing calculations", confidence: "gap" },
    ],
  },
  9: {
    areas: ["A2", "A3", "A4"],
    components: ["EOS financial modules", "Comp Engine output"],
    exposures: [
      { text: "Reruns do not reproduce prior results — input versioning absent", confidence: "obs" },
      { text: "No explain or audit view for financial model outputs", confidence: "obs" },
    ],
  },
  10: {
    areas: ["A1", "A2"],
    components: ["EOS workflow engine", "Approval queue"],
    exposures: [
      { text: "Approver queue grows at peak with no escalation path or SLA", confidence: "obs" },
      { text: "No deal due-date visibility in EOS for approvers", confidence: "obs" },
    ],
  },
  11: {
    areas: ["A2", "A6"],
    components: ["EOS report generator", "CPH upload service", "Salesforce upload"],
    exposures: [
      { text: "EOS → CPH → Salesforce payload schemas not contract-tested end-to-end", confidence: "obs" },
      { text: "Report generation is synchronous; no async offloading near deadline", confidence: "obs" },
      { text: "Generated proposal can differ from approved EOS model", confidence: "obs" },
    ],
  },
  12: {
    areas: ["A1", "A6"],
    components: ["Salesforce activation", "AFP write-back"],
    exposures: [
      { text: "AFP write-back not monitored for failure or partial completion", confidence: "obs" },
      { text: "Loss reasons not captured and fed back to improve future modeling", confidence: "obs" },
    ],
  },
};

// Area code labels
export const AREA_LABELS: Record<string, string> = {
  A1: "Business / CRM",
  A2: "Application / Services",
  A3: "Data Platform",
  A4: "Computation",
  A5: "Infrastructure",
  A6: "Integration / Handoffs",
  A7: "Security / Governance",
  A8: "Observability",
};

// ── Handoffs ─────────────────────────────────────────────────────────────────

export const HANDOFFS: JourneyHandoffRecord[] = [
  { fromStage: 1,  toStage: 2,  name: "Salesforce → CPT",           type: "API integration",                   status: "Not established" },
  { fromStage: 2,  toStage: 3,  name: "CPT → EOS / IRF tasks",       type: "Workflow and opportunity context",   status: "Gap observed" },
  { fromStage: 4,  toStage: 5,  name: "EOS → AFP",                   type: "API request routing",               status: "Partial" },
  { fromStage: 5,  toStage: 6,  name: "AFP → IRF (custom path)",     type: "Conditional routing, CPT task",     status: "Not established" },
  { fromStage: 6,  toStage: 7,  name: "IRF → ADLS → DFM trigger",   type: "Shared data, Function App trigger", status: "Not monitored" },
  { fromStage: 5,  toStage: 7,  name: "EOS / AFP → DFM API",         type: "Payload and schema validation",     status: "Partial" },
  { fromStage: 7,  toStage: 7,  name: "Data Factory → Databricks",   type: "Pipeline orchestration",            status: "Partial (email)" },
  { fromStage: 7,  toStage: 7,  name: "GCP → Azure (EDP feeds)",     type: "Federated data ingestion",          status: "Not established" },
  { fromStage: 7,  toStage: 8,  name: "DFM → Comp Engine",           type: "Shared forecast outputs (ADLS)",   status: "Not established" },
  { fromStage: 8,  toStage: 9,  name: "Comp Engine → EOS",           type: "Financial results",                 status: "Partial" },
  { fromStage: 11, toStage: 11, name: "EOS → CPH → Salesforce",      type: "Upload and integration",            status: "Not established" },
];

// ── Controls ─────────────────────────────────────────────────────────────────

export const CONTROLS: ControlRecord[] = [
  {
    id: "INT-001", stages: [4, 7], component: "EOS API / DFM API",
    question: "Are invalid request combinations rejected before they reach the pipeline?",
    assessmentRef: "SRE-AT-13", evidence: "API schema, validation tests",
    status: "Documented gap", priority: "P0", owner: "EOS + DFM engineering", riskId: "R2",
  },
  {
    id: "INT-002", stages: [6, 7], component: "IRF Function App → DFM",
    question: "Is formulary output with no corresponding DFM run detected and alerted?",
    assessmentRef: "SRE-AT-13; CMDB-AT-12", evidence: "Function logs, Data Factory run records",
    status: "Documented gap", priority: "P0", owner: "IRF engineering", riskId: "R2",
  },
  {
    id: "CAP-001", stages: [7], component: "Data Factory / Databricks",
    question: "Is concurrent forecast capacity controlled to prevent job starvation?",
    assessmentRef: "SRE-AT-06", evidence: "Cluster quotas, peak-load measurements",
    status: "Documented gap", priority: "P0", owner: "DFM engineering", riskId: "R2",
  },
  {
    id: "REC-001", stages: [7], component: "DFM pipeline",
    question: "Can an interrupted DFM run resume from a checkpoint without full restart?",
    assessmentRef: "SRE-AT-05", evidence: "Recovery design, replay tests",
    status: "Documented gap", priority: "P0", owner: "DFM engineering", riskId: "R1",
  },
  {
    id: "MON-001", stages: [7], component: "DFM API / Databricks",
    question: "Do DFM API error rates page support before underwriters notice failures?",
    assessmentRef: "SRE-AT-03", evidence: "Alert rules, paging tests",
    status: "Documented gap", priority: "P0", owner: "DFM engineering + Observability", riskId: "R2",
  },
  {
    id: "DATA-001", stages: [6, 7], component: "ADLS / GCP feeds",
    question: "Are source data freshness and completeness validated on ingest?",
    assessmentRef: "SRE-AT-13", evidence: "Ingestion checks, schema versions",
    status: "Not assessed", priority: "P0", owner: "DFM engineering + EDP", riskId: "R5",
  },
  {
    id: "CALC-001", stages: [7, 8], component: "DFM modules / Comp Engine",
    question: "Are critical pricing calculations regression-tested before each release?",
    assessmentRef: "SRE-AT-12", evidence: "Regression suite, release results",
    status: "Not assessed", priority: "P0", owner: "DFM + Comp Engine teams", riskId: "R5",
  },
  {
    id: "DATA-002", stages: [8, 9], component: "EOS / Comp Engine",
    question: "Are model inputs and pricing outputs versioned and diff-able across runs?",
    assessmentRef: "SRE-AT-02", evidence: "Run metadata, version history",
    status: "Not assessed", priority: "P0", owner: "EOS + Comp Engine teams", riskId: "R1",
  },
  {
    id: "WF-001", stages: [2, 5, 6], component: "CPT / IRF",
    question: "Are failed workflow handoffs and stuck tasks detected and escalated?",
    assessmentRef: "SRE-AT-08", evidence: "Workflow events, reconciliation records",
    status: "Not assessed", priority: "P1", owner: "CPT team + IRF engineering", riskId: "R4",
  },
  {
    id: "PERF-001", stages: [3, 9], component: "EOS on shared AKS",
    question: "Is EOS performance validated under expected peak concurrent load?",
    assessmentRef: "SRE-AT-06", evidence: "Load-test results, Dynatrace data",
    status: "Not assessed", priority: "P1", owner: "EOS engineering", riskId: "H7",
  },
  {
    id: "SYN-001", stages: [1, 2], component: "Salesforce → CPT",
    question: "Are proposal due dates propagated and monitored across systems?",
    assessmentRef: "ITSM-AT-06", evidence: "Field mappings, event logs",
    status: "Not assessed", priority: "P1", owner: "Integration team", riskId: "R3",
  },
  {
    id: "MON-002", stages: [11], component: "EOS report generator",
    question: "Are report-generation jobs monitored for failure and duration?",
    assessmentRef: "SRE-AT-03", evidence: "Job logs, alerting rules",
    status: "Not assessed", priority: "P1", owner: "EOS engineering", riskId: "H8",
  },
  {
    id: "INT-003", stages: [11], component: "EOS → CPH → Salesforce",
    question: "Are upload payload schemas contract-tested end-to-end?",
    assessmentRef: "SRE-AT-13", evidence: "Contract tests, schema registry",
    status: "Not assessed", priority: "P1", owner: "EOS + CPH + Salesforce teams", riskId: "H6",
  },
  {
    id: "REP-001", stages: [12], component: "AFP write-back",
    question: "Is AFP write-back success monitored and failures alerted?",
    assessmentRef: "SRE-AT-03", evidence: "Job alerts, reconciliation records",
    status: "Not assessed", priority: "P1", owner: "AFP engineering", riskId: "H6",
  },
];
