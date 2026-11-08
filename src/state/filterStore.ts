import { create } from "zustand";

interface FilterState {
  dateFrom: string;
  dateTo: string;
  environment: string;
  applicationId: string;
  priority: string;
  dataStatus: string;

  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  setEnvironment: (v: string) => void;
  setApplicationId: (v: string) => void;
  setPriority: (v: string) => void;
  setDataStatus: (v: string) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  dateFrom: "2026-07-01",
  dateTo: "2026-10-30",
  environment: "production",
  applicationId: "",
  priority: "",
  dataStatus: "",
};

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULT_FILTERS,
  setDateFrom: (v) => set({ dateFrom: v }),
  setDateTo: (v) => set({ dateTo: v }),
  setEnvironment: (v) => set({ environment: v }),
  setApplicationId: (v) => set({ applicationId: v }),
  setPriority: (v) => set({ priority: v }),
  setDataStatus: (v) => set({ dataStatus: v }),
  resetFilters: () => set(DEFAULT_FILTERS),
}));
