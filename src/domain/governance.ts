export type ArtifactType =
  | "rca_playbook"
  | "oip"
  | "assessment"
  | "standard"
  | "policy";

export type ArtifactStatus = "draft" | "active" | "in_review" | "superseded";

export interface GovernanceArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  documentRef: string;
  version: string;
  status: ArtifactStatus;
  owner: string;
  description: string;
  applicableRiskIds: string[];
  applicableProblemIds: string[];
  applicableStageIds: number[];
  keyActions: string[];
  dueDate?: string;
  lastReviewed?: string;
  priority?: "critical" | "high" | "medium" | "low";
}

export interface ActionableMapping {
  actionableId: string;
  actionableType: "risk" | "problem" | "toil";
  artifactIds: string[];
  gapNotes?: string;
}
