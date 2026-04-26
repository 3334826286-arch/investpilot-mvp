import { cache } from "react";
import { buildLocalSearchIntelPayload } from "@/lib/local-stock-catalog";
import { buildServiceEnvelope, resolveServiceData } from "@/lib/services/shared";

function buildMockSearchIntel(query = "", limit = 6) {
  return buildLocalSearchIntelPayload(query, limit);
}

export const getSearchIntel = cache(async function getSearchIntel(options = {}) {
  const query = options.query ?? "";
  const limit = options.limit ?? 6;
  const search = new URLSearchParams();

  if (query) {
    search.set("q", query);
  }

  search.set("limit", String(limit));

  if (query.trim()) {
    return buildServiceEnvelope(`/v1/search/intel?${search.toString()}`, buildMockSearchIntel(query, limit), {
      source: "local_catalog"
    });
  }

  return resolveServiceData({
    endpoint: `/v1/search/intel?${search.toString()}`,
    buildMockData: () => buildMockSearchIntel(query, limit)
  });
});
