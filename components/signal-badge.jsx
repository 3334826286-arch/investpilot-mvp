export function SignalBadge({ children, tone = "neutral" }) {
  const toneClass = {
    positive: "signal-positive",
    negative: "signal-negative",
    warning: "signal-warning",
    neutral: "signal-neutral"
  }[tone];

  return <span className={`signal-pill ${toneClass}`}>{children}</span>;
}
