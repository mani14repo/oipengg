import { MOCK_TOIL } from "@/data/mock/toil";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Wrench, AlertTriangle, CheckCircle, HelpCircle, Info, Zap } from "lucide-react";

export function ToilExplorer() {
  const toil = MOCK_TOIL;

  const stageToil = JOURNEY_STAGES.map((s) => {
    const items = toil.filter((t) => t.stageId === s.id);
    const totalOccurrences = items.reduce((acc, t) => acc + t.occurrenceCount, 0);
    return { stageId: s.id, stageName: s.name.substring(0, 15), items, totalOccurrences };
  }).filter((s) => s.totalOccurrences > 0);

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Wrench size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-amber-800">Toil Intelligence</div>
          <div className="text-sm text-amber-700 mt-0.5">
            Repetitive manual engineering work mapped to journey stages. Effort estimates are sourced
            from work notes, time records, and engineering estimates where available. Where actual
            effort data is unavailable, only occurrence frequency is shown.
          </div>
        </div>
      </div>

      {/* Heatmap by stage */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Toil Concentration by Stage</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageToil} margin={{ top: 0, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stageName" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [v, "Occurrences"]} />
              <Bar dataKey="totalOccurrences" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toil cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {toil.map((item) => {
          const stage = JOURNEY_STAGES.find((s) => s.id === item.stageId);
          const hasEffortData =
            item.averageManualMinutes !== undefined ||
            item.recordedHours !== undefined ||
            item.estimatedHours !== undefined;

          return (
            <div
              key={item.activityId}
              className="bg-white rounded-xl border border-amber-200 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs text-amber-600 font-medium">{item.category}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{item.description}</div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-xl font-bold text-amber-600">{item.occurrenceCount}</div>
                  <div className="text-xs text-slate-400">occurrences</div>
                </div>
              </div>

              <div className="text-xs text-slate-500 mb-2">
                Stage {item.stageId}: {stage?.name}
              </div>

              {hasEffortData ? (
                <div className="p-2 bg-amber-50 border border-amber-100 rounded text-xs">
                  {item.averageManualMinutes && (
                    <div className="text-amber-700">~{item.averageManualMinutes} min/occurrence</div>
                  )}
                  {item.recordedHours && (
                    <div className="text-amber-700">{item.recordedHours}h recorded</div>
                  )}
                  {item.estimatedHours && (
                    <div className="text-amber-600 italic">{item.estimatedHours}h estimated</div>
                  )}
                  {item.estimatedSavingsHours && (
                    <div className="text-green-600 mt-1 flex items-center gap-1">
                      <Zap size={10} />
                      ~{item.estimatedSavingsHours}h potential savings
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 flex items-center gap-1.5">
                  <HelpCircle size={11} />
                  Frequency known — manual effort not measured
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    item.confidence === "high"
                      ? "bg-green-100 text-green-700"
                      : item.confidence === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : item.confidence === "low"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {item.confidence} confidence
                </span>
                {item.automationCandidate && (
                  <span className="text-xs text-teal-600 flex items-center gap-1">
                    <Zap size={10} />
                    Automation candidate
                  </span>
                )}
                {item.suggestedOwner && (
                  <span className="text-xs text-slate-400 ml-auto">{item.suggestedOwner}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
