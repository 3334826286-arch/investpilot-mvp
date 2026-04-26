import { cache } from "react";
import { mockScreeningSnapshot } from "@/lib/mock-data";
import { resolveServiceData } from "@/lib/services/shared";

function buildMockScreener(filters) {
  const items = mockScreeningSnapshot.items.filter((item) => {
    if (filters.trend === "uptrend" && item.metrics.trend < 65) {
      return false;
    }

    if (filters.trend === "breakout" && !item.reasons.some((reason) => reason.includes("突破") || reason.includes("趋势"))) {
      return false;
    }

    if (filters.valuation === "reasonable" && item.metrics.valuation < 55) {
      return false;
    }

    if (filters.valuation === "low" && item.metrics.valuation < 70) {
      return false;
    }

    if (filters.growth === "positive" && item.metrics.growth < 60) {
      return false;
    }

    if (filters.growth === "strong" && item.metrics.growth < 75) {
      return false;
    }

    if (filters.risk === "low" && item.riskLevel !== "低风险") {
      return false;
    }

    if (filters.risk === "medium_or_below" && item.riskLevel === "高风险") {
      return false;
    }

    return true;
  });

  return {
    ...mockScreeningSnapshot,
    appliedFilters: filters,
    poolSummary: {
      ...mockScreeningSnapshot.poolSummary,
      matchCount: items.length
    },
    items
  };
}

export const getScreenerSnapshot = cache(async function getScreenerSnapshot(filters = {}) {
  const normalizedFilters = {
    trend: filters.trend ?? "all",
    valuation: filters.valuation ?? "all",
    growth: filters.growth ?? "all",
    risk: filters.risk ?? "all"
  };

  const search = new URLSearchParams(normalizedFilters);

  return resolveServiceData({
    endpoint: `/v1/screener/snapshot?${search.toString()}`,
    buildMockData: () => buildMockScreener(normalizedFilters)
  });
});
