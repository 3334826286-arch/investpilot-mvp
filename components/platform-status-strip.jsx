import Link from "next/link";
import { SignalBadge } from "@/components/signal-badge";

function getStatusTone(meta) {
  if (!meta) return "neutral";
  if (meta.fallback) return "warning";
  return meta.source === "fastapi" ? "positive" : "neutral";
}

function getStatusLabel(meta) {
  if (!meta) return "状态未知";
  if (meta.fallback) return "当前已降级";
  return meta.source === "fastapi" ? "实时链路正常" : "前端独立运行";
}

function getModeLabel(status) {
  const mode = status?.advancedDataMode;
  if (mode === "hybrid") return "真实数据优先，异常时自动回退";
  if (mode === "auto") return "自动选择可用数据链路";
  if (mode === "mock") return "当前仅使用本地演示数据";
  return "数据模式待确认";
}

export function PlatformStatusStrip({ payload }) {
  if (!payload) {
    return null;
  }

  const { meta, data } = payload;
  const tone = getStatusTone(meta);
  const label = getStatusLabel(meta);
  const backendVersion = data?.appVersion ?? meta?.backendMeta?.appVersion ?? meta?.appVersion;
  const releaseChannel = data?.releaseChannel ?? meta?.backendMeta?.releaseChannel ?? meta?.releaseChannel;
  const environment = data?.environment ?? "unknown";
  const modeLabel = getModeLabel(data);
  const providerLabel = data?.providers?.fundamentals ?? "数据提供方待补充";

  return (
    <section className="soft-panel mt-4 flex flex-col gap-3 rounded-[22px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <SignalBadge tone={tone}>{label}</SignalBadge>
        <span>后端版本 {backendVersion}</span>
        <span>·</span>
        <span>{releaseChannel}</span>
        <span>·</span>
        <span>{environment}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{modeLabel}</span>
        <span>·</span>
        <span>{providerLabel}</span>
        <Link href="/about" className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-slate-700 hover:text-slate-950">
          查看数据说明
        </Link>
      </div>
    </section>
  );
}
