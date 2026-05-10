import { SignalBadge } from "@/components/signal-badge";

export function DataStatusNote({ meta, className = "" }) {
  if (!meta) {
    return null;
  }

  const tone = meta.source === "fastapi" ? "positive" : meta.fallback ? "warning" : "neutral";
  const label =
    meta.source === "fastapi" ? "FastAPI 真实接口" : meta.fallback ? "Mock 兜底结果" : "Mock 演示数据";
  const backendVersion = meta.backendMeta?.appVersion ?? meta.appVersion;
  const releaseChannel = meta.backendMeta?.releaseChannel ?? meta.releaseChannel;

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-500 ${className}`}>
      <SignalBadge tone={tone}>{label}</SignalBadge>
      <span>{meta.endpoint}</span>
      <span>·</span>
      <span>
        Version {backendVersion} / {releaseChannel}
      </span>
      {meta.upstreamFetchedAt ? (
        <>
          <span>·</span>
          <span>后端时间 {meta.upstreamFetchedAt}</span>
        </>
      ) : null}
      {meta.errorMessage ? (
        <>
          <span>·</span>
          <span className="text-amber-700">回退原因：{meta.errorMessage}</span>
        </>
      ) : null}
    </div>
  );
}
