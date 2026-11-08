import { cn, getRiskBg, getReliabilityLabel, getReliabilityColor } from "@/lib/utils";
import type { JourneyStage } from "@/domain/journey";
import type { RiskAssessment } from "@/domain/risks";
import type { JourneyLens } from "@/domain/journey";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  User,
  Cpu,
  ArrowRight,
  Wrench,
  ChevronRight,
  Clock,
  Activity,
  Database,
  Network,
} from "lucide-react";

interface JourneyStageNodeProps {
  stage: JourneyStage;
  risks: RiskAssessment[];
  isSelected: boolean;
  onClick: () => void;
  lens: JourneyLens;
  isHighlighted?: boolean;
  isAffectedBySelectedComponent?: boolean;
}

function getLensContent(stage: JourneyStage, risks: RiskAssessment[], lens: JourneyLens) {
  switch (lens) {
    case "business":
      return (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <User size={10} />
            <span>{stage.actor}</span>
          </div>
          <div className="text-xs text-slate-600 line-clamp-2">{stage.businessPurpose}</div>
        </div>
      );
    case "risks":
      return (
        <div className="mt-2 space-y-1">
          {risks.slice(0, 2).map((r) => (
            <div
              key={r.riskId}
              className={cn(
                "text-xs px-1.5 py-0.5 rounded border flex items-center justify-between",
                getRiskBg(r.severity)
              )}
            >
              <span className="font-medium">{r.riskId}</span>
              <span className="text-gray-500">{r.observedIncidentCount}i</span>
            </div>
          ))}
          {stage.riskIds.length === 0 && (
            <div className="text-xs text-slate-400 italic">No mapped risks</div>
          )}
        </div>
      );
    case "incidents":
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-700">{stage.incidentCount}</span>
            <span className="text-xs text-slate-500">incidents</span>
          </div>
          {stage.openProblemCount > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              {stage.openProblemCount} open problem{stage.openProblemCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
      );
    case "architecture":
      return (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1 text-xs text-teal-700">
            <Cpu size={10} />
            <span className="text-xs text-slate-500">{stage.archLayer}</span>
          </div>
          <div className="text-xs text-slate-500">
            {stage.componentIds.length} component{stage.componentIds.length !== 1 ? "s" : ""}
          </div>
        </div>
      );
    case "handoffs":
      return (
        <div className="mt-2 space-y-1">
          {stage.hasHandoffWarning ? (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle size={10} />
              Handoff risk
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle size={10} />
              No handoff flag
            </div>
          )}
        </div>
      );
    case "toil":
      return (
        <div className="mt-2">
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Wrench size={10} />
            <span className="text-xs text-slate-600">
              {stage.incidentCount > 20 ? "High" : stage.incidentCount > 10 ? "Medium" : "Low"} toil
            </span>
          </div>
        </div>
      );
    case "reliability":
      return (
        <div className="mt-2 space-y-1">
          <div className={cn("text-xs font-medium", getReliabilityColor(stage.reliability))}>
            {getReliabilityLabel(stage.reliability)}
          </div>
          <div className="text-xs text-slate-400">
            Telemetry: {stage.telemetryConfidence}
          </div>
        </div>
      );
    case "remediation":
      return (
        <div className="mt-2 space-y-1">
          {stage.openProblemCount > 0 ? (
            <div className="text-xs text-orange-600 flex items-center gap-1">
              <Activity size={10} />
              {stage.openProblemCount} open investigation{stage.openProblemCount > 1 ? "s" : ""}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No open problems</div>
          )}
        </div>
      );
    default:
      return null;
  }
}

export function JourneyStageNode({
  stage,
  risks,
  isSelected,
  onClick,
  lens,
  isHighlighted,
  isAffectedBySelectedComponent,
}: JourneyStageNodeProps) {
  const stageRisks = risks.filter((r) => stage.riskIds.includes(r.riskId));
  const maxSeverity = stageRisks.reduce<"critical" | "high" | "medium" | "low" | "none">(
    (acc, r) => {
      if (acc === "critical") return acc;
      if (r.severity === "critical") return "critical";
      if (acc === "high") return acc;
      if (r.severity === "high") return "high";
      if (acc === "medium") return acc;
      if (r.severity === "medium") return "medium";
      return "low";
    },
    "none"
  );

  const borderColor = isSelected
    ? "border-blue-500 ring-2 ring-blue-200"
    : isAffectedBySelectedComponent
    ? "border-orange-400 ring-1 ring-orange-100"
    : isHighlighted
    ? "border-indigo-400"
    : maxSeverity === "critical"
    ? "border-red-300"
    : maxSeverity === "high"
    ? "border-orange-200"
    : "border-slate-200";

  const badgeBg = isSelected
    ? "bg-blue-600 text-white"
    : maxSeverity === "critical"
    ? "bg-red-500 text-white"
    : maxSeverity === "high"
    ? "bg-orange-500 text-white"
    : "bg-slate-600 text-white";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col text-left rounded-xl border-2 pt-4 pb-3 px-3 bg-white transition-all duration-200 w-full",
        "hover:shadow-lg hover:-translate-y-0.5 shadow-sm",
        borderColor,
        isSelected && "bg-blue-50/60",
        isAffectedBySelectedComponent && "bg-orange-50/60"
      )}
    >
      {/* Stage number badge */}
      <div className="absolute -top-3 left-3">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm",
            badgeBg
          )}
        >
          {stage.id}
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="font-semibold text-xs text-slate-800 leading-snug">{stage.name}</div>
        <div className="text-xs text-blue-600 font-medium mt-0.5 truncate">{stage.primarySystem}</div>
      </div>

      {/* Lens-specific content */}
      {getLensContent(stage, stageRisks, lens)}

      {/* Bottom indicators */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
        {stage.incidentCount > 0 && (
          <div className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium",
            stage.incidentCount > 30 ? "bg-red-50 text-red-600" :
            stage.incidentCount > 15 ? "bg-orange-50 text-orange-600" :
            "bg-amber-50 text-amber-600"
          )}>
            <AlertTriangle size={9} />
            <span>{stage.incidentCount}</span>
          </div>
        )}
        {stage.hasHandoffWarning && (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-600">
            <Network size={9} />
          </div>
        )}
        {(stage.reliability === "degraded" || stage.reliability === "critical") && (
          <div className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs",
            stage.reliability === "critical" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
          )}>
            <Activity size={9} />
          </div>
        )}
        {isSelected && (
          <ChevronRight size={11} className="ml-auto text-blue-500 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
