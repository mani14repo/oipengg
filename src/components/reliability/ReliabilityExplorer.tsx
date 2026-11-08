import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { ARCHITECTURE_COMPONENTS } from "@/data/pumaArchitecture";
import { cn, getReliabilityColor, getReliabilityLabel } from "@/lib/utils";
import {
  Activity,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Database,
  Info,
} from "lucide-react";
import type { ReliabilityStatus } from "@/domain/journey";

function StatusIcon({ status }: { status: ReliabilityStatus }) {
  switch (status) {
    case "healthy":
      return <CheckCircle size={14} className="text-green-500" />;
    case "degraded":
      return <AlertTriangle size={14} className="text-amber-500" />;
    case "critical":
      return <AlertTriangle size={14} className="text-red-500" />;
    default:
      return <HelpCircle size={14} className="text-gray-400" />;
  }
}

function StatusBadge({ status }: { status: ReliabilityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
        status === "healthy"
          ? "bg-green-100 text-green-700"
          : status === "degraded"
          ? "bg-amber-100 text-amber-700"
          : status === "critical"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-500"
      )}
    >
      <StatusIcon status={status} />
      {getReliabilityLabel(status)}
    </span>
  );
}

export function ReliabilityExplorer() {
  const stageReliability = JOURNEY_STAGES.map((s) => ({
    stage: s,
    status: s.reliability,
    telemetry: s.telemetryConfidence,
  }));

  const statusCounts = stageReliability.reduce<Record<string, number>>(
    (acc, { status }) => {
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-blue-800">Reliability Intelligence</div>
          <div className="text-sm text-blue-700 mt-0.5">
            Reliability metrics reflect current evidence quality. A missing or unknown status does
            not indicate a healthy service — it indicates insufficient telemetry, incomplete
            attribution, or unvalidated measurements. SLO definitions shown are proposals pending
            approval.
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { key: "healthy", label: "Healthy", color: "text-green-600 bg-green-50 border-green-200" },
          { key: "degraded", label: "Degraded", color: "text-amber-600 bg-amber-50 border-amber-200" },
          { key: "critical", label: "Critical", color: "text-red-600 bg-red-50 border-red-200" },
          { key: "unknown", label: "Unknown", color: "text-gray-600 bg-gray-50 border-gray-200" },
          { key: "not_instrumented", label: "No Telemetry", color: "text-slate-600 bg-slate-50 border-slate-200" },
        ].map((s) => (
          <div key={s.key} className={cn("rounded-xl border p-3 text-center", s.color)}>
            <div className="text-2xl font-bold">{statusCounts[s.key] ?? 0}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
            <div className="text-xs text-current opacity-60">stages</div>
          </div>
        ))}
      </div>

      {/* Journey stage reliability */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Journey Stage Reliability Status</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Status based on available evidence. Unknown indicates insufficient telemetry or attribution.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {stageReliability.map(({ stage, status, telemetry }) => (
            <div key={stage.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {stage.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-800">{stage.name}</div>
                <div className="text-xs text-slate-400">{stage.primarySystem}</div>
              </div>
              <StatusBadge status={status} />
              <div className="text-xs text-right">
                <div className="text-slate-500">Telemetry</div>
                <div
                  className={cn(
                    "font-medium capitalize",
                    telemetry === "high"
                      ? "text-green-600"
                      : telemetry === "medium"
                      ? "text-amber-500"
                      : telemetry === "low"
                      ? "text-orange-500"
                      : "text-gray-400"
                  )}
                >
                  {telemetry}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Incidents</div>
                <div
                  className={cn(
                    "text-sm font-bold",
                    stage.incidentCount > 30
                      ? "text-red-600"
                      : stage.incidentCount > 15
                      ? "text-orange-500"
                      : stage.incidentCount > 5
                      ? "text-amber-500"
                      : "text-slate-400"
                  )}
                >
                  {stage.incidentCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLI/SLO placeholders */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">SLI / SLO Definitions</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
              Proposed — not yet approved
            </span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            {
              component: "DFM API",
              sli: "Forecast job completion rate",
              target: "≥ 98%",
              window: "30-day rolling",
              status: "unavailable",
            },
            {
              component: "IRF → DFM Handoff",
              sli: "Successful trigger acknowledgment",
              target: "≥ 99%",
              window: "30-day rolling",
              status: "unavailable",
            },
            {
              component: "EOS UI",
              sli: "P&L screen load < 5s",
              target: "≥ 95%",
              window: "7-day rolling",
              status: "unavailable",
            },
            {
              component: "Comp Engine",
              sli: "Financial calculation success rate",
              target: "≥ 99.5%",
              window: "30-day rolling",
              status: "unavailable",
            },
            {
              component: "End-to-End Journey",
              sli: "Forecast request completion within SLA",
              target: "≥ 95%",
              window: "30-day rolling",
              status: "unavailable",
            },
          ].map((slo, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-800">{slo.component}</div>
                <div className="text-xs text-slate-500">{slo.sli}</div>
              </div>
              <div className="text-sm font-semibold text-blue-600">{slo.target}</div>
              <div className="text-xs text-slate-400">{slo.window}</div>
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                <HelpCircle size={10} />
                Not Instrumented
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence coverage note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
        <Database size={16} className="text-gray-400 mt-0.5 shrink-0" />
        <div className="text-sm text-gray-600">
          <div className="font-medium text-gray-700">Evidence Coverage</div>
          <div className="mt-1">
            Complete reliability measurement requires validated end-to-end telemetry, confirmed
            service-to-CI attribution in CMDB, and approved SLO definitions. Current evidence is
            insufficient to report validated SLIs. Connect the observability platform to populate
            live measurements.
          </div>
        </div>
      </div>
    </div>
  );
}
