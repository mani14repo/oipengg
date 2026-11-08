import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Activity,
  Link,
  Info,
  Wrench,
  FileText,
  Clock,
} from "lucide-react";

const MOCK_PROBLEMS = [
  {
    id: "PRB001",
    number: "PRB0012001",
    shortDescription: "DFM forecast job failures — capacity and pipeline stability",
    state: "in_progress" as const,
    rootCauseConfirmed: false,
    relatedIncidentIds: ["inc-r2-001", "inc-r2-002", "inc-r2-003"],
    riskId: "R2",
    openedAt: "2026-09-20",
    workaround: "Manual Databricks cluster restart",
    tasks: [
      { id: "ptsk-001-1", description: "Assess Databricks cluster capacity limits", state: "in_progress" as const, owner: "PUMA SRE" },
      { id: "ptsk-001-2", description: "Implement admission control for DFM requests", state: "open" as const, owner: "PUMA Engineering" },
      { id: "ptsk-001-3", description: "Evaluate checkpoint restart capability", state: "open" as const, owner: "PUMA Engineering" },
    ],
  },
  {
    id: "PRB002",
    number: "PRB0012101",
    shortDescription: "IRF-to-DFM trigger reliability — silent failures",
    state: "open" as const,
    rootCauseConfirmed: false,
    relatedIncidentIds: ["inc-h6-001"],
    riskId: "H6",
    openedAt: "2026-10-12",
    workaround: "Manual DFM trigger by SRE engineer",
    tasks: [
      { id: "ptsk-002-1", description: "Instrument IRF Python trigger with acknowledgment", state: "open" as const, owner: "PUMA Engineering" },
      { id: "ptsk-002-2", description: "Build reconciliation job for missed triggers", state: "open" as const, owner: "PUMA SRE" },
    ],
  },
  {
    id: "PRB003",
    number: "PRB0011801",
    shortDescription: "EOS UI performance degradation under concurrent load",
    state: "in_progress" as const,
    rootCauseConfirmed: false,
    relatedIncidentIds: ["inc-h7-001"],
    riskId: "H7",
    openedAt: "2026-08-25",
    workaround: "Advise users to stagger model submissions",
    tasks: [
      { id: "ptsk-003-1", description: "Profile AKS resource utilization during peak load", state: "in_progress" as const, owner: "PUMA EOS" },
      { id: "ptsk-003-2", description: "Evaluate Comp Engine API response times", state: "open" as const, owner: "PUMA EOS" },
    ],
  },
];

const STATE_LABELS = {
  open: { label: "Open", color: "bg-gray-100 text-gray-600" },
  known_error: { label: "Known Error", color: "bg-orange-100 text-orange-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-500" },
};

const TASK_STATE_LABELS = {
  open: { label: "Open", color: "text-gray-500" },
  in_progress: { label: "In Progress", color: "text-blue-600" },
  closed: { label: "Closed", color: "text-green-600" },
};

export function SystemicFixesExplorer() {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [view, setView] = useState<"pipeline" | "actions">("pipeline");

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2">
        {[
          { id: "pipeline", label: "Investigation Pipeline" },
          { id: "actions", label: "Corrective Actions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as typeof view)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === tab.id ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RCA chain reminder */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Systemic Fix Chain
        </h3>
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          {[
            "Recurring Pattern",
            "Problem Investigation",
            "Root Cause",
            "Corrective Action",
            "P-Task",
            "Change Implementation",
            "Post-Fix Validation",
            "Reduced Recurrence",
          ].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                {step}
              </span>
              {i < arr.length - 1 && <ArrowRight size={12} className="text-slate-300" />}
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700 flex items-start gap-2">
          <Info size={12} className="mt-0.5 shrink-0" />
          Not every link necessarily exists. Missing relationships are shown explicitly rather than
          assumed. A missing Change reference does not automatically imply no remediation occurred.
        </div>
      </div>

      {view === "pipeline" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {MOCK_PROBLEMS.map((problem) => {
            const isSelected = selectedProblem === problem.id;
            const stateInfo = STATE_LABELS[problem.state];

            return (
              <div
                key={problem.id}
                className={cn(
                  "bg-white rounded-xl border-2 p-4 shadow-sm transition-all",
                  isSelected ? "border-blue-500" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedProblem(isSelected ? null : problem.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-slate-400">{problem.number}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", stateInfo.color)}>
                          {stateInfo.label}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                          {problem.riskId}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 mt-1">
                        {problem.shortDescription}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">Incidents</div>
                      <div className="text-lg font-bold text-slate-700">
                        {problem.relatedIncidentIds.length}
                      </div>
                    </div>
                  </div>

                  {/* Root cause status */}
                  <div className="mt-2 flex items-center gap-2">
                    {problem.rootCauseConfirmed ? (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={12} />
                        Root cause confirmed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <HelpCircle size={12} />
                        Root cause not confirmed
                      </div>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">Opened {problem.openedAt}</span>
                  </div>
                </button>

                {/* Workaround */}
                {problem.workaround && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
                    <span className="font-medium">Workaround: </span>
                    {problem.workaround}
                  </div>
                )}

                {/* Tasks */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      Problem Tasks
                    </div>
                    <div className="space-y-2">
                      {problem.tasks.map((task) => {
                        const taskState = TASK_STATE_LABELS[task.state];
                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-2 p-2 bg-slate-50 border border-slate-200 rounded"
                          >
                            <Activity size={12} className={cn("mt-0.5 shrink-0", taskState.color)} />
                            <div className="flex-1">
                              <div className="text-xs text-slate-700">{task.description}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-xs font-medium", taskState.color)}>
                                  {taskState.label}
                                </span>
                                <span className="text-xs text-slate-400">{task.owner}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Missing links */}
                    <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 flex items-start gap-2">
                      <Link size={11} className="mt-0.5 shrink-0" />
                      Change records and post-fix validation: not yet linked. ServiceNow API
                      integration required for live relationship data.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === "actions" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Corrective Actions</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Engineering work items derived from Problem investigations. Connect ServiceNow API and
              Jira/Rally integration for complete data.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_PROBLEMS.flatMap((p) =>
              p.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700">{task.description}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {p.number} · {p.riskId}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded",
                      task.state === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : (task.state as string) === "closed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {TASK_STATE_LABELS[task.state].label}
                  </span>
                  <span className="text-xs text-slate-400">{task.owner}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400 italic">
                    <Clock size={11} />
                    No target date
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
