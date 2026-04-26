import { PlatformShell } from "@/components/platform-shell";
import { ScreenerWorkbench } from "@/components/screener-workbench";
import { getScreenerSnapshot } from "@/lib/services/screener-service";

export const metadata = {
  title: "量化选股"
};

export default async function ScreenerPage() {
  const screenerPayload = await getScreenerSnapshot();

  return (
    <PlatformShell>
      <ScreenerWorkbench initialPayload={screenerPayload} />
    </PlatformShell>
  );
}
