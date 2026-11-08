import { useState, useMemo } from "react";
import { JOURNEY_STAGES } from "@/data/pumaJourney";
import { RISK_CATALOG } from "@/data/riskCatalog";
import {
  STAGE_RISKS, GOV, STAGE_ARCH, HANDOFFS, CONTROLS, AREA_LABELS,
} from "@/data/stageAnalysis";

// ── Design tokens ─────────────────────────────────────────────────────────────
const ACCENT = "#1d4f91";
const ACCENT_BG = "#e7effa";
const RED = "#c0392b";    const RED_BG   = "#fdf0ef";
const AMBER = "#b45309";  const AMBER_BG  = "#fffbeb";
const GREEN = "#15803d";  const GREEN_BG  = "#f0fdf4";
const GREY = "#6b7280";   const GREY_BG   = "#f9fafb";
const TEAL = "#0f766e";   const TEAL_BG   = "#f0fdfa";
const VIOLET = "#6d28d9"; const VIOLET_BG = "#f5f3ff";
const PAGE_BG = "#f3f5f8";
const SURFACE2 = "#f7f9fc";
const BORDER = "#e5e7eb";

const LENSES = [
  { num: "01", title: "Risks & causes",    sub: "identified risks per stage" },
  { num: "02", title: "Risks → incidents", sub: "incident log by risk" },
  { num: "03", title: "Architecture",      sub: "coverage & gaps" },
  { num: "04", title: "Actions",           sub: "controls & remediation" },
];

const RISK_SEV: Record<string, "critical" | "high" | "medium"> = {
  R5: "critical", R2: "critical",
  R1: "high", H7: "high", R4: "high",
  R3: "medium", H6: "medium", H8: "medium",
};

function riskColor(riskId: string): { fg: string; bg: string } {
  const s = RISK_SEV[riskId] ?? "medium";
  if (s === "critical") return { fg: RED, bg: RED_BG };
  if (s === "high")     return { fg: AMBER, bg: AMBER_BG };
  return                       { fg: TEAL, bg: TEAL_BG };
}

function getStageLensColor(stageId: number, lens: number): string {
  if (lens === 0) {
    const r = STAGE_RISKS[stageId] ?? [];
    if (r.some(x => RISK_SEV[x.riskId] === "critical")) return RED;
    if (r.some(x => RISK_SEV[x.riskId] === "high"))     return AMBER;
    if (r.length > 0)                                    return GREY;
    return BORDER;
  }
  if (lens === 1) {
    const n = JOURNEY_STAGES.find(s => s.id === stageId)?.incidentCount ?? 0;
    if (n >= 15) return RED;
    if (n >= 8)  return AMBER;
    if (n >= 1)  return GREEN;
    return BORDER;
  }
  const cts = CONTROLS.filter(c => c.stages.includes(stageId));
  if (lens === 2) {
    if (cts.some(c => c.priority === "P0" && c.status === "Documented gap")) return RED;
    if (cts.some(c => c.priority === "P0"))  return AMBER;
    if (cts.length > 0)                      return GREEN;
    return BORDER;
  }
  if (cts.some(c => c.priority === "P0")) return RED;
  if (cts.some(c => c.priority === "P1")) return AMBER;
  return BORDER;
}

const CONF_LABEL: Record<string, string> = {
  obs: "Observed", doc: "Documented", hyp: "Hypothesised", con: "Confirmed", gap: "Evidence gap",
};
const CONF_COLOR: Record<string, { fg: string; bg: string }> = {
  obs: { fg: AMBER,  bg: AMBER_BG  },
  doc: { fg: GREEN,  bg: GREEN_BG  },
  hyp: { fg: GREY,   bg: GREY_BG   },
  con: { fg: ACCENT, bg: ACCENT_BG },
  gap: { fg: RED,    bg: RED_BG    },
};

const CTRL_STATUS_COLOR: Record<string, { fg: string; bg: string }> = {
  "Documented gap": { fg: RED,    bg: RED_BG   },
  "Not assessed":   { fg: GREY,   bg: GREY_BG  },
  "Partial":        { fg: AMBER,  bg: AMBER_BG },
  "Established":    { fg: GREEN,  bg: GREEN_BG },
};

