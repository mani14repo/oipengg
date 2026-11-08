import type { RiskAssessment } from "@/domain/risks";

export const RISK_CATALOG: RiskAssessment[] = [
  {
    riskId: "R5",
    name: "Pricing / Data Correctness Concerns",
    category: "Data Quality",
    severity: "critical",
    confidence: "probable",
    observedIncidentCount: 151,
    businessImpact:
      "Potential for inaccurate pricing proposals delivered to clients. Trust erosion with underwriters and management.",
    architectureExposure:
      "Multi-stage data pipeline from GCP EDP → ADLS → DFM → Comp Engine introduces multiple transformation points where data quality issues can occur.",
    evidenceCoverage: 60,
    relatedControlIds: ["DQ-001", "REC-003"],
    affectedStageIds: [7, 8, 9, 10, 11],
    affectedComponentIds: ["gcp-edp", "adls", "dfm-api", "comp-engine", "eos-reports"],
    description:
      "Incidents suggesting pricing discrepancies, data integrity issues, and calculation trust concerns. Includes suspected discrepancies and inquiries, not only confirmed defects.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "R2",
    name: "Forecast / Processing Failures",
    category: "Platform Reliability",
    severity: "critical",
    confidence: "confirmed",
    observedIncidentCount: 64,
    businessImpact:
      "Blocked underwriting cycle. Missed pricing deadlines. Rerun amplification consuming engineering capacity.",
    architectureExposure:
      "DFM 14-module sequential pipeline with no checkpoints, per-request Databricks clusters, and no admission control creates cascading failure risk.",
    evidenceCoverage: 75,
    relatedControlIds: ["CAP-001", "REC-001"],
    affectedStageIds: [7, 8],
    affectedComponentIds: ["dfm-api", "adf", "databricks", "adls"],
    description:
      "Processing requests failing, stuck, or timing out in DFM pipeline. Includes capacity constraints, pipeline execution failures, and queuing issues.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "H7",
    name: "EOS UI Availability / Performance",
    category: "User Experience",
    severity: "high",
    confidence: "confirmed",
    observedIncidentCount: 31,
    businessImpact:
      "Underwriter productivity loss. Delayed model configuration and scenario review. User satisfaction degradation.",
    architectureExposure:
      "Angular UI on shared AKS with API latency sensitivity. Concurrent modeling load creates resource contention.",
    evidenceCoverage: 65,
    relatedControlIds: ["PERF-001"],
    affectedStageIds: [3, 9, 10],
    affectedComponentIds: ["eos-ui", "eos-api"],
    description:
      "EOS UI experiencing slow screen loads, timeouts, and concurrency issues under moderate-to-high underwriter load.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "R1",
    name: "Revision / Rerun Amplification",
    category: "Process Efficiency",
    severity: "high",
    confidence: "probable",
    observedIncidentCount: 26,
    businessImpact:
      "Engineering capacity consumed by reruns. DFM queue saturation. Cascading delays to other underwriting cases.",
    architectureExposure:
      "DFM full-restart requirement means every revision requiring parameter changes triggers a full pipeline rerun. No checkpoint restart available.",
    evidenceCoverage: 55,
    relatedControlIds: ["CAP-001", "REC-001"],
    affectedStageIds: [9, 7, 10],
    affectedComponentIds: ["dfm-api", "databricks"],
    description:
      "Management revisions triggering full DFM reruns, amplifying forecast processing demand and creating cascading queue pressure.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "H9",
    name: "Functional Gaps / How-to",
    category: "Operational Knowledge",
    severity: "medium",
    confidence: "confirmed",
    observedIncidentCount: 24,
    businessImpact:
      "Underwriter and analyst productivity loss. ServiceNow queue consumption for how-to requests.",
    architectureExposure:
      "Reflects knowledge gaps and functional support demand, not necessarily technical failures.",
    evidenceCoverage: 80,
    relatedControlIds: [],
    affectedStageIds: [3, 6, 9],
    affectedComponentIds: ["eos-ui", "irf-ui"],
    description:
      "Service requests, usage questions, and functional support demand captured as incidents. Includes how-to support and data request patterns.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "R4",
    name: "Workflow / Handoff Bottlenecks",
    category: "Process Efficiency",
    severity: "high",
    confidence: "probable",
    observedIncidentCount: 23,
    businessImpact:
      "Delayed underwriting assignment and approval. Queue management overhead. Deadline pressure amplification.",
    architectureExposure:
      "Manual handoffs and queue management between Salesforce, CPT, and EOS create friction points with limited automation.",
    evidenceCoverage: 50,
    relatedControlIds: [],
    affectedStageIds: [1, 2, 4, 10],
    affectedComponentIds: ["salesforce", "cpt", "afp"],
    description:
      "Manual handoff delays, access/permission issues, and workflow queue management problems in CPT and cross-system transitions.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "H6",
    name: "Integration Handoff Failures",
    category: "Integration Reliability",
    severity: "high",
    confidence: "probable",
    observedIncidentCount: 21,
    businessImpact:
      "Custom formulary processing failures blocking DFM execution. Silent failures requiring manual investigation.",
    architectureExposure:
      "IRF-to-DFM boundary lacks monitoring, acknowledgment, and retry controls. ADLS handoff creates data dependency.",
    evidenceCoverage: 45,
    relatedControlIds: ["REC-002"],
    affectedStageIds: [5, 6, 7],
    affectedComponentIds: ["irf-python", "adls", "dfm-api", "adf"],
    description:
      "DFM trigger issues and ADLS handoff failures at the IRF-DFM boundary. Integration points lack sufficient observability.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "H8",
    name: "Report / Proposal Output Failures",
    category: "Output Reliability",
    severity: "medium",
    confidence: "probable",
    observedIncidentCount: 11,
    businessImpact:
      "Delayed proposal delivery. Missing or incorrect client deliverables. Sales cycle disruption.",
    architectureExposure:
      "EOS reporting and CPH depend on accurate upstream data from Comp Engine and ADLS.",
    evidenceCoverage: 55,
    relatedControlIds: [],
    affectedStageIds: [11],
    affectedComponentIds: ["eos-reports", "cph"],
    description:
      "Missing or delayed reports, output generation errors, and proposal creation failures.",
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
  {
    riskId: "R3",
    name: "Missed Due Dates / Deadline Pressure",
    category: "Process",
    severity: "medium",
    confidence: "probable",
    observedIncidentCount: 8,
    businessImpact: "Client satisfaction risk. SLA violations. Competitive proposal timing impact.",
    architectureExposure: "Overlapping risk — deadline pressure compounds other failures across the journey.",
    evidenceCoverage: 40,
    relatedControlIds: [],
    affectedStageIds: [2, 7, 10, 11],
    affectedComponentIds: [],
    description:
      "Incidents representing deadline-related escalations. Overlapping indicator — not counted in mutually exclusive category totals.",
    isOverlapping: true,
    analysisPeriod: "Jul 1 – Oct 30, 2026",
  },
];
