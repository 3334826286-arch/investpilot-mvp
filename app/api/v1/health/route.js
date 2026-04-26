import { appConfig, canUseFastApi } from "@/lib/env";
import { buildServiceEnvelope } from "@/lib/services/shared";

export function GET() {
  return Response.json(
    buildServiceEnvelope("/v1/health", {
      status: "ok",
      dataSourceMode: appConfig.dataSourceMode,
      fastApiConfigured: canUseFastApi(),
      fastApiBaseUrl: appConfig.fastApiBaseUrl || null
    })
  );
}
