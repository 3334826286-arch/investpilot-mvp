import { getStockUniverse } from "@/lib/services/stocks-service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  return Response.json(
    await getStockUniverse({
      query: searchParams.get("q") ?? "",
      limit: Number(searchParams.get("limit") ?? 20)
    })
  );
}
