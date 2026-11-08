import type { JourneyHandoff } from "@/domain/journey";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { ARCHITECTURE_COMPONENTS } from "@/data/pumaArchitecture";
import { X, AlertTriangle, CheckCircle, HelpCircle, Database, Zap, Users, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HandoffDetailPanelProps {
  handoff: JourneyHandoff;
  onClose: () => void;
}

const HANDOFF_TYPE_LABELS: Record<string, string> = {
  api: "API Call",
  data: "Data Transfer",
  human: "Human Action",
  workflow: "Workflow Event",
  batch: "Batch Process",
  approval: "Approval Gate",
};

const HANDOFF_TYPE_COLORS: Record<string, string> = {
  api: "text-blue-600 bg-blue-50 border-blue-200",
  data: "text-teal-600 bg-teal-50 border-teal-200",
  human: "text-purple-600 bg-purple-50 border-purple-200",
  workflow: "text-indigo-600 bg-indigo-50 border-indigo-200",
  batch: "text-slate-600 bg-slate-50 border-slate-200",
  approval: "text-purple-600 bg-purple-50 border-purple-200",
};

const MONITORING_STATUS_LABEL: Record<string, string> = {
  instrumented: "Instrumented",
  partial: "Partial Coverage",
  unknown: "Coverage Unknown",
};

export function HandoffDetailPanel({ handoff, onClose }: HandoffDetailPanelProps) {
  const sourceStage = JOURNEY_STAGES.find((s) => s.id === handoff.sourceStageId);
  const targetStage = JOURNEY_STAGES.find((s) => s.id === handoff.targetStageId);
  const sourceComponent = ARCHITECTURE_COMPONENTS.find((c) => c.id === handoff.sourceComponentId);
  const targetComponent = ARCHITECTURE_COMPONENTS.find((c) => c.id === handoff.targetComponentId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 text-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded border font-medium",
                  HANDOFF_TYPE_COLORS[handoff.handoffType]
                )}
              >
                {HANDOFF_TYPE_LABELS[handoff.handoffType]}
              </span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  handoff.monitoringStatus === "instrumented"
                    ? "bg-green-500"
                    : handoff.monitoringStatus === "partial"
                    ? "bg-amber-500"
                    : "bg-gray-500"
                )}
              >
                {MONITORING_STATUS_LABEL[handoff.monitoringStatus]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{sourceStage?.name ?? handoff.sourceComponentId}</span>
              <ArrowRight size={18} className="text-purple-200" />
              <span>{targetStage?.name ?? handoff.targetComponentId}</span>
            </div>
            <div className="text-purple-200 text-sm mt-0.5">
              {sourceComponent?.shortName} → {targetComponent?.shortName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-purple-700 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Trigger & Expected Output */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Trigger &amp; Expected Outcome
          </h3>
          <div className="space-y-2">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Trigger</div>
              <div className="text-sm text-slate-700">{handoff.trigger}</div>
            </div>
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Expected Outcome</div>
              <div className="text-sm text-green-800">{handoff.expectedOutput}</div>
            </div>
          </div>
        </section>

        {/* Reliability properties */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Shield size={12} />
            Reliability Properties
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <PropertyChip label="Retry Supported" value={handoff.retrySupported} />
            <PropertyChip label="Idempotent" value={handoff.idempotent} />
            <PropertyChip label="Reconciliation" value={handoff.reconciliationAvailable} />
          </div>
          {handoff.observedFailures !== undefined && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Observed Failures</div>
              <div className="text-lg font-bold text-orange-700">{handoff.observedFailures}</div>
            </div>
          )}
        </section>

        {/* Potential Risks */}
        {handoff.potentialRisks.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              Potential Risks
            </h3>
            <ul className="space-y-1">
              {handoff.potentialRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recommended Controls */}
        {handoff.recommendedControls.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Zap size={12} />
              Recommended Controls
            </h3>
            <ul className="space-y-1">
              {handoff.recommendedControls.map((ctrl, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle size={12} className="text-blue-500 mt-0.5 shrink-0" />
                  {ctrl}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Evidence note */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
          <HelpCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">
            Monitoring coverage and risk assessment reflect documented evidence.
            {handoff.monitoringStatus === "unknown" &&
              " Monitoring coverage for this handoff has not been established."}
            {handoff.monitoringStatus === "partial" &&
              " Partial monitoring coverage — some failure modes may go undetected."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertyChip({
  label,
  value,
}: {
  label: string;
  value: boolean | undefined;
}) {
  if (value === undefined) {
    return (
      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-center">
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-xs font-medium text-gray-500 mt-0.5">Unknown</div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "p-2 border rounded text-center",
        value ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      )}
    >
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={cn(
          "text-xs font-medium mt-0.5 flex items-center justify-center gap-1",
          value ? "text-green-700" : "text-red-600"
        )}
      >
        {value ? (
          <>
            <CheckCircle size={10} /> Yes
          </>
        ) : (
          <>
            <X size={10} /> No
          </>
        )}
      </div>
    </div>
  );
}
