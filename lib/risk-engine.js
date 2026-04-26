const RISK_WEIGHTS = {
  volatility: 0.24,
  drawdown: 0.2,
  valuation: 0.14,
  earnings: 0.14,
  sector: 0.12,
  systemic: 0.1,
  position: 0.06
};

function getRiskLevel(score) {
  if (score >= 68) {
    return "高风险";
  }

  if (score >= 43) {
    return "中风险";
  }

  return "低风险";
}

function getManagementAdvice(score, position) {
  if (score >= 68) {
    return position >= 0.5
      ? "当前风险暴露已经偏高，建议先收缩仓位和交易频率，再等待趋势与基本面出现新的共振。"
      : "短线更适合轻仓观察，把重点放在风险边界，而不是急于追逐价格波动。";
  }

  if (score >= 43) {
    return position >= 0.7
      ? "个股与仓位组合已经接近风险上限，更适合分批处理，而不是继续情绪化加仓。"
      : "风险仍在可控区间，但更适合分批执行和动态跟踪，不建议一次性重仓。";
  }

  return position >= 0.7
    ? "个股本身风险不高，但仓位已经偏重，仍应预留调整与回撤缓冲。"
    : "当前风险结构相对温和，可以按计划执行，但止损和仓位纪律仍需保留。";
}

function getCoachHint(level, position) {
  if (level === "高风险") {
    return "先问自己是否真的需要参与。如果核心逻辑还没有新增验证，等待往往比出手更有价值。";
  }

  if (level === "中风险") {
    return position > 0.6
      ? "更适合把注意力放在退出条件和回撤管理，而不是短线盈亏波动。"
      : "可以参与，但先写清买入理由、加仓条件和失效位置，再决定是否执行。";
  }

  return "环境允许按计划推进，但纪律优先级依然高于观点本身。";
}

export function buildRiskAssessment(stock, position = 0.45, marketSystemic = 46) {
  const factors = [
    {
      key: "volatility",
      label: "个股波动风险",
      score: stock.riskProfile.volatility,
      description: stock.riskNotes.volatility
    },
    {
      key: "drawdown",
      label: "高位回撤风险",
      score: stock.riskProfile.drawdown,
      description: stock.riskNotes.drawdown
    },
    {
      key: "valuation",
      label: "估值过高风险",
      score: stock.riskProfile.valuation,
      description: stock.riskNotes.valuation
    },
    {
      key: "earnings",
      label: "业绩兑现风险",
      score: stock.riskProfile.earnings,
      description: stock.riskNotes.earnings
    },
    {
      key: "sector",
      label: "板块退潮风险",
      score: stock.riskProfile.sector,
      description: stock.riskNotes.sector
    },
    {
      key: "systemic",
      label: "系统性市场风险",
      score: marketSystemic,
      description: "市场环境会直接影响个股承接与风险偏好，系统性分数越高，越不适合情绪化加仓。"
    },
    {
      key: "position",
      label: "仓位暴露风险",
      score: Math.round(position * 100),
      description:
        position >= 0.65
          ? "当前仓位偏重，单次回撤对组合净值的冲击会被放大。"
          : "当前仓位仍保留一定缓冲，组合风险相对可控。"
    }
  ];

  const totalScore = Math.round(factors.reduce((sum, item) => sum + item.score * RISK_WEIGHTS[item.key], 0));
  const level = getRiskLevel(totalScore);
  const exposure = Math.round(totalScore * 0.62 + position * 30);

  return {
    totalScore,
    level,
    exposure,
    factors,
    managementAdvice: getManagementAdvice(totalScore, position),
    coachHint: getCoachHint(level, position),
    actionSummary:
      level === "高风险" ? "先控仓，再确认" : level === "中风险" ? "分批观察，纪律优先" : "按计划执行"
  };
}
