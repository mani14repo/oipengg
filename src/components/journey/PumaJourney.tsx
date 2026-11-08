import { useState } from "react";
import { JourneyStageNode } from "./JourneyStageNode";
import { JourneyLensSelector } from "./JourneyLensSelector";
import { StageDetailPanel } from "./StageDetailPanel";
import { HandoffDetailPanel } from "@/components/handoffs/HandoffDetailPanel";
import { useJourneyStore } from "@/state/journeyStore";
import { JOURNEY_STAGES, JOURNEY_HANDOFFS } from "@/data/pumaJourney";
import { RISK_CATALOG } from "@/data/riskCatalog";
import { cn } from "@/lib/utils";
import { ChevronRight, Info, GitBranch, RotateCcw, ArrowRight } from "lucide-react";

function FlowArrow({ handoffId, hasRisk }: { handoffId?: string; hasRisk: boolean }) {
  const { selectHandoff, selectedHandoffId } = useJourneyStore();
  const isSelected = selectedHandoffId === handoffId;

  return (
    <button
      onClick={handoffId ? () => selectHandoff(isSelected ? null : handoffId) : undefined}
      className={cn(
        "flex items-center justify-center transition-all group",
        handoffId ? "cursor-pointer" : "cursor-default"
      )}
      title={handoffId ? "Click to explore handoff" : undefined}
    >
      <div className="relative flex items-center">
        <div
          className={cn(
            "h-0.5 w-6 transition-all",
            isSelected ? "bg-blue-500" : hasRisk ? "bg-amber-400" : "bg-slate-300",
            handoffId && "group-hover:bg-blue-400"
          )}
        />
        <ChevronRight
          size={14}
          className={cn(
            "transition-all -ml-1",
            isSelected ? "text-blue-500" : hasRisk ? "text-amber-400" : "text-slate-300",
            handoffId && "group-hover:text-blue-400"
          )}
        />
      </div>
    </button>
  );
}

function PathBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", color)}
    >
      {label}
    </span>
  );
}

