import { getStockAnalysis } from "@/lib/services/stocks-service";

export async function GET(request, { params }) {
  const { symbol } = await params;
  const searchParams = new URL(request.url).searchParams;
  const position = Number(searchParams.get("position") ?? 0.45);
  const payload = await getStockAnalysis(symbol, { position });

  if (!payload.data) {
    return Response.json(
      {
        meta: {
          endpoint: `/v1/stocks/${symbol}/analysis`,
          source: "mock",
          fallback: false,
          backendUrl: null,
          fetchedAt: new Date().toISOString(),
          errorMessage: "Stock not found"
        },
        data: null
      },
      { status: 404 }
    );
  }

  return Response.json(payload);
}
