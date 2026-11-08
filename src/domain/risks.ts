export type RiskSeverity = "critical" | "high" | "medium" | "low" | "unknown";
export type RiskConfidence = "confirmed" | "probable" | "hypothesized" | "unknown";

export interface RiskAssessment {
  riskId: string;
  name: string;
  category: string;
  severity: RiskSeverity;
  confidence: RiskConfidence;
  observedIncidentCount: number;
  businessImpact?: string;
  architectureExposure?: string;
  evidenceCoverage?: number;
  relatedControlIds: string[];
  affectedStageIds: number[];
  affectedComponentIds: string[];
  description: string;
  isOverlapping?: boolean;
  analysisPeriod: string;
}
