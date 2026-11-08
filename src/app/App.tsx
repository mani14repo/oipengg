import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Providers } from "./providers";
import { JourneyIntelligencePage } from "@/pages/JourneyIntelligencePage";
import { ArchitecturePage } from "@/pages/ArchitecturePage";
import { OperationalRiskPage } from "@/pages/OperationalRiskPage";
import { ReliabilityPage } from "@/pages/ReliabilityPage";
import { GovernancePage } from "@/pages/GovernancePage";

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<JourneyIntelligencePage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/risks"        element={<OperationalRiskPage />} />
          <Route path="/reliability"  element={<ReliabilityPage />} />
          <Route path="/governance"   element={<GovernancePage />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
