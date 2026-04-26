import { PlatformShell } from "@/components/platform-shell";
import { RiskWorkbench } from "@/components/risk-workbench";
import { getStockAnalysis, getStockUniverse } from "@/lib/services/stocks-service";

export const metadata = {
  title: "风险评估"
};

export default async function RiskPage() {
  const [stockUniversePayload, initialAnalysisPayload] = await Promise.all([
    getStockUniverse({ limit: 20 }),
    getStockAnalysis("300750", { position: 0.45 })
  ]);

  return (
    <PlatformShell>
      <RiskWorkbench
        stocks={stockUniversePayload.data.items}
        initialPayload={initialAnalysisPayload}
        initialPosition={45}
      />
    </PlatformShell>
  );
}
