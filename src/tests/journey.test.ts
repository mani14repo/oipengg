import { describe, it, expect } from "vitest";
import { JOURNEY_STAGES, JOURNEY_HANDOFFS } from "@/data/pumaJourney";
import { RISK_CATALOG } from "@/data/riskCatalog";

describe("PUMA Journey Data", () => {
  it("has exactly 12 journey stages", () => {
    expect(JOURNEY_STAGES).toHaveLength(12);
  });

  it("stages have sequential IDs 1–12", () => {
    const ids = JOURNEY_STAGES.map((s) => s.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("every stage has a name, primarySystem, and actor", () => {
    for (const stage of JOURNEY_STAGES) {
      expect(stage.name).toBeTruthy();
      expect(stage.primarySystem).toBeTruthy();
      expect(stage.actor).toBeTruthy();
    }
  });

  it("handoffs reference valid stage IDs", () => {
    const stageIds = new Set(JOURNEY_STAGES.map((s) => s.id));
    for (const handoff of JOURNEY_HANDOFFS) {
      expect(stageIds.has(handoff.sourceStageId)).toBe(true);
      expect(stageIds.has(handoff.targetStageId)).toBe(true);
    }
  });

  it("every risk has an ID, name, and incident count", () => {
    for (const risk of RISK_CATALOG) {
      expect(risk.riskId).toBeTruthy();
      expect(risk.name).toBeTruthy();
      expect(risk.observedIncidentCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("R3 is correctly flagged as overlapping", () => {
    const r3 = RISK_CATALOG.find((r) => r.riskId === "R3");
    expect(r3?.isOverlapping).toBe(true);
  });

  it("non-overlapping risk incident total is within expected range", () => {
    const total = RISK_CATALOG.filter((r) => !r.isOverlapping).reduce(
      (acc, r) => acc + r.observedIncidentCount,
      0
    );
    // Jul–Oct 2026 analysis period: ~209 non-overlapping incidents
    expect(total).toBeGreaterThan(100);
    expect(total).toBeLessThan(500);
  });

  it("Stage 7 (Forecast Creation) has the highest incident count", () => {
    const stage7 = JOURNEY_STAGES.find((s) => s.id === 7)!;
    const otherMax = Math.max(...JOURNEY_STAGES.filter((s) => s.id !== 7).map((s) => s.incidentCount));
    expect(stage7.incidentCount).toBeGreaterThan(otherMax);
  });
});
