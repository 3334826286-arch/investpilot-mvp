import { SignalBadge } from "@/components/signal-badge";

export function DataStatusNote({ meta, className = "" }) {
  if (!meta) {
    return null;
  }

  const tone = meta.source === "fastapi" ? "positive" : meta.fallback ? "warning" : "neutral";
  const label =
    meta.source === "fastapi" ? "FastAPI 真实接口" : meta.fallback ? "Mock 兜底结果" : "Mock 演示数据";

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-500 ${className}`}>
      <SignalBadge tone={tone}>{label}</SignalBadge>
      <span>{meta.endpoint}</span>
    </div>
  );
}
