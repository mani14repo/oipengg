/**
 * ServiceNow API client interface.
 * All calls go through the BFF server — never called directly from the browser.
 */

import type { Incident } from "@/domain/incidents";
import type { Problem, ProblemTask, Change } from "@/domain/remediation";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface IncidentQuery {
  applicationId?: string;
  cmdbCiId?: string;
  assignmentGroup?: string;
  priority?: string;
  state?: string;
  openedAfter?: string;
  openedBefore?: string;
  limit?: number;
  cursor?: string;
  riskId?: string;
  stageId?: number;
}

export interface ProblemQuery {
  applicationId?: string;
  state?: string;
  limit?: number;
  cursor?: string;
}

export interface ProblemTaskQuery {
  problemId?: string;
  state?: string;
  limit?: number;
}

export interface ChangeQuery {
  relatedProblemId?: string;
  state?: string;
  limit?: number;
}

export interface ServiceNowAdapter {
  getIncidents(query: IncidentQuery): Promise<PaginatedResult<Incident>>;
  getIncident(id: string): Promise<Incident | null>;
  getProblems(query: ProblemQuery): Promise<PaginatedResult<Problem>>;
  getProblem(id: string): Promise<Problem | null>;
  getChanges(query: ChangeQuery): Promise<PaginatedResult<Change>>;
  getChange(id: string): Promise<Change | null>;
  getProblemTasks(query: ProblemTaskQuery): Promise<PaginatedResult<ProblemTask>>;
}