const HO_STATUS_COLOR: Record<string, { fg: string; bg: string }> = {
  "Not established": { fg: RED,   bg: RED_BG   },
  "Gap observed":    { fg: RED,   bg: RED_BG   },
  "Not monitored":   { fg: AMBER, bg: AMBER_BG },
  "Partial":         { fg: AMBER, bg: AMBER_BG },
  "Partial (email)": { fg: AMBER, bg: AMBER_BG },
  "Established":     { fg: GREEN, bg: GREEN_BG },
};

// ── Chip / Badge helpers ──────────────────────────────────────────────────────
function Chip({ label, fg, bg, mono = false }: { label: string; fg: string; bg: string; mono?: boolean }) {
  return (
    <span style={{
      display: "inline-block", fontFamily: mono ? "var(--font-mono, monospace)" : undefined,
      fontSize: 11, fontWeight: 600, lineHeight: 1,
      background: bg, color: fg, border: `1px solid ${fg}22`,
      borderRadius: 4, padding: "2px 6px",
    }}>
      {label}
    </span>
  );
}

function PriorityChip({ priority }: { priority: string }) {
  const style = priority === "P0"
    ? { fg: RED, bg: RED_BG }
    : priority === "P1" ? { fg: AMBER, bg: AMBER_BG } : { fg: GREY, bg: GREY_BG };
  return <Chip label={priority} fg={style.fg} bg={style.bg} mono />;
}

// ── Page Header ───────────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <header style={{ background: ACCENT, color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: 17,
        background: "#fff", color: ACCENT, padding: "3px 9px", borderRadius: 4, flexShrink: 0,
      }}>
        PUMA
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>
          Pharmacy / PBM Underwriting &amp; Modelling Analytics
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 2 }}>
          FSI / REO Assessment · CVS Health · Mock Composite · Nov 2026
        </div>
      </div>
      <div style={{ marginLeft: "auto", border: "1px solid rgba(255,255,255,.4)", padding: "3px 11px", borderRadius: 12, fontSize: 11.5, flexShrink: 0 }}>
        Mock data
      </div>
    </header>
  );
}

