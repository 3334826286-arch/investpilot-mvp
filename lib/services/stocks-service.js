import { cache } from "react";
import { getMockStockBySymbol, getMockStockUniverse } from "@/lib/mock-data";
import { buildRiskAssessment } from "@/lib/risk-engine";
import { mergeStructuredData } from "@/lib/services/merge-utils";
import { resolveServiceData } from "@/lib/services/shared";

function buildStockPayload(symbol, position = 0.45, marketRisk = 46) {
  const stock = getMockStockBySymbol(symbol);

  if (!stock) {
    return null;
  }

  return {
    stock,
    risk: buildRiskAssessment(stock, position, marketRisk)
  };
}

export const getStockUniverse = cache(async function getStockUniverse(options = {}) {
  const query = options.query?.trim() ?? "";
  const limit = Number(options.limit ?? 20);
  const search = new URLSearchParams();

  if (query) {
    search.set("q", query);
  }

  if (Number.isFinite(limit)) {
    search.set("limit", String(limit));
  }

  return resolveServiceData({
    endpoint: `/v1/stocks/universe${search.size ? `?${search.toString()}` : ""}`,
    buildMockData: () => ({
      items: getMockStockUniverse().slice(0, limit),
      poolName: "核心股票池",
      poolSize: getMockStockUniverse().length,
      updatedAt: new Date().toISOString()
    })
  });
});

export async function getStockAnalysis(symbol, options = {}) {
  const position = Number(options.position ?? 0.45);
  const marketRisk = Number(options.marketRisk ?? 46);
  const mockPayload = buildStockPayload(symbol, position, marketRisk);

  return resolveServiceData({
    endpoint: `/v1/stocks/${symbol}/analysis?position=${position.toFixed(2)}`,
    buildMockData: () => mockPayload,
    normalizeRemote: (payload) => mergeStructuredData(mockPayload, payload?.data ?? payload)
  });
}
