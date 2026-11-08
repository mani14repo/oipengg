export type IncidentPriority = "P1" | "P2" | "P3" | "P4" | "P5";
export type IncidentState =
  | "new"
  | "in_progress"
  | "on_hold"
  | "resolved"
  | "closed"
  | "canceled";

export interface Incident {
  id: string;
  number: string;
  shortDescription: string;
  priority: IncidentPriority;
  state: IncidentState;
  assignmentGroup?: string;
  applicationId?: string;
  cmdbCiId?: string;
  reportedStageId?: number;
  potentialComponentIds: string[];
  relatedRiskId?: string;
  relatedProblemId?: string;
  openedAt: string;
  resolvedAt?: string;
  reportedSymptom: string;
  rootCauseConfirmed: boolean;
  rootCauseDescription?: string;
  evidenceOfManualRecovery: boolean;
  origin: "user_reported" | "monitoring" | "unknown";
  workNotesSummary?: string;
}

export interface IncidentCluster {
  id: string;
  label: string;
  status: "suggested" | "sme_validated" | "confirmed_common_cause";
  incidentIds: string[];
  commonPattern?: string;
  potentialCause?: string;
}

export interface IncidentTrend {
  period: string;
  count: number;
  byPriority: Partial<Record<IncidentPriority, number>>;
  byApplication: Record<string, number>;
}
