import { useState } from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel, Tag, InlineNotification } from "@carbon/react";
import { RISK_CATALOG } from "@/data/riskCatalog";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { MOCK_INCIDENTS, INCIDENT_TRENDS } from "@/data/mock/incidents";
import { ACTIONABLE_MAPPINGS, GOVERNANCE_ARTIFACTS } from "@/data/governanceArtifacts";
import { cn, getRiskColor, getRiskBg, getPriorityColor } from "@/lib/utils";
import { useJourneyStore } from "@/state/journeyStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { AlertTriangle, TrendingUp, ChevronRight, Info, Filter, ShieldCheck } from "lucide-react";
import type { RiskSeverity } from "@/domain/risks";

const SEVERITY_TO_TAG: Record<RiskSeverity, string> = {
  critical: "red",
  high: "magenta",
  medium: "warm-gray",
  low: "green",
  unknown: "gray",
};

const SEVERITY_ORDER: RiskSeverity[] = ["critical", "high", "medium", "low", "unknown"];

export function RiskExplorer() {
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const { selectStage } = useJourneyStore();

  const sortedRisks = [...RISK_CATALOG].sort((a, b) => {
    const sevA = SEVERITY_ORDER.indexOf(a.severity);
    const sevB = SEVERITY_ORDER.indexOf(b.severity);
    if (sevA !== sevB) return sevA - sevB;
    return b.observedIncidentCount - a.observedIncidentCount;
  });

  const selectedRisk = RISK_CATALOG.find((r) => r.riskId === selectedRiskId);
  const riskIncidents = MOCK_INCIDENTS.filter((i) => i.relatedRiskId === selectedRiskId);

  const trendData = INCIDENT_TRENDS.map((t) => ({
    period: t.period.replace("2026-", ""),
    total: t.count,
    P1: t.byPriority.P1 ?? 0,
    P2: t.byPriority.P2 ?? 0,
    P3: t.byPriority.P3 ?? 0,
  }));

  const riskBarData = sortedRisks
    .filter((r) => !r.isOverlapping)
    .map((r) => ({
      name: r.riskId,
      count: r.observedIncidentCount,
      severity: r.severity,
    }));

  return (
    <div className="space-y-4">
      <Tabs>
        <TabList aria-label="Risk explorer views">
          <Tab>Risk Overview</Tab>
          <Tab>Incidents ({MOCK_INCIDENTS.length} sample)</Tab>
          <Tab>Trends</Tab>
        </TabList>
        <TabPanels>

      {/* ---- Overview panel ---- */}
      <TabPanel>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Risk list */}
          <div className="xl:col-span-2 space-y-3">
            {/* Summary scorecard */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Incidents", value: 379, sub: "Jul–Oct 2026", color: "text-slate-700" },
                { label: "Critical Risks", value: sortedRisks.filter(r => r.severity === "critical").length, sub: "2 risk areas", color: "text-red-600" },
                { label: "Top Risk (R5)", value: 151, sub: "Pricing correctness", color: "text-red-500" },
                { label: "Analysis Period", value: "4 mo", sub: "Jul 1 – Oct 30", color: "text-blue-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">{stat.label}</div>
                  <div className="text-xs text-slate-400">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Risk bar chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Incident Concentration by Risk Area</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskBarData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v, n) => [v, "Incidents"]}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "top", fontSize: 10 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InlineNotification
                kind="warning"
                title="Overlapping indicator: "
                subtitle="R3 (Deadline Pressure) is excluded from chart totals — it co-occurs with other risks. R5 includes suspected discrepancies and inquiries."
                hideCloseButton
                lowContrast
                className="mt-2"
              />
            </div>

            {/* Risk cards */}
            <div className="space-y-2">
              {sortedRisks.map((r) => (
                <button
                  key={r.riskId}
                  onClick={() => setSelectedRiskId(r.riskId === selectedRiskId ? null : r.riskId)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 p-3 bg-white transition-all hover:shadow-sm",
                    selectedRiskId === r.riskId
                      ? "border-blue-500 bg-blue-50"
                      : getRiskBg(r.severity)
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("font-bold text-sm", getRiskColor(r.severity))}>
                          {r.riskId}
                        </span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <Tag type={SEVERITY_TO_TAG[r.severity] as any} size="sm">{r.severity}</Tag>
                        <span className="text-xs text-slate-400 capitalize">{r.confidence}</span>
                        {r.isOverlapping && (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          <Tag type={"purple" as any} size="sm">Overlapping</Tag>
                        )}
                      </div>
                      <div className="font-semibold text-slate-800 mt-1">{r.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn("text-2xl font-bold", getRiskColor(r.severity))}>
                        {r.observedIncidentCount}
                      </div>
                      <div className="text-xs text-slate-400">incidents</div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedRiskId === r.riskId && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                      {r.affectedStageIds.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-400 mb-1.5">Affected Stages</div>
                          <div className="flex flex-wrap gap-1">
                            {r.affectedStageIds.map((id) => {
                              const s = JOURNEY_STAGES.find((s) => s.id === id);
                              return s ? (
                                <button
                                  key={id}
                                  onClick={(e) => { e.stopPropagation(); selectStage(id); }}
                                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100 transition-colors"
                                >
                                  {id}. {s.name}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      {r.businessImpact && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Business Impact: </span>
                          {r.businessImpact}
                        </div>
                      )}
                      {r.architectureExposure && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Architecture Exposure: </span>
                          {r.architectureExposure}
                        </div>
                      )}
                      {/* Governance references */}
                      {(() => {
                        const mapping = ACTIONABLE_MAPPINGS.find((m) => m.actionableId === r.riskId);
                        const artifacts = mapping
                          ? GOVERNANCE_ARTIFACTS.filter((a) => mapping.artifactIds.includes(a.id))
                          : [];
                        if (artifacts.length === 0) return null;
                        return (
                          <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <ShieldCheck size={11} />
                              Governance References
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {artifacts.map((a) => (
                                <span
                                  key={a.id}
                                  className={cn(
                                    "inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded border",
                                    a.type === "rca_playbook" ? "bg-violet-50 text-violet-700 border-violet-200" :
                                    a.type === "oip"          ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    a.type === "assessment"   ? "bg-teal-50 text-teal-700 border-teal-200" :
                                    a.type === "standard"     ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                "bg-red-50 text-red-700 border-red-200"
                                  )}
                                  title={a.title}
                                >
                                  {a.id}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div>
            {selectedRisk ? (
              <RiskDetailPanel risk={selectedRisk} incidents={riskIncidents} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <AlertTriangle size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  Select a risk to see its evidence chain, affected architecture, and incident samples.
                </p>
              </div>
            )}
          </div>
        </div>
      </TabPanel>

      {/* ---- Incidents panel ---- */}
      <TabPanel>
        <IncidentTable />
      </TabPanel>

      {/* ---- Trends panel ---- */}
      <TabPanel>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Incident Trend (Jul–Oct 2026)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="P1" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" name="P1" />
                <Line type="monotone" dataKey="P2" stroke="#f97316" strokeWidth={2} strokeDasharray="4 2" name="P2" />
                <Line type="monotone" dataKey="P3" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 2" name="P3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
            Note: Trend data shown is seeded mock data for the analysis period. Connect the ServiceNow API for live data.
          </div>
        </div>
      </TabPanel>

        </TabPanels>
      </Tabs>
    </div>
  );
}

function RiskDetailPanel({
  risk,
  incidents,
}: {
  risk: (typeof RISK_CATALOG)[0];
  incidents: typeof MOCK_INCIDENTS;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-h-[700px] overflow-y-auto">
      <div className={cn("p-4", getRiskBg(risk.severity))}>
        <div className="flex items-start justify-between">
          <div>
            <div className={cn("text-xs font-bold uppercase", getRiskColor(risk.severity))}>
              {risk.severity} · {risk.confidence}
            </div>
            <div className="font-bold text-slate-800 text-lg mt-0.5">{risk.name}</div>
            <div className="text-sm text-slate-500">{risk.riskId} · {risk.category}</div>
          </div>
          <div className={cn("text-3xl font-bold", getRiskColor(risk.severity))}>
            {risk.observedIncidentCount}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Evidence Trail</h4>
          <div className="space-y-2">
            <EvidenceItem
              label={`${risk.observedIncidentCount} historical incident classifications`}
              status="available"
            />
            <EvidenceItem
              label="Architecture findings"
              status={risk.architectureExposure ? "available" : "unknown"}
            />
            <EvidenceItem label="Related Problem records" status="unknown" />
            <EvidenceItem label="Engineering corrective actions" status="unknown" />
            <EvidenceItem
              label="Monitoring evidence"
              status={(risk.evidenceCoverage ?? 0) > 50 ? "partial" : "unknown"}
            />
          </div>
        </section>

        {risk.businessImpact && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Business Impact</h4>
            <p className="text-sm text-slate-600">{risk.businessImpact}</p>
          </section>
        )}

        {risk.architectureExposure && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Architecture Exposure</h4>
            <p className="text-sm text-slate-600">{risk.architectureExposure}</p>
          </section>
        )}

        {incidents.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Sample Incidents</h4>
            <div className="space-y-2">
              {incidents.map((inc) => (
                <div key={inc.id} className="text-xs bg-slate-50 border border-slate-200 rounded p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-slate-400">{inc.number}</span>
                    <span className={cn("px-1.5 py-0.5 rounded border text-xs", getPriorityColor(inc.priority))}>
                      {inc.priority}
                    </span>
                  </div>
                  <div className="text-slate-700">{inc.shortDescription}</div>
                  {inc.evidenceOfManualRecovery && (
                    <div className="text-amber-600 mt-1 flex items-center gap-1">
                      <Info size={9} />
                      Manual recovery involved
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 flex items-start gap-2">
          <Info size={12} className="mt-0.5 shrink-0" />
          Risk severity and confidence reflect assessed observations. A high incident count does not
          automatically indicate critical severity — business impact and architecture exposure are
          considered independently.
        </div>
      </div>
    </div>
  );
}

function EvidenceItem({ label, status }: { label: string; status: "available" | "partial" | "unknown" }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          status === "available" ? "bg-green-500" : status === "partial" ? "bg-amber-400" : "bg-gray-300"
        )}
      />
      <span className="text-slate-600">{label}</span>
      {status === "unknown" && <span className="text-gray-400 italic">(not established)</span>}
    </div>
  );
}

function IncidentTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Sample Incidents</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Representative examples from the Jul–Oct 2026 analysis period. Connect ServiceNow API for full dataset.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          <Info size={12} />
          Mock data
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Number</th>
              <th className="text-left px-4 py-2">Priority</th>
              <th className="text-left px-4 py-2">Application</th>
              <th className="text-left px-4 py-2">Risk</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2">State</th>
              <th className="text-left px-4 py-2">Manual Recovery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_INCIDENTS.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-mono text-xs text-blue-600">{inc.number}</td>
                <td className="px-4 py-2">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium", getPriorityColor(inc.priority))}>
                    {inc.priority}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">{inc.applicationId}</td>
                <td className="px-4 py-2 text-xs font-medium text-orange-600">{inc.relatedRiskId}</td>
                <td className="px-4 py-2 text-xs text-slate-700 max-w-xs truncate">
                  {inc.shortDescription}
                </td>
                <td className="px-4 py-2">
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    inc.state === "closed" ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"
                  )}>
                    {inc.state}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {inc.evidenceOfManualRecovery && (
                    <span className="text-xs text-amber-600">Yes</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
