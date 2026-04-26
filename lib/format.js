export function formatSignedNumber(value, digits = 2) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${Number(value).toFixed(digits)}`;
}

export function formatPercent(value, digits = 2) {
  return `${formatSignedNumber(value, digits)}%`;
}

export function formatPlainPercent(value, digits = 1) {
  return `${Number(value).toFixed(digits)}%`;
}

export function getChangeTone(value) {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

export function getRiskTone(level) {
  if (level === "高风险") {
    return "negative";
  }

  if (level === "中风险") {
    return "warning";
  }

  return "positive";
}

export function getImportanceTone(level) {
  if (level === "高") {
    return "negative";
  }

  if (level === "中") {
    return "warning";
  }

  return "neutral";
}
