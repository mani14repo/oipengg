export type DataStatus = "validated" | "provisional" | "degraded" | "unavailable";
export type SliType =
  | "availability"
  | "success_rate"
  | "latency"
  | "completion"
  | "business_outcome";

export interface ReliabilityMetric {
  id: string;
  scopeType: "component" | "handoff" | "journey";
  scopeId: string;
  sliType: SliType;
  numerator?: number;
  denominator?: number;
  actualValue?: number;
  sloTarget?: number;
  errorBudgetConsumed?: number;
  measurementStart: string;
  measurementEnd: string;
  evidenceCoverage?: number;
  dataStatus: DataStatus;
  missingDataReason?:
    | "no_telemetry"
    | "no_attribution"
    | "incomplete_transactions"
    | "no_monitoring"
    | "not_applicable";
}

export interface SloDefinition {
  id: string;
  scopeId: string;
  sliType: SliType;
  target: number;
  window: string;
  status: "approved" | "proposed" | "draft";
}
