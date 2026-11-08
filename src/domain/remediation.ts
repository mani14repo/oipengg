export type ProblemState =
  | "open"
  | "known_error"
  | "in_progress"
  | "resolved"
  | "closed";

export type ChangeType = "normal" | "standard" | "emergency";
export type ChangeState = "new" | "assess" | "authorize" | "scheduled" | "implement" | "review" | "closed";

export interface Problem {
  id: string;
  number: string;
  shortDescription: string;
  state: ProblemState;
  assignmentGroup?: string;
  relatedIncidentIds: string[];
  relatedComponentIds: string[];
  rootCause?: string;
  rootCauseConfirmed: boolean;
  openedAt: string;
  resolvedAt?: string;
  workaround?: string;
}

export interface ProblemTask {
  id: string;
  number: string;
  problemId: string;
  shortDescription: string;
  state: "open" | "in_progress" | "closed";
  assignedTo?: string;
  targetDate?: string;
  completedDate?: string;
  correctiveAction?: string;
}

export interface Change {
  id: string;
  number: string;
  type: ChangeType;
  state: ChangeState;
  shortDescription: string;
  relatedProblemIds: string[];
  relatedComponentIds: string[];
  implementedAt?: string;
  validationStatus?: "pending" | "validated" | "not_validated";
  postFixIncidentCount?: number;
  preFixIncidentCount?: number;
}

export interface CorrectiveAction {
  id: string;
  problemId?: string;
  changeId?: string;
  description: string;
  owner?: string;
  targetDate?: string;
  completedDate?: string;
  validationEvidence?: string;
  externalTracker?: string;
  externalTrackerId?: string;
}

export interface EntityRelationship {
  id: string;
  sourceType:
    | "stage"
    | "component"
    | "risk"
    | "incident"
    | "problem"
    | "change"
    | "control";
  sourceId: string;
  targetType:
    | "stage"
    | "component"
    | "risk"
    | "incident"
    | "problem"
    | "change"
    | "control";
  targetId: string;
  relationshipType:
    | "supports"
    | "depends_on"
    | "observed_at"
    | "reported_against"
    | "potentially_related_to"
    | "confirmed_root_cause"
    | "remediated_by"
    | "validated_by";
  confidence: "confirmed" | "inferred" | "unknown";
  evidenceIds: string[];
}
