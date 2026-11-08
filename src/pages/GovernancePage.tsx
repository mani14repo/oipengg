import { useState } from "react";
import { cn } from "@/lib/utils";
import { GOVERNANCE_ARTIFACTS, ACTIONABLE_MAPPINGS } from "@/data/governanceArtifacts";
import { RISK_CATALOG } from "@/data/riskCatalog";
import type { GovernanceArtifact, ArtifactType } from "@/domain/governance";
import {
  BookOpen,
  TrendingUp,
  ClipboardCheck,
  BookMarked,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Link2,
} from "lucide-react";

// ── Meta ─────────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  ArtifactType,
  { label: string; plural: string; icon: React.ReactNode; borderColor: string; badgeClass: string }
> = {
  rca_playbook: {
    label: "RCA Playbook",
    plural: "RCA Playbooks",
    icon: <BookOpen size={13} />,
    borderColor: "border-t-violet-500",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  oip: {
    label: "OIP",
    plural: "Operational Improvement Plans",
    icon: <TrendingUp size={13} />,
    borderColor: "border-t-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  assessment: {
    label: "Assessment",
    plural: "Assessments",
    icon: <ClipboardCheck size={13} />,
    borderColor: "border-t-teal-500",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  standard: {
    label: "Standard",
    plural: "Standards",
    icon: <BookMarked size={13} />,
    borderColor: "border-t-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  policy: {
    label: "Policy",
    plural: "Policies",
    icon: <ShieldCheck size={13} />,
    borderColor: "border-t-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  active:     { label: "Active",     cls: "bg-green-50 text-green-700 border-green-200" },
  draft:      { label: "Draft",      cls: "bg-slate-100 text-slate-500 border-slate-200" },
  in_review:  { label: "In Review",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
  superseded: { label: "Superseded", cls: "bg-red-50 text-red-500 border-red-200" },
};

const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-red-50 text-red-700 border-red-200" },
  high:     { label: "High",     cls: "bg-orange-50 text-orange-700 border-orange-200" },
  medium:   { label: "Medium",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  low:      { label: "Low",      cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

const SEVERITY_CLS: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high:     "bg-orange-50 text-orange-700 border-orange-200",
  medium:   "bg-amber-50 text-amber-700 border-amber-200",
  low:      "bg-green-50 text-green-700 border-green-200",
  unknown:  "bg-slate-100 text-slate-500 border-slate-200",
};

const ALL_TYPES = Object.keys(TYPE_META) as ArtifactType[];

// ── Helpers ───────────────────────────────────────────────────────────────────

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border", cls)}>
      {children}
    </span>
  );
}

function ArtifactListItem({
  artifact,
  isSelected,
  onClick,
}: {
  artifact: GovernanceArtifact;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meta = TYPE_META[artifact.type];
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border-t-4 border border-slate-200 bg-white px-3 py-2.5 transition-all hover:shadow-md hover:-translate-y-0.5",
        meta.borderColor,
        isSelected && "ring-2 ring-blue-400 shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-mono text-slate-400">{artifact.documentRef}</div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{artifact.title}</div>
        </div>
        {isSelected && <ChevronRight size={14} className="text-blue-500 flex-shrink-0 mt-1" />}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Badge cls={meta.badgeClass}>{meta.icon}{meta.label}</Badge>
        <Badge cls={STATUS_META[artifact.status].cls}>{STATUS_META[artifact.status].label}</Badge>
      </div>
    </button>
  );
}

function ActionItem({ index, text }: { index: number; text: string }) {
  return (
    <li className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">
        {index}
      </span>
      <span className="text-sm text-slate-700">{text}</span>
    </li>
  );
}

function ArtifactDetail({ artifact }: { artifact: GovernanceArtifact }) {
  const meta = TYPE_META[artifact.type];
  const mappedRiskIds = artifact.applicableRiskIds;
  const mappedRisks = RISK_CATALOG.filter((r) => mappedRiskIds.includes(r.riskId));

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div className={cn("rounded-xl border-t-4 border border-slate-200 bg-white p-5 shadow-sm", meta.borderColor)}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs text-slate-400 mb-1">{artifact.documentRef} · v{artifact.version}</div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{artifact.title}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge cls={meta.badgeClass}>{meta.icon}{meta.label}</Badge>
              <Badge cls={STATUS_META[artifact.status].cls}>
                {artifact.status === "active" ? <CheckCircle size={10} /> : <Clock size={10} />}
                {STATUS_META[artifact.status].label}
              </Badge>
              {artifact.priority && (
                <Badge cls={PRIORITY_META[artifact.priority].cls}>
                  <AlertTriangle size={10} />
                  {PRIORITY_META[artifact.priority].label} Priority
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-slate-400">Owner</div>
            <div className="text-sm font-semibold text-slate-700 mt-0.5">{artifact.owner}</div>
            {artifact.lastReviewed && (
              <div className="text-xs text-slate-400 mt-1">Last reviewed: {artifact.lastReviewed}</div>
            )}
            {artifact.dueDate && (
              <div className="text-xs text-orange-600 font-medium mt-1">Due: {artifact.dueDate}</div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{artifact.description}</p>
      </div>

      {/* Two-column: mapped risks + mapped problems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mapped Risks */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mapped Risks</span>
            <span className="ml-auto text-xs font-mono text-slate-400">{mappedRisks.length} risk{mappedRisks.length !== 1 ? "s" : ""}</span>
          </div>
          {mappedRisks.length === 0 ? (
            <div className="text-sm text-slate-400 italic">No risk catalog entries mapped</div>
          ) : (
            <div className="flex flex-col gap-2">
              {mappedRisks.map((r) => (
                <div
                  key={r.riskId}
                  className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50"
                >
                  <span className={cn("font-mono text-xs font-bold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5", SEVERITY_CLS[r.severity])}>
                    {r.riskId}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700 leading-snug">{r.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.observedIncidentCount} incidents · {r.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapped Problem Records */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-teal-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mapped Problem Records</span>
            <span className="ml-auto text-xs font-mono text-slate-400">{artifact.applicableProblemIds.length} record{artifact.applicableProblemIds.length !== 1 ? "s" : ""}</span>
          </div>
          {artifact.applicableProblemIds.length === 0 ? (
            <div className="text-sm text-slate-400 italic">No open problem records mapped</div>
          ) : (
            <div className="flex flex-col gap-2">
              {artifact.applicableProblemIds.map((pid) => {
                const mapping = ACTIONABLE_MAPPINGS.find((m) => m.actionableId === pid);
                return (
                  <div key={pid} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                      {pid}
                    </span>
                    <div className="text-xs text-slate-500">
                      {mapping ? `Linked to ${mapping.artifactIds.length} artifact${mapping.artifactIds.length !== 1 ? "s" : ""}` : "Open investigation"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Key Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Actionable Items</span>
          <span className="ml-auto text-xs font-mono text-slate-400">{artifact.keyActions.length} items</span>
        </div>
        <ol className="list-none m-0 p-0">
          {artifact.keyActions.map((action, i) => (
            <ActionItem key={i} index={i + 1} text={action} />
          ))}
        </ol>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function GovernancePage() {
  const [activeType, setActiveType] = useState<ArtifactType | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(GOVERNANCE_ARTIFACTS[0].id);

  const filtered = activeType === "all"
    ? GOVERNANCE_ARTIFACTS
    : GOVERNANCE_ARTIFACTS.filter((a) => a.type === activeType);

  const selected = GOVERNANCE_ARTIFACTS.find((a) => a.id === selectedId) ?? GOVERNANCE_ARTIFACTS[0];

  const countsByType = ALL_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = GOVERNANCE_ARTIFACTS.filter((a) => a.type === t).length;
    return acc;
  }, {});

  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 bg-violet-400/15 border border-violet-400/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                <ShieldCheck size={10} />
                Governance
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">RCA &amp; Governance Mapping</h2>
            <p className="text-sm text-violet-200/70 mt-1">
              Actionable items mapped to RCA Playbooks, Operational Improvement Plans, Assessments, Standards, and Policies.
            </p>
          </div>
          {/* Summary counts */}
          <div className="flex items-center gap-3 flex-wrap">
            {ALL_TYPES.map((t) => {
              const m = TYPE_META[t];
              return (
                <div key={t} className="text-center">
                  <div className="text-lg font-bold text-white">{countsByType[t]}</div>
                  <div className="text-xs text-violet-300/70">{m.plural}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-8">
        {/* Type filters */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <Filter size={13} className="text-slate-400" />
          <button
            onClick={() => setActiveType("all")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
              activeType === "all"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            )}
          >
            All ({GOVERNANCE_ARTIFACTS.length})
          </button>
          {ALL_TYPES.map((t) => {
            const m = TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                  activeType === t
                    ? cn("border", m.badgeClass)
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                )}
              >
                {m.icon}
                {m.plural} ({countsByType[t]})
              </button>
            );
          })}
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-5 items-start">
          {/* Left: artifact list */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-2.5">
            {filtered.map((a) => (
              <ArtifactListItem
                key={a.id}
                artifact={a}
                isSelected={selectedId === a.id}
                onClick={() => setSelectedId(a.id)}
              />
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 min-w-0">
            <ArtifactDetail artifact={selected} />
          </div>
        </div>
      </div>
    </div>
  );
}
