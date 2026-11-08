export type ToilSource =
  | "time_worked"
  | "time_card"
  | "work_notes"
  | "engineering_estimate"
  | "unknown";

export interface ToilMetric {
  activityId: string;
  stageId: number;
  componentId?: string;
  category: string;
  description: string;
  occurrenceCount: number;
  averageManualMinutes?: number;
  recordedHours?: number;
  estimatedHours?: number;
  source: ToilSource;
  confidence: "high" | "medium" | "low" | "unknown";
  automationCandidate: boolean;
  suggestedOwner?: string;
  estimatedSavingsHours?: number;
  verifiedSavingsHours?: number;
}

export const TOIL_CATEGORIES = [
  "Manual alert triage",
  "Incident investigation",
  "Reassignment and coordination",
  "Manual recovery",
  "Forecast reruns",
  "Manual workflow corrections",
  "Repetitive data validation",
  "Change administration",
] as const;