// ── Lens Tabs ─────────────────────────────────────────────────────────────────
function LensTabs({ activeLens, onSelect }: { activeLens: number; onSelect: (n: number) => void }) {
  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${BORDER}`,
      display: "flex", gap: 0, padding: "0 4px",
    }}>
      {LENSES.map((l, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            background: "none", border: "none", borderBottom: `3px solid ${i === activeLens ? ACCENT : "transparent"}`,
            padding: "9px 14px 8px", cursor: "pointer", textAlign: "left",
            display: "flex", flexDirection: "column", gap: 1, transition: "border-color .15s",
            marginBottom: -1,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: GREY, fontWeight: 500 }}>
            <span style={{ marginRight: 4 }}>{l.num}</span>
            <span style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontSize: 15, fontWeight: 700, color: i === activeLens ? ACCENT : "#111827" }}>
              {l.title}
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11, color: GREY }}>{l.sub}</div>
        </button>
      ))}
    </div>
  );
}

// ── KPI Bar ───────────────────────────────────────────────────────────────────
function KpiBar({ lens }: { lens: number }) {
  const tiles = useMemo(() => {
    if (lens === 0) {
      const all = Object.values(STAGE_RISKS).flat();
      const crit = all.filter(r => RISK_SEV[r.riskId] === "critical").length;
      const stCrit = Object.entries(STAGE_RISKS).filter(([, r]) => r.some(x => RISK_SEV[x.riskId] === "critical")).length;
      return [
        { v: all.length.toString(),   l: "Stage-risk items" },
        { v: "8",                     l: "Risk types identified" },
        { v: crit.toString(),         l: "Critical-risk occurrences" },
        { v: stCrit.toString(),       l: "Stages with critical risk" },
      ];
    }
    if (lens === 1) {
      const total = JOURNEY_STAGES.reduce((s, st) => s + st.incidentCount, 0);
      const max = Math.max(...JOURNEY_STAGES.map(s => s.incidentCount));
      const topStage = JOURNEY_STAGES.find(s => s.incidentCount === max);
      const high = JOURNEY_STAGES.filter(s => s.incidentCount >= 15).length;
      return [
        { v: total.toString(),                      l: "Total incidents" },
        { v: Math.round(total / 12).toString(),     l: "Avg per stage" },
        { v: `Stg ${topStage?.id ?? "—"} (${max})`, l: "Most-affected stage" },
        { v: high.toString(),                        l: "Stages with 15+ incidents" },
      ];
    }
    if (lens === 2) {
      const p0 = CONTROLS.filter(c => c.priority === "P0").length;
      const gaps = CONTROLS.filter(c => c.status === "Documented gap").length;
      const na = CONTROLS.filter(c => c.status === "Not assessed").length;
      return [
        { v: CONTROLS.length.toString(), l: "Total controls" },
        { v: p0.toString(),              l: "P0 priority" },
        { v: gaps.toString(),            l: "Documented gaps" },
        { v: na.toString(),              l: "Not yet assessed" },
      ];
    }
    const p0 = CONTROLS.filter(c => c.priority === "P0").length;
    const p1 = CONTROLS.filter(c => c.priority === "P1").length;
    const stP0 = new Set(CONTROLS.filter(c => c.priority === "P0").flatMap(c => c.stages)).size;
    return [
      { v: CONTROLS.length.toString(), l: "Total actions" },
      { v: p0.toString(),              l: "P0 — immediate" },
      { v: p1.toString(),              l: "P1 — planned" },
      { v: stP0.toString(),            l: "Stages with P0 actions" },
    ];
  }, [lens]);

  return (
    <div style={{ padding: "10px 20px", background: "#fff", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 12 }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 16px", flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 24, lineHeight: 1.1, color: ACCENT, fontVariantNumeric: "tabular-nums" }}>
            {t.v}
          </div>
          <div style={{ fontSize: 10.5, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: GREY, marginTop: 2 }}>
            {t.l}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stage card lens content ───────────────────────────────────────────────────
function StageCardContent({ stageId, lens }: { stageId: number; lens: number }) {
  if (lens === 0) {
    const risks = STAGE_RISKS[stageId] ?? [];
    const unique = [...new Set(risks.map(r => r.riskId))];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
        {unique.map(id => {
          const { fg, bg } = riskColor(id);
          return (
            <span key={id} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, fontWeight: 700, background: bg, color: fg, border: `1px solid ${fg}30`, borderRadius: 3, padding: "1px 5px" }}>
              {id}
            </span>
          );
        })}
      </div>
    );
  }
  if (lens === 1) {
    const stage = JOURNEY_STAGES.find(s => s.id === stageId);
    const n = stage?.incidentCount ?? 0;
    const color = n >= 15 ? RED : n >= 8 ? AMBER : n >= 1 ? GREEN : GREY;
    return (
      <div style={{ marginTop: 7 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color, fontVariantNumeric: "tabular-nums" }}>
          {n} <span style={{ fontSize: 10, fontWeight: 500, color: GREY }}>incidents</span>
        </div>
        <div style={{ background: "#e5e7eb", borderRadius: 2, height: 4, marginTop: 4, overflow: "hidden" }}>
          <div style={{ background: color, borderRadius: 2, height: "100%", width: `${Math.min(100, (n / 20) * 100)}%` }} />
        </div>
      </div>
    );
  }
  if (lens === 2) {
    const arch = STAGE_ARCH[stageId];
    const cts = CONTROLS.filter(c => c.stages.includes(stageId));
    return (
      <div style={{ marginTop: 6 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {(arch?.areas ?? []).map(a => (
            <span key={a} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}22`, borderRadius: 3, padding: "1px 5px" }}>
              {a}
            </span>
          ))}
        </div>
        {cts.length > 0 && (
          <div style={{ fontSize: 10.5, color: GREY, marginTop: 4 }}>
            {cts.filter(c => c.priority === "P0").length > 0 && (
              <span style={{ color: RED, fontWeight: 600, marginRight: 6 }}>
                {cts.filter(c => c.priority === "P0").length} P0
              </span>
            )}
            {cts.filter(c => c.priority === "P1").length > 0 && (
              <span style={{ color: AMBER, fontWeight: 600 }}>
                {cts.filter(c => c.priority === "P1").length} P1
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
  // lens 3 — actions
  const cts = CONTROLS.filter(c => c.stages.includes(stageId));
  const p0 = cts.filter(c => c.priority === "P0").length;
  const p1 = cts.filter(c => c.priority === "P1").length;
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 7, alignItems: "center" }}>
      {p0 > 0 && <span style={{ background: RED_BG, color: RED, fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 700, border: `1px solid ${RED}30`, borderRadius: 3, padding: "1px 6px" }}>{p0} P0</span>}
      {p1 > 0 && <span style={{ background: AMBER_BG, color: AMBER, fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 700, border: `1px solid ${AMBER}30`, borderRadius: 3, padding: "1px 6px" }}>{p1} P1</span>}
      {p0 === 0 && p1 === 0 && <span style={{ fontSize: 11, color: GREY }}>no actions</span>}
    </div>
  );
}

