import { create } from "zustand";
import type { JourneyLens } from "@/domain/journey";

interface JourneyState {
  selectedStageId: number | null;
  selectedComponentId: string | null;
  selectedRiskId: string | null;
  selectedHandoffId: string | null;
  selectedIncidentId: string | null;
  activeLens: JourneyLens;
  explorationLevel: 1 | 2 | 3;
  viewMode: "executive" | "engineering";
  pinnedItems: Array<{ type: string; id: string; label: string }>;

  selectStage: (id: number | null) => void;
  selectComponent: (id: string | null) => void;
  selectRisk: (id: string | null) => void;
  selectHandoff: (id: string | null) => void;
  selectIncident: (id: string | null) => void;
  setLens: (lens: JourneyLens) => void;
  setExplorationLevel: (level: 1 | 2 | 3) => void;
  setViewMode: (mode: "executive" | "engineering") => void;
  pinItem: (type: string, id: string, label: string) => void;
  unpinItem: (id: string) => void;
  clearSelection: () => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  selectedStageId: null,
  selectedComponentId: null,
  selectedRiskId: null,
  selectedHandoffId: null,
  selectedIncidentId: null,
  activeLens: "business",
  explorationLevel: 1,
  viewMode: "executive",
  pinnedItems: [],

  selectStage: (id) =>
    set({ selectedStageId: id, selectedComponentId: null, explorationLevel: id !== null ? 2 : 1 }),
  selectComponent: (id) => set({ selectedComponentId: id, explorationLevel: id !== null ? 3 : 2 }),
  selectRisk: (id) => set({ selectedRiskId: id }),
  selectHandoff: (id) => set({ selectedHandoffId: id }),
  selectIncident: (id) => set({ selectedIncidentId: id }),
  setLens: (lens) => set({ activeLens: lens }),
  setExplorationLevel: (level) => set({ explorationLevel: level }),
  setViewMode: (mode) => set({ viewMode: mode }),
  pinItem: (type, id, label) =>
    set((s) => ({
      pinnedItems: s.pinnedItems.some((p) => p.id === id)
        ? s.pinnedItems
        : [...s.pinnedItems, { type, id, label }],
    })),
  unpinItem: (id) =>
    set((s) => ({ pinnedItems: s.pinnedItems.filter((p) => p.id !== id) })),
  clearSelection: () =>
    set({
      selectedStageId: null,
      selectedComponentId: null,
      selectedRiskId: null,
      selectedHandoffId: null,
      selectedIncidentId: null,
      explorationLevel: 1,
    }),
}));