export function PumaJourney() {
  const {
    selectedStageId,
    selectedHandoffId,
    activeLens,
    selectedComponentId,
    selectStage,
    selectHandoff,
  } = useJourneyStore();

  const selectedStage = JOURNEY_STAGES.find((s) => s.id === selectedStageId);
  const selectedHandoff = JOURNEY_HANDOFFS.find((h) => h.id === selectedHandoffId);

  // Find stages affected by selected component
  const affectedStageIds = selectedComponentId
    ? JOURNEY_STAGES.filter((s) => s.componentIds.includes(selectedComponentId)).map((s) => s.id)
    : [];

  // Standard path stages
  const standardPath = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12];
  const customPath = [5, 6, 7]; // IRF branch

  function getHandoffBetween(fromId: number, toId: number) {
    return JOURNEY_HANDOFFS.find(
      (h) => h.sourceStageId === fromId && h.targetStageId === toId
    );
  }

  function handoffHasRisk(handoff?: ReturnType<typeof getHandoffBetween>) {
    return handoff ? (handoff.observedFailures ?? 0) > 5 : false;
  }

  return (
    <div className="space-y-4">
      {/* Lens selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <JourneyLensSelector />
      </div>

      {/* Journey path legend */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <PathBadge label="Standard Path" color="text-blue-700 border-blue-200 bg-blue-50" />
        <PathBadge label="Custom Formulary Path" color="text-purple-700 border-purple-200 bg-purple-50" />
        <PathBadge label="Revision Loop" color="text-orange-700 border-orange-200 bg-orange-50" />
        <div className="ml-auto flex items-center gap-2 text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-amber-400" />
            <span>Handoff risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-slate-300" />
            <span>Standard flow</span>
          </div>
        </div>
      </div>

      {/* Main journey grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        {/* Stage 1-5: Intake to Formulary Decision */}
        <div className="mb-4">
          <div className="text-xs font-semibold mb-2 flex items-center gap-2 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-300" />
            <span className="uppercase tracking-wide">Intake &amp; Routing</span>
          </div>
          <div className="flex items-start gap-1">
            {[1, 2, 3, 4, 5].map((id, idx) => {
              const stage = JOURNEY_STAGES.find((s) => s.id === id)!;
              const handoff = idx < 4 ? getHandoffBetween(id, [2, 3, 4, 5][idx]) : undefined;
              return (
                <div key={id} className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <JourneyStageNode
                      stage={stage}
                      risks={RISK_CATALOG}
                      isSelected={selectedStageId === id}
                      onClick={() => selectStage(selectedStageId === id ? null : id)}
                      lens={activeLens}
                      isAffectedBySelectedComponent={affectedStageIds.includes(id)}
                    />
                  </div>
                  {idx < 4 && (
                    <FlowArrow
                      handoffId={handoff?.id}
                      hasRisk={handoffHasRisk(handoff)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch: Stage 5 → 6 (Custom) and Stage 5 → 7 (Standard) */}
        <div className="flex gap-4 mb-3">
          {/* Custom formulary branch */}
          <div className="flex-1">
            <div className="text-xs text-purple-500 font-medium mb-2 flex items-center gap-2 ml-2">
              <GitBranch size={12} />
              Custom Formulary Path (IRF)
            </div>
            <div className="flex items-start gap-1 ml-4">
              <div className="flex items-center text-slate-300 mr-1 mt-6">
                <div className="w-4 h-0.5 bg-purple-300" />
                <ChevronRight size={14} className="text-purple-300 -ml-1" />
              </div>
              <div className="flex-1 min-w-0">
                {(() => {
                  const stage = JOURNEY_STAGES.find((s) => s.id === 6)!;
                  return (
                    <JourneyStageNode
                      stage={stage}
                      risks={RISK_CATALOG}
                      isSelected={selectedStageId === 6}
                      onClick={() => selectStage(selectedStageId === 6 ? null : 6)}
                      lens={activeLens}
                      isAffectedBySelectedComponent={affectedStageIds.includes(6)}
                    />
                  );
                })()}
              </div>
              <div className="mt-6">
                <FlowArrow
                  handoffId={getHandoffBetween(6, 7)?.id}
                  hasRisk={handoffHasRisk(getHandoffBetween(6, 7))}
                />
              </div>
            </div>
          </div>

          {/* Stage 7: DFM - shared */}
          <div className="flex-1">
            <div className="text-xs font-semibold mb-2 flex items-center gap-2 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-300" />
              <span className="uppercase tracking-wide">Forecasting</span>
            </div>
            {(() => {
              const stage = JOURNEY_STAGES.find((s) => s.id === 7)!;
              return (
                <JourneyStageNode
                  stage={stage}
                  risks={RISK_CATALOG}
                  isSelected={selectedStageId === 7}
                  onClick={() => selectStage(selectedStageId === 7 ? null : 7)}
                  lens={activeLens}
                  isAffectedBySelectedComponent={affectedStageIds.includes(7)}
                />
              );
            })()}
          </div>
        </div>

        {/* Stage 8-12: Financial calculation through close */}
        <div>
          <div className="text-xs font-semibold mb-2 flex items-center gap-2 text-teal-700">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm shadow-teal-300" />
            <span className="uppercase tracking-wide">Calculation, Review &amp; Decision</span>
          </div>
          <div className="flex items-start gap-1">
            {[8, 9, 10, 11, 12].map((id, idx) => {
              const stage = JOURNEY_STAGES.find((s) => s.id === id)!;
              const nextId = [9, 10, 11, 12][idx];
              const handoff = idx < 4 ? getHandoffBetween(id, nextId) : undefined;
              return (
                <div key={id} className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <JourneyStageNode
                      stage={stage}
                      risks={RISK_CATALOG}
                      isSelected={selectedStageId === id}
                      onClick={() => selectStage(selectedStageId === id ? null : id)}
                      lens={activeLens}
                      isAffectedBySelectedComponent={affectedStageIds.includes(id)}
                    />
                  </div>
                  {idx < 4 && (
                    <FlowArrow
                      handoffId={handoff?.id}
                      hasRisk={handoffHasRisk(handoff)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Revision loop indicator */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-xs text-orange-500 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
              <RotateCcw size={12} />
              <span>Revision loop: Stage 10 → 7 (full DFM rerun) or Stage 10 → 8 (financial variation)</span>
              <button
                onClick={() => selectHandoff(getHandoffBetween(9, 7)?.id ?? null)}
                className="ml-1 underline hover:text-orange-700"
              >
                Explore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel row */}
      {(selectedStage || selectedHandoff) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[480px]">
          {selectedStage && (
            <StageDetailPanel
              stage={selectedStage}
              onClose={() => selectStage(null)}
            />
          )}
          {selectedHandoff && (
            <HandoffDetailPanel
              handoff={selectedHandoff}
              onClose={() => selectHandoff(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
