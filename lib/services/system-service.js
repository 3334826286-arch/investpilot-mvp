import { cache } from "react";
import { appConfig } from "@/lib/env";
import { buildServiceEnvelope, resolveServiceData } from "@/lib/services/shared";

function buildMockSystemStatus() {
  return {
    service: "InvestPilot API",
    environment: appConfig.fastApiBaseUrl ? "preview" : "frontend-only",
    appVersion: appConfig.appVersion,
    releaseChannel: appConfig.releaseChannel,
    runtimeSeconds: null,
    corsPolicy: "unknown",
    apiPrefix: "/v1",
    advancedDataMode: appConfig.dataSourceMode,
    providers: {
      fundamentals: "AKShare / Eastmoney",
      news: "Eastmoney News",
      research: "Eastmoney Research",
      premiumFundamentals: "Daloopa",
      premiumNews: "Dow Jones Factiva"
    },
    timeouts: {
      externalRequestSeconds: Math.round(appConfig.requestTimeoutMs / 1000),
      slowRequestMs: null
    },
    cacheTtl: {
      market: null,
      stock: null,
      screener: null,
      calendar: null,
      search: null,
      document: null
    }
  };
}

export const getSystemStatus = cache(async function getSystemStatus() {
  return resolveServiceData({
    endpoint: "/v1/health/status",
    buildMockData: buildMockSystemStatus,
    normalizeRemote: (payload) => payload?.data ?? payload
  });
});

export function buildSystemStatusEnvelopeForClient(data, meta = {}) {
  return buildServiceEnvelope("/v1/health/status", data, meta);
}
