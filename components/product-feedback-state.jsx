export function ProductFeedbackState({
  title,
  description,
  tone = "neutral",
  className = "",
  actions = null
}) {
  const toneClass = {
    neutral: "border-slate-900/10 bg-white/72 text-slate-600",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-rose-200 bg-rose-50 text-rose-700"
  }[tone];

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${toneClass} ${className}`}>
      <p className="font-medium text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-7">{description}</p>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
