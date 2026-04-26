import { getMarketOverview } from "@/lib/services/market-service";

export async function GET() {
  return Response.json(await getMarketOverview());
}
