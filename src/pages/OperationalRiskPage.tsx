import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@carbon/react";
import { WarningAlt, Chip } from "@carbon/icons-react";
import { RiskExplorer } from "@/components/risks/RiskExplorer";
import { ToilExplorer } from "@/components/toil/ToilExplorer";

export function OperationalRiskPage() {
  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="bg-gradient-to-r from-orange-900 via-red-900 to-rose-900 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-300 bg-orange-400/15 border border-orange-400/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                <WarningAlt size={10} />
                Operational Intelligence
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Risk &amp; Incident Analysis</h2>
            <p className="text-sm text-red-200/70 mt-1">
              Risk catalog, incident explorer, toil intelligence, and operational evidence across all journey stages.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <Tabs>
          <TabList aria-label="Operational risk views">
            <Tab renderIcon={WarningAlt}>Risks &amp; Incidents</Tab>
            <Tab renderIcon={Chip}>Toil Intelligence</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <RiskExplorer />
            </TabPanel>
            <TabPanel>
              <ToilExplorer />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
