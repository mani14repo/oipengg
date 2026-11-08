import type { JourneyStage } from "@/domain/journey";
import type { RiskAssessment } from "@/domain/risks";
import type { ArchitectureComponent } from "@/domain/architecture";
import { cn, getRiskColor, getRiskBg, getReliabilityLabel, getReliabilityColor } from "@/lib/utils";
import { useJourneyStore } from "@/state/journeyStore";
import {
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Network,
  Layers,
  User,
  Target,
  ArrowRight,
  Activity,
  Database,
  Info,
  Pin,
} from "lucide-react";
import { ARCHITECTURE_COMPONENTS } from "@/data/pumaArchitecture";
import { RISK_CATALOG } from "@/data/riskCatalog";
import { MOCK_INCIDENTS } from "@/data/mock/incidents";

interface StageDetailPanelProps {
  stage: JourneyStage;
  onClose: () => void;
}

function RiskBadge({ risk }: { risk: RiskAssessment }) {
  return (
    <div className={cn("rounded-lg p-3 border", getRiskBg(risk.severity))}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("font-bold text-sm", getRiskColor(risk.severity))}>{risk.riskId}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">{risk.severity}</span>
          </div>
          <div className="text-sm font-medium text-slate-800 mt-0.5">{risk.name}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-700">{risk.observedIncidentCount}</div>
          <div className="text-xs text-slate-400">incidents</div>
        </div>
      </div>
      {risk.businessImpact && (
        <div className="mt-2 text-xs text-slate-600">{risk.businessImpact}</div>
      )}
    </div>
  );
}

export function StageDetailPanel({ stage, onClose }: StageDetailPanelProps) {
  const { selectComponent, pinItem } = useJourneyStore();

  const stageRisks = RISK_CATALOG.filter((r) => stage.riskIds.includes(r.riskId));
  const stageComponents = ARCHITECTURE_COMPONENTS.filter((c) => stage.componentIds.includes(c.id));
  const stageIncidents = MOCK_INCIDENTS.filter((i) => i.reportedStageId === stage.id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                Stage {stage.id}
              </span>
              {stage.hasHandoffWarning && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Network size={10} />
                  Handoff Risk
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1">{stage.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-slate-300 text-sm">
              <span className="text-blue-300 font-medium">{stage.primarySystem}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User size={12} />
                {stage.actor}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pinItem("stage", String(stage.id), stage.name)}
              className="p-1.5 hover:bg-slate-600 rounded transition-colors"
              title="Pin to workspace"
            >
              <Pin size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-600 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-600">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{stage.incidentCount}</div>
            <div className="text-xs text-slate-400">Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-300">{stage.openProblemCount}</div>
            <div className="text-xs text-slate-400">Open Problems</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-300">{stage.riskIds.length}</div>
            <div className="text-xs text-slate-400">Risk IDs</div>
          </div>
          <div className="text-center">
            <div className={cn("text-sm font-semibold", getReliabilityColor(stage.reliability))}>
              {getReliabilityLabel(stage.reliability)}
            </div>
            <div className="text-xs text-slate-400">Reliability</div>
          </div>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Business Purpose */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Target size={12} />
            Business Purpose
          </h3>
          <p className="text-sm text-slate-700">{stage.businessPurpose}</p>
          <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Expected Output</div>
            <div className="text-sm text-green-800">{stage.expectedOutput}</div>
          </div>
          {stage.potentialDownstreamImpact && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Potential Downstream Impact</div>
              <div className="text-sm text-amber-800">{stage.potentialDownstreamImpact}</div>
            </div>
          )}
        </section>

        {/* Architecture */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Layers size={12} />
            Architecture Components
          </h3>
          <div className="space-y-2">
            {stageComponents.map((comp) => (
              <button
                key={comp.id}
                onClick={() => selectComponent(comp.id)}
                className="w-full text-left p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800 group-hover:text-blue-700">
                      {comp.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {comp.technology.join(", ")}
                      {comp.hosting && ` · ${comp.hosting}`}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                {comp.knownLimitations.length > 0 && (
                  <div className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {comp.knownLimitations.length} known limitation{comp.knownLimitations.length > 1 ? "s" : ""}
                  </div>
                )}
              </button>
            ))}
            {stageComponents.length === 0 && (
              <div className="text-xs text-slate-400 italic">No component mapping available</div>
            )}
          </div>
        </section>

        {/* Risks */}
        {stageRisks.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              Associated Risks
            </h3>
            <div className="space-y-2">
              {stageRisks.map((r) => (
                <RiskBadge key={r.riskId} risk={r} />
              ))}
            </div>
          </section>
        )}

        {/* Sample Incidents */}
        {stageIncidents.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Activity size={12} />
              Sample Incidents
            </h3>
            <div className="space-y-2">
              {stageIncidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-slate-500">{inc.number}</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-xs font-medium",
                        inc.priority === "P1"
                          ? "bg-red-100 text-red-700"
                          : inc.priority === "P2"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {inc.priority}
                    </span>
                    {inc.evidenceOfManualRecovery && (
                      <span className="text-amber-600 flex items-center gap-0.5">
                        <Info size={9} />
                        Manual recovery
                      </span>
                    )}
                  </div>
                  <div className="text-slate-700">{inc.shortDescription}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reliability */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Database size={12} />
            Reliability &amp; Evidence
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-400">Reliability Status</div>
              <div className={cn("text-sm font-semibold mt-0.5", getReliabilityColor(stage.reliability))}>
                {getReliabilityLabel(stage.reliability)}
              </div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-400">Telemetry Confidence</div>
              <div className="text-sm font-semibold text-slate-700 capitalize mt-0.5">
                {stage.telemetryConfidence}
              </div>
            </div>
          </div>
          {(stage.reliability === "unknown" || stage.telemetryConfidence === "unknown") && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
              <HelpCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500">
                Reliability status cannot be determined without validated telemetry coverage and
                confirmed service-to-CI attribution.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
