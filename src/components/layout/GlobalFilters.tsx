import { Button } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import { useFilterStore } from "@/state/filterStore";

export function GlobalFilters() {
  const { dateFrom, dateTo, environment, setDateFrom, setDateTo, setEnvironment, resetFilters } =
    useFilterStore();

  return (
    <div className="px-6 py-2">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Analysis Period:</span>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Environment:</span>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Mock Data — Jul 1 – Oct 30, 2026
        </div>

        <Button
          kind="ghost"
          size="sm"
          renderIcon={Renew}
          hasIconOnly
          iconDescription="Reset filters"
          onClick={resetFilters}
          className="!text-slate-400 hover:!text-slate-200"
        />
      </div>
    </div>
  );
}
