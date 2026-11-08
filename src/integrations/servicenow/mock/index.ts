/**
 * MockServiceNowAdapter — returns seeded data.
 * Used when VITE_DATA_MODE=mock (default).
 */

import type { ServiceNowAdapter, PaginatedResult, IncidentQuery } from "../client";
import type { Incident } from "@/domain/incidents";
import type { Problem, ProblemTask, Change } from "@/domain/remediation";
import { MOCK_INCIDENTS } from "@/data/mock/incidents";

function paginate<T>(items: T[], query: { limit?: number; cursor?: string }): PaginatedResult<T> {
  const limit = query.limit ?? 25;
  const offset = query.cursor ? parseInt(query.cursor, 10) : 0;
  const slice = items.slice(offset, offset + limit);
  return {
    items: slice,
    total: items.length,
    hasMore: offset + limit < items.length,
    nextCursor: offset + limit < items.length ? String(offset + limit) : undefined,
  };
}

export const MockServiceNowAdapter: ServiceNowAdapter = {
  async getIncidents(query: IncidentQuery): Promise<PaginatedResult<Incident>> {
    let items = [...MOCK_INCIDENTS];
    if (query.applicationId) {
      items = items.filter((i) => i.applicationId === query.applicationId);
    }
    if (query.priority) {
      items = items.filter((i) => i.priority === query.priority);
    }
    if (query.riskId) {
      items = items.filter((i) => i.relatedRiskId === query.riskId);
    }
    if (query.stageId) {
      items = items.filter((i) => i.reportedStageId === query.stageId);
    }
    return paginate(items, query);
  },

  async getIncident(id: string): Promise<Incident | null> {
    return MOCK_INCIDENTS.find((i) => i.id === id) ?? null;
  },

  async getProblems(): Promise<PaginatedResult<Problem>> {
    return { items: [], total: 0, hasMore: false };
  },

  async getProblem(): Promise<Problem | null> {
    return null;
  },

  async getChanges(): Promise<PaginatedResult<Change>> {
    return { items: [], total: 0, hasMore: false };
  },

  async getChange(): Promise<Change | null> {
    return null;
  },

  async getProblemTasks(): Promise<PaginatedResult<ProblemTask>> {
    return { items: [], total: 0, hasMore: false };
  },
};
