import { PumaJourney } from "@/components/journey/PumaJourney";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { RISK_CATALOG } from "@/data/riskCatalog";
import { cn } from "@/lib/utils";
import { TrendingDown, AlertTriangle, Activity, Info, Layers } from "lucide-react";

export function JourneyExplorerPage() {
  const totalIncidents = JOURNEY_STAGES.reduce((acc, s) => acc + s.incidentCount, 0);
  const topRisk = RISK_CATALOG.reduce((best, r) =>
    r.observedIncidentCount > best.observedIncidentCount ? r : best
  );
  const degradedStages = JOURNEY_STAGES.filter(
    (s) => s.reliability === "degraded" || s.reliability === "critical"
  ).length;
  const stagesWithHandoffRisk = JOURNEY_STAGES.filter((s) => s.hasHandoffWarning).length;

  return (
    <div className="p-6 space-y-6">
      {/* Executive scorecard */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        {/* Header band */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Layers size={16} className="text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Executive Journey Scorecard</h2>
              <p className="text-slate-400 text-xs mt-0.5">PUMA Underwriting Platform · Jul 1 – Oct 30, 2026</p>
            </div>
          </div>
          <div className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
            <Info size={11} />
            <span>Mock data</span>
          </div>
        </div>
        {/* Metric cards */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreCard
              value={totalIncidents}
              label="Total Incidents"
              sub="Jul – Oct 2026"
              icon={<AlertTriangle size={16} />}
              valueColor="text-red-400"
              accentBorder="border-l-red-500"
            />
            <ScoreCard
              value={topRisk.observedIncidentCount}
              label={`Top Risk · ${topRisk.riskId}`}
              sub={topRisk.name}
              icon={<TrendingDown size={16} />}
              valueColor="text-orange-400"
              accentBorder="border-l-orange-500"
            />
            <ScoreCard
              value={`${degradedStages}/12`}
              label="Degraded Stages"
              sub="Reliability below threshold"
              icon={<Activity size={16} />}
              valueColor="text-amber-400"
              accentBorder="border-l-amber-500"
            />
            <ScoreCard
              value={stagesWithHandoffRisk}
              label="Handoff Risk Flags"
              sub="Stages with failures > 5"
              icon={<AlertTriangle size={16} />}
              valueColor="text-purple-400"
              accentBorder="border-l-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Journey explorer */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">12-Stage Underwriting Journey</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select any stage to drill into incidents, risks, and architecture context</p>
          </div>
        </div>
        <PumaJourney />
      </div>
    </div>
  );
}

function ScoreCard({
  value,
  label,
  sub,
  icon,
  valueColor,
  accentBorder,
}: {
  value: number | string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  valueColor: string;
  accentBorder: string;
}) {
  return (
    <div className={cn("bg-white/5 hover:bg-white/8 transition-colors rounded-lg p-4 border-l-4 border border-white/10", accentBorder)}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-3xl font-bold leading-none tabular-nums", valueColor)}>{value}</span>
        <span className={cn("opacity-60 mt-0.5", valueColor)}>{icon}</span>
      </div>
      <div className="text-sm font-semibold text-white mt-2 leading-tight">{label}</div>
      <div className="text-xs text-slate-500 mt-1 leading-tight">{sub}</div>
    </div>
  );
}
