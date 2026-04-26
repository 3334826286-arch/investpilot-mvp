import { SignalBadge } from "@/components/signal-badge";

export function SectionSourceNote({ item, className = "" }) {
  if (!item) {
    return null;
  }

  const tone = item.source === "real" ? "positive" : item.source === "mock" ? "warning" : "neutral";

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-500 ${className}`}>
      <SignalBadge tone={tone}>{item.label}</SignalBadge>
      {item.note ? <span>{item.note}</span> : null}
    </div>
  );
}
