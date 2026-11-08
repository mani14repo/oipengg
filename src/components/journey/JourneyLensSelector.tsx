import { Button } from "@carbon/react";
import type { JourneyLens } from "@/domain/journey";
import { useJourneyStore } from "@/state/journeyStore";

const LENSES: Array<{ id: JourneyLens; label: string }> = [
  { id: "business", label: "Business" },
  { id: "risks", label: "Risks" },
  { id: "incidents", label: "Incidents" },
  { id: "architecture", label: "Architecture" },
  { id: "handoffs", label: "Handoffs" },
  { id: "toil", label: "Toil" },
  { id: "reliability", label: "Reliability" },
  { id: "remediation", label: "Remediation" },
];

export function JourneyLensSelector() {
  const activeLens = useJourneyStore((s) => s.activeLens);
  const setLens = useJourneyStore((s) => s.setLens);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide mr-1">Lens:</span>
      {LENSES.map((lens) => (
        <Button
          key={lens.id}
          size="sm"
          kind={activeLens === lens.id ? "primary" : "ghost"}
          onClick={() => setLens(lens.id)}
        >
          {lens.label}
        </Button>
      ))}
    </div>
  );
}
