import { ArchitectureExplorer } from "@/components/architecture/ArchitectureExplorer";
import { useJourneyStore } from "@/state/journeyStore";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { Network } from "lucide-react";

export function ArchitecturePage() {
  const { selectedStageId, selectStage } = useJourneyStore();

  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-300 bg-teal-400/15 border border-teal-400/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                <Network size={10} />
                Architecture
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Architecture Explorer</h2>
            <p className="text-sm text-teal-200/70 mt-1">
              Explore components, dependencies, hotspots, and architectural issues. Context preserved from Journey Explorer.
            </p>
          </div>

          {/* Stage context chips */}
          {selectedStageId && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-teal-400/70">Stage filter:</span>
              <button
                onClick={() => selectStage(null)}
                className="text-xs bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-full px-3 py-1 hover:bg-blue-400/30 transition-colors"
              >
                Stage {selectedStageId}: {JOURNEY_STAGES.find((s) => s.id === selectedStageId)?.name} ×
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pt-4 pb-6">
        <ArchitectureExplorer />
      </div>
    </div>
  );
}
