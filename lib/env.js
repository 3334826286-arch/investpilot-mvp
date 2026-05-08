function trimTrailingSlash(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

function parseTimeout(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
}

export const appConfig = {
  appVersion: process.env.INVESTPILOT_APP_VERSION ?? "0.2.1",
  releaseChannel: process.env.INVESTPILOT_RELEASE_CHANNEL ?? "public-beta",
  dataSourceMode: process.env.INVESTPILOT_DATA_SOURCE ?? "auto",
  fastApiBaseUrl: trimTrailingSlash(process.env.INVESTPILOT_FASTAPI_BASE_URL),
  requestTimeoutMs: parseTimeout(process.env.INVESTPILOT_REQUEST_TIMEOUT_MS)
};

export function canUseFastApi() {
  return appConfig.dataSourceMode !== "mock" && Boolean(appConfig.fastApiBaseUrl);
}

export function isFastApiPreferred() {
  return appConfig.dataSourceMode === "fastapi";
}