// ── Stage Card ────────────────────────────────────────────────────────────────
function StageCard({ stageId, lens, isSelected, onSelect }: {
  stageId: number; lens: number; isSelected: boolean; onSelect: () => void;
}) {
  const stage = JOURNEY_STAGES.find(s => s.id === stageId);
  const lensColor = getStageLensColor(stageId, lens);
  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? "#fff" : SURFACE2,
        border: `1px solid ${isSelected ? ACCENT : BORDER}`,
        borderTopWidth: 4, borderTopColor: lensColor, borderTopStyle: "solid",
        borderRadius: 10, padding: "10px 12px", cursor: "pointer",
        boxShadow: isSelected ? `0 0 0 1px ${ACCENT}` : undefined,
        transition: "box-shadow .15s, border-color .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%", background: ACCENT_BG, color: ACCENT,
          fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600,
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          {stageId}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {stage?.name ?? `Stage ${stageId}`}
          </div>
          <div style={{ fontSize: 10.5, color: GREY, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {stage?.primarySystem ?? ""}
          </div>
        </div>
      </div>
      <StageCardContent stageId={stageId} lens={lens} />
    </div>
  );
}

// ── Journey Lane ──────────────────────────────────────────────────────────────
function JourneyLane({ lens, selectedId, onSelect }: {
  lens: number; selectedId: number | null; onSelect: (id: number) => void;
}) {
  const stageIds = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 14, color: "#111827" }}>
            12-Stage PUMA Journey
          </div>
          <div style={{ fontSize: 11, color: GREY }}>Click a stage to drill in · Lens: {LENSES[lens].title}</div>
          {selectedId !== null && (
            <button onClick={() => onSelect(selectedId)} style={{ marginLeft: "auto", fontSize: 11, color: GREY, background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4 }}>
              ✕ clear
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {stageIds.map(id => (
            <StageCard
              key={id}
              stageId={id}
              lens={lens}
              isSelected={selectedId === id}
              onSelect={() => onSelect(id)}
            />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: AMBER, background: AMBER_BG, border: `1px solid ${AMBER}22`, borderRadius: 5, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>↺</span>
          A revision at stage 10 restarts from stage 4 — amplifying DFM capacity pressure (R2) and reproducibility risk (R1).
        </div>
      </div>
    </div>
  );
}

// ── Lens 0 Detail: Risks & Causes ─────────────────────────────────────────────
function Lens0Detail({ stageId }: { stageId: number }) {
  const risks = STAGE_RISKS[stageId] ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    risks.forEach(r => {
      const existing = map.get(r.riskId) ?? [];
      map.set(r.riskId, [...existing, r.causeText]);
    });
    return map;
  }, [risks]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {grouped.size === 0 && (
        <div style={{ color: GREY, fontSize: 13, fontStyle: "italic" }}>No identified risks for this stage.</div>
      )}
      {[...grouped.entries()].map(([riskId, causes]) => {
        const rc = RISK_CATALOG.find(r => r.riskId === riskId);
        const { fg, bg } = riskColor(riskId);
        const gov = GOV[riskId];
        return (
          <div key={riskId} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
            {/* Risk header */}
            <div style={{ padding: "10px 14px 8px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" as const }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, fontWeight: 700, background: bg, color: fg, border: `1px solid ${fg}30`, borderRadius: 4, padding: "2px 7px" }}>
                {riskId}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{rc?.name ?? riskId}</span>
              <Chip label={rc?.severity ?? "unknown"} fg={fg} bg={bg} />
              {rc?.observedIncidentCount !== undefined && (
                <span style={{ fontSize: 11, color: GREY, marginLeft: "auto" }}>{rc.observedIncidentCount} incidents observed</span>
              )}
            </div>
            {/* Causes */}
            <div style={{ padding: "8px 14px", background: SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: GREY, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 5 }}>Causes in this stage</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 3 }}>
                {causes.map((c, i) => <li key={i} style={{ fontSize: 12.5, color: "#374151" }}>{c}</li>)}
              </ul>
            </div>
            {/* Two tracks */}
            {gov && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: "none" }}>
                {/* RCA track */}
                <div style={{ padding: "10px 14px", borderRight: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: VIOLET, marginBottom: 6 }}>
                    ● RCA direction
                  </div>
                  <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.55, margin: 0 }}>{gov.direction}</p>
                </div>
                {/* Governance track */}
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: TEAL, marginBottom: 6 }}>
                    ● Governance templates
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {gov.templates.map(t => (
                      <div key={t.refId} style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, background: TEAL_BG, color: TEAL, border: `1px solid ${TEAL}22`, borderRadius: 3, padding: "1px 6px", flexShrink: 0 }}>
                          {t.refId}
                        </span>
                        <span style={{ fontSize: 12, color: "#374151" }}>{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Lens 1 Detail: Incidents ───────────────────────────────────────────────────
function Lens1Detail({ stageId }: { stageId: number }) {
  const stage = JOURNEY_STAGES.find(s => s.id === stageId);
  const n = stage?.incidentCount ?? 0;
  const color = n >= 15 ? RED : n >= 8 ? AMBER : n >= 1 ? GREEN : GREY;
  const risks = [...new Set((STAGE_RISKS[stageId] ?? []).map(r => r.riskId))];
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16 }}>
      <div style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 36, color, fontVariantNumeric: "tabular-nums" }}>
        {n}
        <span style={{ fontSize: 14, fontWeight: 500, color: GREY, marginLeft: 6 }}>observed incidents</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 4, height: 8, marginTop: 10, overflow: "hidden" }}>
        <div style={{ background: color, borderRadius: 4, height: "100%", width: `${Math.min(100, (n / 25) * 100)}%`, transition: "width .4s" }} />
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" as const }}>
        {risks.map(id => {
          const rc = RISK_CATALOG.find(r => r.riskId === id);
          const { fg, bg } = riskColor(id);
          return (
            <div key={id} style={{ background: bg, border: `1px solid ${fg}22`, borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: fg }}>{id}</span>
              <span style={{ color: "#374151", marginLeft: 6 }}>{rc?.name ?? id}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: GREY, fontStyle: "italic" }}>
        Incident count is a composite from the Jul–Oct 2026 ServiceNow window. Click another stage to compare.
      </div>
    </div>
  );
}

