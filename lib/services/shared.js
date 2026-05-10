import { appConfig, canUseFastApi, isFastApiPreferred } from "@/lib/env";

function createMeta(endpoint, source, fallback, errorMessage = "", extras = {}) {
  return {
    endpoint,
    source,
    fallback,
    appVersion: appConfig.appVersion,
    releaseChannel: appConfig.releaseChannel,
    backendUrl: appConfig.fastApiBaseUrl || null,
    fetchedAt: new Date().toISOString(),
    errorMessage,
    warnings: extras.warnings ?? [],
    backendMeta: extras.backendMeta ?? null,
    upstreamFetchedAt: extras.upstreamFetchedAt ?? null
  };
}

export function buildServiceEnvelope(endpoint, data, options = {}) {
  return {
    meta: createMeta(
      endpoint,
      options.source ?? "mock",
      options.fallback ?? false,
      options.errorMessage ?? "",
      {
        warnings: options.warnings,
        backendMeta: options.backendMeta,
        upstreamFetchedAt: options.upstreamFetchedAt
      }
    ),
    data
  };
}

function withTimeoutSignal(timeoutMs) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }

  return undefined;
}

export async function fetchFastApiJson(endpoint, init = {}) {
  if (!canUseFastApi()) {
    return null;
  }

  const response = await fetch(`${appConfig.fastApiBaseUrl}${endpoint}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {})
    },
    signal: init.signal ?? withTimeoutSignal(appConfig.requestTimeoutMs),
    cache: init.cache ?? "no-store"
  });

  if (!response.ok) {
    throw new Error(`FastAPI request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function resolveServiceData({
  endpoint,
  buildMockData,
  normalizeRemote = (payload) => payload?.data ?? payload
}) {
  if (!canUseFastApi()) {
    return buildServiceEnvelope(endpoint, buildMockData());
  }

  try {
    const remotePayload = await fetchFastApiJson(endpoint);
    const remoteMeta = remotePayload?.meta ?? null;
    return buildServiceEnvelope(endpoint, normalizeRemote(remotePayload), {
      source: remoteMeta?.source ?? "fastapi",
      fallback: remoteMeta?.fallback ?? false,
      warnings: remoteMeta?.warnings ?? [],
      backendMeta: remoteMeta,
      upstreamFetchedAt: remoteMeta?.fetchedAt ?? null
    });
  } catch (error) {
    if (isFastApiPreferred()) {
      throw error;
    }

    return buildServiceEnvelope(endpoint, buildMockData(), {
      fallback: true,
      errorMessage: error.message
    });
  }
}
