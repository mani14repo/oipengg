import { useState } from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel, Tag } from "@carbon/react";
import {
  ARCHITECTURE_COMPONENTS,
  ARCHITECTURE_HOTSPOTS,
  ARCHITECTURE_ISSUES,
  ARCHITECTURE_DEPENDENCIES,
} from "@/data/pumaArchitecture";
import { RISK_CATALOG } from "@/data/riskCatalog";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { useJourneyStore } from "@/state/journeyStore";
import { cn, getRiskColor, getRiskBg } from "@/lib/utils";
import {
  AlertTriangle,
  Cpu,
  Network,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Layers,
  Cloud,
  Zap,
  HelpCircle,
  X,
  Info,
} from "lucide-react";
import type { ArchitectureDomain } from "@/domain/architecture";

const DOMAIN_LABELS: Record<ArchitectureDomain, string> = {
  "business-workflow": "Business / Workflow",
  "user-experience": "User Experience",
  "api-orchestration": "API Orchestration",
  "formulary-processing": "Formulary Processing",
  "data-integration": "Data Integration",
  "forecasting-compute": "Forecasting Compute",
  "financial-calculation": "Financial Calculation",
  "reliability-operations": "Reliability Operations",
};

const DOMAIN_COLORS: Record<ArchitectureDomain, string> = {
  "business-workflow": "bg-blue-50 border-blue-200",
  "user-experience": "bg-indigo-50 border-indigo-200",
  "api-orchestration": "bg-teal-50 border-teal-200",
  "formulary-processing": "bg-purple-50 border-purple-200",
  "data-integration": "bg-cyan-50 border-cyan-200",
  "forecasting-compute": "bg-orange-50 border-orange-200",
  "financial-calculation": "bg-emerald-50 border-emerald-200",
  "reliability-operations": "bg-slate-50 border-slate-200",
};

const CLOUD_ICON: Record<string, string> = {
  azure: "☁️ Azure",
  aws: "☁️ AWS",
  gcp: "☁️ GCP",
  multi: "⛅ Multi",
  "on-prem": "🖥️ On-Prem",
};

