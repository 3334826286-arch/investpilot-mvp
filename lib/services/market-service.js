import { cache } from "react";
import { mockMarketOverview } from "@/lib/mock-data";
import { mergeStructuredData } from "@/lib/services/merge-utils";
import { resolveServiceData } from "@/lib/services/shared";

export const getMarketOverview = cache(async function getMarketOverview() {
  return resolveServiceData({
    endpoint: "/v1/market/overview",
    buildMockData: () => mockMarketOverview,
    normalizeRemote: (payload) => mergeStructuredData(mockMarketOverview, payload?.data ?? payload)
  });
});
