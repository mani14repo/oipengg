import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@carbon/react";
import { Activity, Renew } from "@carbon/icons-react";
import { ReliabilityExplorer } from "@/components/reliability/ReliabilityExplorer";
import { SystemicFixesExplorer } from "@/components/remediation/SystemicFixesExplorer";

export function ReliabilityPage() {
  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-sky-900 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-300 bg-teal-400/15 border border-teal-400/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                <Activity size={10} />
                SLI / SLO
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Reliability &amp; Remediation</h2>
            <p className="text-sm text-cyan-200/70 mt-1">
              SLI/SLO measurements, evidence quality, systemic fixes, and corrective action tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <Tabs>
          <TabList aria-label="Reliability views">
            <Tab renderIcon={Activity}>Reliability</Tab>
            <Tab renderIcon={Renew}>Systemic Fixes &amp; RCA</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ReliabilityExplorer />
            </TabPanel>
            <TabPanel>
              <SystemicFixesExplorer />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