// ── Lens 2 Detail: Architecture ───────────────────────────────────────────────
function Lens2Detail({ stageId }: { stageId: number }) {
  const arch = STAGE_ARCH[stageId];
  const stageControls = CONTROLS.filter(c => c.stages.includes(stageId));
  const stageHandoffs = HANDOFFS.filter(h => h.fromStage === stageId || h.toStage === stageId);
  if (!arch) return <div style={{ color: GREY, fontStyle: "italic" }}>No architecture data for this stage.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Areas + components */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: GREY, marginBottom: 8 }}>Capability areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {arch.areas.map(a => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}22`, borderRadius: 3, padding: "2px 6px" }}>{a}</span>
                  <span style={{ fontSize: 11, color: GREY }}>{AREA_LABELS[a]}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: GREY, marginBottom: 8 }}>Components</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {arch.components.map((c, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "#374151" }}>• {c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Exposures */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, fontSize: 12.5 }}>Exposures</div>
        {arch.exposures.map((e, i) => {
          const cc = CONF_COLOR[e.confidence] ?? { fg: GREY, bg: GREY_BG };
          return (
            <div key={i} style={{ padding: "9px 16px", borderBottom: i < arch.exposures.length - 1 ? `1px solid ${BORDER}` : undefined, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ background: cc.bg, color: cc.fg, fontSize: 10, fontWeight: 600, border: `1px solid ${cc.fg}22`, borderRadius: 3, padding: "2px 5px", flexShrink: 0, marginTop: 1 }}>
                {CONF_LABEL[e.confidence]}
              </span>
              <span style={{ fontSize: 12.5, color: "#374151" }}>{e.text}</span>
            </div>
          );
        })}
      </div>
      {/* Controls */}
      {stageControls.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, fontSize: 12.5 }}>Controls ({stageControls.length})</div>
          {stageControls.map((c, i) => {
            const sc = CTRL_STATUS_COLOR[c.status] ?? { fg: GREY, bg: GREY_BG };
            return (
              <div key={c.id} style={{ padding: "9px 16px", borderBottom: i < stageControls.length - 1 ? `1px solid ${BORDER}` : undefined, display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 700, color: ACCENT, background: ACCENT_BG, border: `1px solid ${ACCENT}22`, borderRadius: 3, padding: "2px 6px" }}>{c.id}</span>
                <div>
                  <div style={{ fontSize: 12.5, color: "#111827", fontWeight: 500 }}>{c.question}</div>
                  <div style={{ fontSize: 11, color: GREY, marginTop: 1 }}>{c.component} · {c.owner}</div>
                </div>
                <PriorityChip priority={c.priority} />
                <span style={{ background: sc.bg, color: sc.fg, fontSize: 10.5, fontWeight: 600, border: `1px solid ${sc.fg}22`, borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" as const }}>{c.status}</span>
              </div>
            );
          })}
        </div>
      )}
      {/* Handoffs */}
      {stageHandoffs.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, fontSize: 12.5 }}>Handoffs</div>
          {stageHandoffs.map((h, i) => {
            const hc = HO_STATUS_COLOR[h.status] ?? { fg: GREY, bg: GREY_BG };
            return (
              <div key={i} style={{ padding: "9px 16px", borderBottom: i < stageHandoffs.length - 1 ? `1px solid ${BORDER}` : undefined, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: GREY, marginTop: 1 }}>Stg {h.fromStage} → Stg {h.toStage}</div>
                </div>
                <div style={{ fontSize: 12, color: "#374151" }}>{h.type}</div>
                <span style={{ background: hc.bg, color: hc.fg, fontSize: 10.5, fontWeight: 600, border: `1px solid ${hc.fg}22`, borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" as const }}>{h.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Lens 3 Detail: Actions ────────────────────────────────────────────────────
function Lens3Detail({ stageId }: { stageId: number }) {
  const cts = CONTROLS.filter(c => c.stages.includes(stageId))
    .sort((a, b) => a.priority.localeCompare(b.priority));
  if (cts.length === 0) {
    return <div style={{ color: GREY, fontStyle: "italic", fontSize: 13 }}>No controls or actions identified for this stage.</div>;
  }
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
      {cts.map((c, i) => {
        const sc = CTRL_STATUS_COLOR[c.status] ?? { fg: GREY, bg: GREY_BG };
        const { fg: rfg, bg: rbg } = riskColor(c.riskId);
        return (
          <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < cts.length - 1 ? `1px solid ${BORDER}` : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11.5, fontWeight: 700, color: ACCENT, background: ACCENT_BG, border: `1px solid ${ACCENT}22`, borderRadius: 4, padding: "2px 7px" }}>{c.id}</span>
              <PriorityChip priority={c.priority} />
              <span style={{ background: rfg + "15", color: rfg, fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, border: `1px solid ${rfg}25`, borderRadius: 3, padding: "1px 5px" }}>{c.riskId}</span>
              <span style={{ background: sc.bg, color: sc.fg, fontSize: 10.5, fontWeight: 600, border: `1px solid ${sc.fg}22`, borderRadius: 3, padding: "2px 7px", marginLeft: "auto" }}>{c.status}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{c.question}</div>
            <div style={{ marginTop: 5, display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 11.5, color: GREY }}>{c.component}</span>
              <span style={{ fontSize: 11.5, color: GREY }}>Owner: {c.owner}</span>
              <span style={{ fontSize: 11.5, color: GREY }}>Ref: {c.assessmentRef}</span>
              <span style={{ fontSize: 11.5, color: GREY }}>Evidence: {c.evidence}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Stage Detail Panel ────────────────────────────────────────────────────────
function StageDetail({ stageId, lens, onClose }: { stageId: number; lens: number; onClose: () => void }) {
  const stage = JOURNEY_STAGES.find(s => s.id === stageId);
  const lensColor = getStageLensColor(stageId, lens);
  return (
    <div style={{ padding: "16px 20px 24px" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        {/* Detail header */}
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, background: SURFACE2 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: lensColor, color: "#fff", fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: 12, display: "grid", placeItems: "center", flexShrink: 0 }}>
            {stageId}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 17 }}>
              Stage {stageId} — {stage?.name ?? `Stage ${stageId}`}
            </div>
            <div style={{ fontSize: 12, color: GREY, marginTop: 1 }}>
              {stage?.primarySystem} · {stage?.actor}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: GREY, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "2px 8px" }}>
              {LENSES[lens].num} {LENSES[lens].title}
            </span>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", color: GREY }}>
              ✕ close
            </button>
          </div>
        </div>
        {/* Detail body */}
        <div style={{ padding: "16px 18px" }}>
          {lens === 0 && <Lens0Detail stageId={stageId} />}
          {lens === 1 && <Lens1Detail stageId={stageId} />}
          {lens === 2 && <Lens2Detail stageId={stageId} />}
          {lens === 3 && <Lens3Detail stageId={stageId} />}
        </div>
      </div>
    </div>
  );
}

// ── Overview: Lens 0 ─────────────────────────────────────────────────────────
function Lens0Overview() {
  return (
    <div style={{ padding: "16px 20px 24px" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 15, background: SURFACE2 }}>
          Risk Catalogue — click a stage above to drill in
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SURFACE2 }}>
              {["Risk", "Name", "Severity", "Incidents", "Affected stages", "Category"].map(h => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GREY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RISK_CATALOG.map((r, i) => {
              const { fg, bg } = riskColor(r.riskId);
              const affectedStages = Object.entries(STAGE_RISKS)
                .filter(([, risks]) => risks.some(x => x.riskId === r.riskId))
                .map(([id]) => id);
              return (
                <tr key={r.riskId} style={{ background: i % 2 === 0 ? "#fff" : SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: 12, background: bg, color: fg, border: `1px solid ${fg}30`, borderRadius: 4, padding: "2px 7px" }}>{r.riskId}</span>
                  </td>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: "#111827" }}>{r.name}</td>
                  <td style={{ padding: "9px 14px" }}><Chip label={r.severity} fg={fg} bg={bg} /></td>
                  <td style={{ padding: "9px 14px", fontVariantNumeric: "tabular-nums", color: fg, fontWeight: 700 }}>{r.observedIncidentCount}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {affectedStages.map(s => (
                        <span key={s} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, background: ACCENT_BG, color: ACCENT, borderRadius: 3, padding: "1px 5px" }}>Stg {s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "9px 14px", color: GREY }}>{r.category}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Overview: Lens 1 ─────────────────────────────────────────────────────────
function Lens1Overview() {
  const sorted = [...JOURNEY_STAGES].sort((a, b) => b.incidentCount - a.incidentCount);
  return (
    <div style={{ padding: "16px 20px 24px" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 15, background: SURFACE2 }}>
          Incidents by Stage — click a stage above to view associated risks
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SURFACE2 }}>
              {["Stage", "Name", "System", "Incidents", "Risk exposure", "Reliability"].map(h => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GREY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const n = s.incidentCount;
              const color = n >= 15 ? RED : n >= 8 ? AMBER : n >= 1 ? GREEN : GREY;
              const riskIds = [...new Set((STAGE_RISKS[s.id] ?? []).map(r => r.riskId))];
              return (
                <tr key={s.id} style={{ background: i % 2 === 0 ? "#fff" : SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "9px 14px", fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: ACCENT }}>{s.id}</td>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: "#111827" }}>{s.name}</td>
                  <td style={{ padding: "9px 14px", color: GREY }}>{s.primarySystem}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color, fontVariantNumeric: "tabular-nums", minWidth: 24 }}>{n}</span>
                      <div style={{ background: "#e5e7eb", borderRadius: 2, height: 6, width: 80, overflow: "hidden" }}>
                        <div style={{ background: color, height: "100%", width: `${Math.min(100, (n / 25) * 100)}%`, borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {riskIds.map(id => { const { fg, bg } = riskColor(id); return <Chip key={id} label={id} fg={fg} bg={bg} mono />; })}
                    </div>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ fontSize: 11.5, color: s.reliability === "degraded" ? RED : s.reliability === "unknown" ? GREY : GREEN }}>
                      {s.reliability ?? "unknown"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Overview: Lens 2 ─────────────────────────────────────────────────────────
function Lens2Overview() {
  return (
    <div style={{ padding: "16px 20px 24px" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 15, background: SURFACE2 }}>
          Architecture Controls — click a stage above to see exposures
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SURFACE2 }}>
              {["Control", "Stages", "Component", "Question", "Priority", "Status", "Owner"].map(h => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GREY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONTROLS.sort((a, b) => a.priority.localeCompare(b.priority)).map((c, i) => {
              const sc = CTRL_STATUS_COLOR[c.status] ?? { fg: GREY, bg: GREY_BG };
              return (
                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "9px 14px" }}><span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11.5, fontWeight: 700, color: ACCENT }}>{c.id}</span></td>
                  <td style={{ padding: "9px 14px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {c.stages.map(s => <span key={s} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, background: ACCENT_BG, color: ACCENT, borderRadius: 3, padding: "1px 4px" }}>{s}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: "9px 14px", color: GREY, fontSize: 12 }}>{c.component}</td>
                  <td style={{ padding: "9px 14px", color: "#374151", maxWidth: 300 }}>{c.question}</td>
                  <td style={{ padding: "9px 14px" }}><PriorityChip priority={c.priority} /></td>
                  <td style={{ padding: "9px 14px" }}><span style={{ background: sc.bg, color: sc.fg, fontSize: 10.5, fontWeight: 600, border: `1px solid ${sc.fg}22`, borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" as const }}>{c.status}</span></td>
                  <td style={{ padding: "9px 14px", color: GREY, fontSize: 12 }}>{c.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Overview: Lens 3 ─────────────────────────────────────────────────────────
function Lens3Overview() {
  const p0 = CONTROLS.filter(c => c.priority === "P0");
  const p1 = CONTROLS.filter(c => c.priority === "P1");
  return (
    <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {[{ label: "P0 — Immediate actions", items: p0, fg: RED, bg: RED_BG }, { label: "P1 — Planned actions", items: p1, fg: AMBER, bg: AMBER_BG }].map(({ label, items, fg, bg }) => (
        <div key={label} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 18px", borderBottom: `1px solid ${BORDER}`, background: bg, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display, 'IBM Plex Sans Condensed', sans-serif)", fontWeight: 700, fontSize: 14, color: fg }}>{label}</span>
            <span style={{ fontSize: 12, color: fg, opacity: 0.7 }}>{items.length} items</span>
          </div>
          {items.map((c, i) => {
            const { fg: rfg } = riskColor(c.riskId);
            return (
              <div key={c.id} style={{ padding: "10px 18px", borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : undefined, display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 12, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, fontWeight: 700, color: ACCENT, background: ACCENT_BG, border: `1px solid ${ACCENT}22`, borderRadius: 3, padding: "2px 7px" }}>{c.id}</span>
                <span style={{ background: rfg + "18", color: rfg, fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, border: `1px solid ${rfg}25`, borderRadius: 3, padding: "1px 5px" }}>{c.riskId}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{c.question}</div>
                  <div style={{ fontSize: 11, color: GREY, marginTop: 2 }}>{c.component} · Stg {c.stages.join(", ")} · {c.owner}</div>
                </div>
                <span style={{ fontSize: 11, color: GREY, fontFamily: "var(--font-mono, monospace)", whiteSpace: "nowrap" as const }}>{c.assessmentRef}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function JourneyIntelligencePage() {
  const [activeLens, setActiveLens] = useState(0);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  function handleStageSelect(id: number) {
    setSelectedStageId(prev => prev === id ? null : id);
  }

  return (
    <div style={{ background: PAGE_BG, minHeight: "100vh" }}>
      <PageHeader />
      <LensTabs activeLens={activeLens} onSelect={(n) => { setActiveLens(n); }} />
      <KpiBar lens={activeLens} />
      <JourneyLane lens={activeLens} selectedId={selectedStageId} onSelect={handleStageSelect} />
      {selectedStageId !== null
        ? <StageDetail stageId={selectedStageId} lens={activeLens} onClose={() => setSelectedStageId(null)} />
        : (
          <>
            {activeLens === 0 && <Lens0Overview />}
            {activeLens === 1 && <Lens1Overview />}
            {activeLens === 2 && <Lens2Overview />}
            {activeLens === 3 && <Lens3Overview />}
          </>
        )
      }
    </div>
  );
}
