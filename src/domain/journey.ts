export type JourneyLens =
  | "business"
  | "risks"
  | "incidents"
  | "architecture"
  | "handoffs"
  | "toil"
  | "reliability"
  | "remediation";

export type ReliabilityStatus =
  | "healthy"
  | "degraded"
  | "critical"
  | "unknown"
  | "not_instrumented"
  | "insufficient_evidence";

export interface JourneyStage {
  id: number;
  name: string;
  primarySystem: string;
  actor: string;
  businessPurpose: string;
  archLayer: string;
  riskIds: string[];
  incidentCount: number;
  openProblemCount: number;
  reliability: ReliabilityStatus;
  telemetryConfidence: "high" | "medium" | "low" | "unknown";
  hasHandoffWarning: boolean;
  componentIds: string[];
  description: string;
  expectedOutput: string;
  potentialDownstreamImpact?: string;
}

export interface JourneyHandoff {
  id: string;
  sourceStageId: number;
  targetStageId: number;
  sourceComponentId: string;
  targetComponentId: string;
  handoffType: "api" | "data" | "human" | "workflow" | "batch" | "approval";
  trigger: string;
  expectedOutput: string;
  retrySupported?: boolean;
  idempotent?: boolean;
  reconciliationAvailable?: boolean;
  observedFailures?: number;
  latencyMs?: number;
  monitoringStatus: "instrumented" | "partial" | "unknown";
  evidenceIds: string[];
  potentialRisks: string[];
  recommendedControls: string[];
}

export interface JourneyPath {
  id: string;
  name: string;
  stageIds: number[];
  condition?: string;
}