export function ArchitectureExplorer() {
  const { selectedComponentId, selectComponent, selectedStageId } = useJourneyStore();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(["business-workflow", "user-experience", "api-orchestration", "formulary-processing", "forecasting-compute", "financial-calculation"])
  );
  const [view, setView] = useState<"components" | "hotspots" | "issues">("components");

  const selectedComponent = ARCHITECTURE_COMPONENTS.find((c) => c.id === selectedComponentId);

  const domainGroups = Object.entries(DOMAIN_LABELS).map(([domain, label]) => ({
    domain: domain as ArchitectureDomain,
    label,
    components: ARCHITECTURE_COMPONENTS.filter((c) => c.domain === (domain as ArchitectureDomain)),
  })).filter((g) => g.components.length > 0);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  // Find downstream components from selected
  const getDownstreamComponentIds = (id: string): string[] => {
    const direct = ARCHITECTURE_DEPENDENCIES
      .filter((d) => d.sourceId === id)
      .map((d) => d.targetId);
    return direct;
  };

  const downstreamIds = selectedComponentId ? getDownstreamComponentIds(selectedComponentId) : [];

  return (
    <div className="space-y-4">
      {selectedComponentId && (
        <div className="flex justify-end">
          <button
            onClick={() => selectComponent(null)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1"
          >
            <X size={12} />
            Clear selection
          </button>
        </div>
      )}

      <Tabs onChange={({ selectedIndex }: { selectedIndex: number }) => {
        const views = ["components", "hotspots", "issues"] as const;
        setView(views[selectedIndex]);
      }}>
        <TabList aria-label="Architecture views">
          <Tab>Component Map</Tab>
          <Tab>Hotspots ({ARCHITECTURE_HOTSPOTS.length})</Tab>
          <Tab>Arch Issues ({ARCHITECTURE_ISSUES.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
      {view === "components" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Component map */}
          <div className="xl:col-span-2 space-y-3">
            {domainGroups.map(({ domain, label, components }) => (
              <div
                key={domain}
                className={cn("rounded-xl border overflow-hidden", DOMAIN_COLORS[domain])}
              >
                <button
                  onClick={() => toggleDomain(domain)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <span className="text-xs text-slate-400 bg-white/60 px-1.5 rounded">
                      {components.length}
                    </span>
                  </div>
                  {expandedDomains.has(domain) ? (
                    <ChevronDown size={14} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-400" />
                  )}
                </button>

                {expandedDomains.has(domain) && (
                  <div className="px-3 pb-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {components.map((comp) => {
                      const compRisks = RISK_CATALOG.filter((r) =>
                        comp.riskIds.includes(r.riskId)
                      );
                      const maxRisk = compRisks.reduce<"critical" | "high" | "medium" | "low" | "none">(
                        (acc, r) => {
                          if (acc === "critical") return acc;
                          if (r.severity === "critical") return "critical";
                          if (acc === "high") return acc;
                          if (r.severity === "high") return "high";
                          if (acc === "medium") return acc;
                          if (r.severity === "medium") return "medium";
                          if (r.severity === "low") return "low";
                          return acc;
                        },
                        "none"
                      );

                      const isSelected = selectedComponentId === comp.id;
                      const isDownstream = downstreamIds.includes(comp.id);

                      return (
                        <button
                          key={comp.id}
                          onClick={() => selectComponent(isSelected ? null : comp.id)}
                          className={cn(
                            "text-left p-2 rounded-lg border bg-white transition-all hover:shadow-md",
                            isSelected
                              ? "border-blue-500 shadow-blue-100 shadow-md"
                              : isDownstream
                              ? "border-orange-400 shadow-orange-50"
                              : maxRisk === "critical"
                              ? "border-red-300"
                              : maxRisk === "high"
                              ? "border-orange-300"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className="font-medium text-sm text-slate-800 leading-tight">
                            {comp.shortName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate">
                            {comp.technology[0]}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-slate-400">
                              {CLOUD_ICON[comp.cloudProvider]}
                            </span>
                            {comp.riskIds.length > 0 && (
                              <AlertTriangle
                                size={10}
                                className={
                                  maxRisk === "critical"
                                    ? "text-red-500"
                                    : maxRisk === "high"
                                    ? "text-orange-500"
                                    : "text-amber-400"
                                }
                              />
                            )}
                            {comp.knownLimitations.length > 0 && (
                              <span className="text-xs text-amber-500">
                                {comp.knownLimitations.length}⚠
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Component detail */}
          <div>
            {selectedComponent ? (
              <ComponentDetail component={selectedComponent} downstreamIds={downstreamIds} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <Cpu size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  Select a component to explore its dependencies, risks, and architectural issues.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

          </TabPanel>
          <TabPanel>
            {view === "hotspots" && <HotspotsView />}
          </TabPanel>
          <TabPanel>
            {view === "issues" && <IssuesView />}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

function ComponentDetail({
  component,
  downstreamIds,
}: {
  component: (typeof ARCHITECTURE_COMPONENTS)[0];
  downstreamIds: string[];
}) {
  const { selectComponent, selectStage } = useJourneyStore();
  const compRisks = RISK_CATALOG.filter((r) => component.riskIds.includes(r.riskId));
  const compIssues = ARCHITECTURE_ISSUES.filter((i) => i.componentId === component.id);
  const supportedStages = JOURNEY_STAGES.filter((s) =>
    component.supportedStageIds.includes(s.id)
  );
  const downstreamComponents = ARCHITECTURE_COMPONENTS.filter((c) =>
    downstreamIds.includes(c.id)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-teal-200 uppercase tracking-wide mb-1">
              {DOMAIN_LABELS[component.domain]}
            </div>
            <h3 className="font-bold text-lg">{component.name}</h3>
            <div className="text-teal-200 text-sm mt-0.5">
              {component.technology.join(" · ")}
            </div>
          </div>
          <button onClick={() => selectComponent(null)} className="p-1 hover:bg-teal-600 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        <p className="text-sm text-slate-600">{component.description}</p>

        {/* Cloud/hosting */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Cloud size={12} />
          {CLOUD_ICON[component.cloudProvider]}
          {component.hosting && <span>· {component.hosting}</span>}
        </div>

        {/* Supported stages */}
        {supportedStages.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Supports Stages</h4>
            <div className="flex flex-wrap gap-1">
              {supportedStages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectStage(s.id)}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100 transition-colors"
                >
                  {s.id}. {s.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Downstream dependencies */}
        {downstreamComponents.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
              <ArrowRight size={10} />
              Downstream Dependencies
            </h4>
            <div className="space-y-1">
              {downstreamComponents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectComponent(c.id)}
                  className="w-full text-left text-xs bg-orange-50 border border-orange-200 rounded px-2 py-1.5 hover:bg-orange-100 transition-colors flex items-center justify-between"
                >
                  <span className="text-orange-700 font-medium">{c.name}</span>
                  <ChevronRight size={10} className="text-orange-400" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Known limitations */}
        {component.knownLimitations.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-amber-600 uppercase mb-2 flex items-center gap-1">
              <AlertTriangle size={10} />
              Known Limitations
            </h4>
            <ul className="space-y-1">
              {component.knownLimitations.map((lim, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">▸</span>
                  {lim}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Risks */}
        {compRisks.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-red-500 uppercase mb-2 flex items-center gap-1">
              <AlertTriangle size={10} />
              Associated Risks
            </h4>
            <div className="space-y-1">
              {compRisks.map((r) => (
                <div
                  key={r.riskId}
                  className={cn("text-xs rounded px-2 py-1.5 border flex items-center justify-between", getRiskBg(r.severity))}
                >
                  <div>
                    <span className={cn("font-bold", getRiskColor(r.severity))}>{r.riskId}</span>
                    <span className="ml-1 text-slate-600">{r.name}</span>
                  </div>
                  <span className="text-slate-500">{r.observedIncidentCount}i</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Architecture issues */}
        {compIssues.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Info size={10} />
              Architecture Issues
            </h4>
            <div className="space-y-2">
              {compIssues.map((issue) => (
                <div key={issue.id} className="text-xs bg-amber-50 border border-amber-200 rounded p-2">
                  <div className="font-semibold text-amber-800">{issue.title}</div>
                  <div className="text-slate-600 mt-0.5">{issue.description}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-slate-400 capitalize">{issue.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 capitalize">{issue.evidenceStatus}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={cn(
                        "font-medium capitalize",
                        issue.remediationStatus === "completed"
                          ? "text-green-600"
                          : issue.remediationStatus === "in_progress"
                          ? "text-blue-600"
                          : "text-orange-600"
                      )}
                    >
                      {issue.remediationStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function HotspotsView() {
  const { selectComponent } = useJourneyStore();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {ARCHITECTURE_HOTSPOTS.map((hs) => (
        <div
          key={hs.id}
          className={cn(
            "bg-white rounded-xl border-2 p-4 shadow-sm",
            hs.severity === "critical" ? "border-red-300" : hs.severity === "high" ? "border-orange-300" : "border-amber-200"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span
                className={cn(
                  "text-xs font-bold uppercase px-2 py-0.5 rounded",
                  hs.severity === "critical" ? "bg-red-100 text-red-700" : hs.severity === "high" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                )}
              >
                {hs.severity}
              </span>
              <h3 className="font-semibold text-slate-800 mt-1">{hs.name}</h3>
            </div>
            <AlertTriangle
              size={18}
              className={hs.severity === "critical" ? "text-red-500" : hs.severity === "high" ? "text-orange-500" : "text-amber-500"}
            />
          </div>

          <p className="text-xs text-slate-600 mb-3">{hs.description}</p>

          <div className="mb-3">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Exposures</div>
            <ul className="space-y-0.5">
              {hs.exposures.slice(0, 4).map((exp, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                  <span className="text-amber-400 mt-0.5">▸</span>
                  {exp}
                </li>
              ))}
              {hs.exposures.length > 4 && (
                <li className="text-xs text-slate-400">+{hs.exposures.length - 4} more</li>
              )}
            </ul>
          </div>

          <div className="mb-3">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Controls</div>
            <ul className="space-y-0.5">
              {hs.recommendedControls.slice(0, 3).map((ctrl, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                  <Zap size={10} className="text-blue-400 mt-0.5 shrink-0" />
                  {ctrl}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1">
            {hs.componentIds.map((id) => {
              const comp = ARCHITECTURE_COMPONENTS.find((c) => c.id === id);
              return comp ? (
                <button
                  key={id}
                  onClick={() => selectComponent(id)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded px-1.5 py-0.5 transition-colors"
                >
                  {comp.shortName}
                </button>
              ) : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssuesView() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Architecture Issues</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Documented and assessed architectural conditions. Evidence status indicates confidence level.
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {ARCHITECTURE_ISSUES.map((issue) => (
          <div key={issue.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">{issue.id}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize">
                    {issue.category}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded capitalize",
                      issue.evidenceStatus === "documented"
                        ? "bg-blue-100 text-blue-700"
                        : issue.evidenceStatus === "probable"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {issue.evidenceStatus}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      issue.remediationStatus === "completed"
                        ? "bg-green-100 text-green-700"
                        : issue.remediationStatus === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {issue.remediationStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="font-medium text-slate-800 mt-1">{issue.title}</div>
                <div className="text-sm text-slate-500 mt-0.5">{issue.description}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  Component:
                  <span className="text-blue-600 font-medium">
                    {ARCHITECTURE_COMPONENTS.find((c) => c.id === issue.componentId)?.name}
                  </span>
                  {issue.associatedRiskIds.length > 0 && (
                    <>
                      · Risks:
                      {issue.associatedRiskIds.map((id) => (
                        <span key={id} className="text-orange-600 font-medium">{id}</span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
