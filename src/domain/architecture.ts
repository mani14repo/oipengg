export type ArchitectureDomain =
  | "business-workflow"
  | "user-experience"
  | "api-orchestration"
  | "formulary-processing"
  | "data-integration"
  | "forecasting-compute"
  | "financial-calculation"
  | "reliability-operations";

export type CloudProvider = "azure" | "aws" | "gcp" | "on-prem" | "multi";

export interface ArchitectureComponent {
  id: string;
  name: string;
  shortName: string;
  domain: ArchitectureDomain;
  technology: string[];
  cloudProvider: CloudProvider;
  hosting?: string;
  dependencies: string[];
  supportedStageIds: number[];
  riskIds: string[];
  knownLimitations: string[];
  reliabilityControls: string[];
  evidenceIds: string[];
  description: string;
}

export interface ArchitectureDependency {
  id: string;
  sourceId: string;
  targetId: string;
  type: "sync" | "async" | "data" | "event" | "batch";
  protocol?: string;
  criticality: "critical" | "high" | "medium" | "low";
}

export interface ArchitectureIssue {
  id: string;
  componentId: string;
  title: string;
  category:
    | "recoverability"
    | "observability"
    | "scalability"
    | "reliability"
    | "data-quality"
    | "security"
    | "performance";
  description: string;
  sourceType: "engineering_document" | "incident_analysis" | "assessment" | "inferred";
  evidenceStatus: "documented" | "probable" | "hypothesized" | "unverified";
  associatedRiskIds: string[];
  recommendedControlIds: string[];
  remediationStatus: "not_started" | "in_progress" | "completed" | "not_verified";
}

export interface ArchitectureHotspot {
  id: string;
  name: string;
  componentIds: string[];
  exposures: string[];
  recommendedControls: string[];
  severity: "critical" | "high" | "medium";
  description: string;
}
