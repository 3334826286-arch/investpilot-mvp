import { getScreenerSnapshot } from "@/lib/services/screener-service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  return Response.json(
    await getScreenerSnapshot({
      trend: searchParams.get("trend") ?? "all",
      valuation: searchParams.get("valuation") ?? "all",
      growth: searchParams.get("growth") ?? "all",
      risk: searchParams.get("risk") ?? "all"
    })
  );
}
