import { PlatformShell } from "@/components/platform-shell";
import { WatchlistDashboard } from "@/components/watchlist-dashboard";
import { getStockUniverse } from "@/lib/services/stocks-service";

export const metadata = {
  title: "自选股"
};

export default async function WatchlistPage() {
  const universePayload = await getStockUniverse();

  return (
    <PlatformShell>
      <WatchlistDashboard universePayload={universePayload} />
    </PlatformShell>
  );
}
