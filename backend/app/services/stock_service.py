from __future__ import annotations

from datetime import datetime
from typing import Any

import akshare as ak
import pandas as pd

from app.core.cache import ttl_cache
from app.core.config import get_settings
from app.services.lookup_service import load_stock_catalog, search_stock_catalog
from app.services.market_service import build_market_overview
from app.services.utils import (
    clamp,
    format_billions,
    format_number,
    format_percent,
    growth_rate,
    infer_market,
    latest_financial_period,
    previous_year_period,
    safe_get_row_value,
    to_float,
    to_int,
)


HIGH_BETA_SECTORS = ("软件", "半导体", "元件", "通信", "电池", "电子", "人工智能", "计算机")
DEFENSIVE_SECTORS = ("银行", "食品", "饮料", "家电", "公用事业", "医药")

RISK_WEIGHTS = {
    "volatility": 0.24,
    "drawdown": 0.20,
    "valuation": 0.14,
    "earnings": 0.14,
    "sector": 0.12,
    "systemic": 0.10,
    "position": 0.06,
}

SCREENING_STRATEGIES = [
    "趋势跟随",
    "放量突破",
    "估值筛选",
    "盈利成长",
    "多因子平衡",
]

HOT_UNIVERSE_LIMIT = 14
FEATURED_CATALOG_SYMBOLS = ["000001", "600519", "601318", "600900", "000858", "002415", "601012"]
DEFAULT_SYSTEMIC_SCORE = 52

UNIVERSE_SEED_PROFILES = {
    "300750": {
        "name": "宁德时代",
        "sector": "电力设备",
        "price": "196.82",
        "changePercent": 2.14,
        "metrics": {"trend": 76, "valuation": 58, "growth": 78, "risk": 54},
        "riskLevel": "中风险",
        "reasons": ["趋势修复明确", "机构资金回补", "估值回到合理区间"],
    },
    "601899": {
        "name": "紫金矿业",
        "sector": "有色资源",
        "price": "18.76",
        "changePercent": 1.38,
        "metrics": {"trend": 74, "valuation": 72, "growth": 66, "risk": 61},
        "riskLevel": "中风险",
        "reasons": ["商品价格偏强", "盈利韧性较高", "行业主线仍在"],
    },
    "000333": {
        "name": "美的集团",
        "sector": "家电",
        "price": "71.42",
        "changePercent": 0.86,
        "metrics": {"trend": 62, "valuation": 79, "growth": 68, "risk": 80},
        "riskLevel": "低风险",
        "reasons": ["现金流稳健", "ROE 较高", "分红属性明确"],
    },
    "688111": {
        "name": "金山办公",
        "sector": "软件服务",
        "price": "286.30",
        "changePercent": 1.92,
        "metrics": {"trend": 68, "valuation": 38, "growth": 70, "risk": 34},
        "riskLevel": "中风险",
        "reasons": ["软件龙头修复", "成长数据保持韧性", "科技风格回暖受益明显"],
    },
    "600036": {
        "name": "招商银行",
        "sector": "银行",
        "price": "45.80",
        "changePercent": 0.52,
        "metrics": {"trend": 66, "valuation": 84, "growth": 58, "risk": 86},
        "riskLevel": "低风险",
        "reasons": ["估值偏低", "高股息配置", "风险等级较低"],
    },
}


def _build_seed_price_series(price: float, change_percent: float) -> list[dict[str, Any]]:
    closes = [
        round(price * 0.955, 2),
        round(price * 0.964, 2),
        round(price * 0.972, 2),
        round(price * 0.981, 2),
        round(price * 0.988, 2),
        round(price * 0.994, 2),
        round(price * (1 - change_percent / 300), 2),
        round(price, 2),
    ]
    dates = ["04-14", "04-15", "04-16", "04-17", "04-18", "04-21", "04-22", "04-23"]
    volumes = [18, 16, 21, 24, 20, 26, 23, 28]
    series: list[dict[str, Any]] = []
    previous = closes[0]
    for index, close in enumerate(closes):
        open_price = previous if index else round(close * 0.996, 2)
        low = round(min(open_price, close) * 0.992, 2)
        high = round(max(open_price, close) * 1.008, 2)
        series.append(
            {
                "date": dates[index],
                "open": round(open_price, 2),
                "close": round(close, 2),
                "low": low,
                "high": high,
                "volume": volumes[index],
            }
        )
        previous = close
    return series


def _seed_factor(score: int, label: str, description: str) -> dict[str, Any]:
    return {
        "key": label,
        "label": label,
        "score": score,
        "description": description,
    }


def _build_seed_stock_analysis(symbol: str, position: float = 0.45) -> dict[str, Any] | None:
    seed = UNIVERSE_SEED_PROFILES.get(symbol)
    if not seed:
        return None

    price = to_float(seed["price"])
    change_percent = float(seed["changePercent"])
    metrics = dict(seed["metrics"])
    risk_level = str(seed["riskLevel"])
    reasons = list(seed["reasons"])
    market = infer_market(symbol)
    sector = str(seed["sector"])
    name = str(seed["name"])

    trend_score = int(metrics["trend"])
    valuation_score = round(clamp(100 - int(metrics["valuation"]), 18, 88))
    growth_score = round(clamp(100 - int(metrics["growth"]), 18, 88))
    sector_score = 62 if any(keyword in sector for keyword in HIGH_BETA_SECTORS) else 34 if any(
        keyword in sector for keyword in DEFENSIVE_SECTORS
    ) else 48
    systemic_score = DEFAULT_SYSTEMIC_SCORE
    position_score = round(clamp(position * 100, 10, 100))

    factors = [
        _seed_factor(trend_score, "个股波动风险", "当前使用种子数据兜底，趋势分越高，意味着短线波动管理要求越高。"),
        _seed_factor(44 if trend_score >= 70 else 36, "高位回撤风险", "趋势修复中的个股仍可能出现回撤，参与时要先写清失效位置。"),
        _seed_factor(valuation_score, "估值压力风险", "当前个股页使用稳定兜底数据，估值维度先给出保守判断，后续再替换为实时财务口径。"),
        _seed_factor(growth_score, "业绩兑现风险", "成长预期仍需后续财报和订单数据继续验证。"),
        _seed_factor(sector_score, "板块轮动风险", "板块强弱切换会直接影响这类标的的持续性和资金承接。"),
        _seed_factor(systemic_score, "系统性市场风险", "当前系统性风险仍处于中性偏谨慎区间。"),
        _seed_factor(position_score, "仓位暴露风险", "仓位越重，对单次波动和趋势失效的容忍空间越小。"),
    ]

    if risk_level == "高风险":
        management_advice = "当前更适合先控制仓位与交易频率，等趋势与市场承接重新确认后再提高暴露。"
        coach_hint = "先保证回撤可控，再讨论收益空间。"
        action_summary = "先控风险，再等确认"
    elif risk_level == "中风险":
        management_advice = "更适合分批跟踪与轻仓试错，不建议在单一位置一次性重仓。"
        coach_hint = "先写清楚入场逻辑、加仓条件和失效位置，再决定是否执行。"
        action_summary = "分批观察，重视纪律"
    else:
        management_advice = "当前风险结构相对温和，可以按计划执行，但仍要保留止损和仓位弹性。"
        coach_hint = "低风险不等于没有风险，重点是保持执行一致性。"
        action_summary = "按计划执行，留有弹性"

    total_score = round(sum(item["score"] * RISK_WEIGHTS[key] for item, key in zip(
        factors,
        ["volatility", "drawdown", "valuation", "earnings", "sector", "systemic", "position"],
    )))

    stock = {
        "symbol": symbol,
        "name": name,
        "market": market,
        "sector": sector,
        "price": format_number(price),
        "changePercent": change_percent,
        "amplitude": format_percent(abs(change_percent) * 1.8 + 0.8),
        "turnover": format_billions(price * 1.5e8),
        "summary": "当前页面优先使用稳定的研究兜底数据，先保证结论可读、风险可控，再逐步替换为更完整的实时口径。",
        "thesis": [
            reasons[0],
            reasons[1] if len(reasons) > 1 else "当前更适合把关注点放在趋势持续性和风险收益比上。",
            "在正式实时数据恢复前，这一页更适合作为研究入口与交易前检查清单，而不是盲目追涨依据。",
        ],
        "coachNotes": [
            management_advice,
            coach_hint,
            "如果参与，优先轻仓试错，并在计划内处理加减仓，不要把研究页当成即时喊单页面。",
        ],
        "technicalView": {
            "trend": "趋势结构仍有修复迹象，但更适合等待放量确认，而不是情绪化追高。",
            "volume": "成交量能维持活跃更重要，量价失配时要优先降低预期。",
            "support": format_number(price * 0.96),
            "resistance": format_number(price * 1.04),
        },
        "fundamentals": [
            {"key": "valuation", "label": "估值状态", "value": "中性"},
            {"key": "growth", "label": "成长状态", "value": "跟踪中"},
            {"key": "trend", "label": "趋势评分", "value": str(metrics["trend"])},
            {"key": "risk", "label": "风险标签", "value": risk_level},
        ],
        "catalysts": [
            reasons[0],
            "后续财报、公告与行业景气验证，会决定趋势能否从交易逻辑走向更稳的配置逻辑。",
            "市场系统性风险若下降，这类标的的容错率会明显提升。",
        ],
        "news": [
            {"title": f"{name} 当前处于平台研究池，短线关注点仍在趋势确认和承接强度。", "source": "研究工作台"},
            {"title": "正式实时公告与新闻聚合恢复后，这里会优先展示最新公告、机构观点和关键风险提示。", "source": "系统提示"},
        ],
        "radarMetrics": [
            {"name": "趋势", "value": metrics["trend"]},
            {"name": "成长", "value": metrics["growth"]},
            {"name": "估值", "value": metrics["valuation"]},
            {"name": "资金", "value": round(clamp(metrics["trend"] * 0.82, 18, 88))},
            {"name": "风控", "value": metrics["risk"]},
        ],
        "priceSeries": _build_seed_price_series(price, change_percent),
        "riskProfile": {
            "volatility": trend_score,
            "drawdown": 44 if trend_score >= 70 else 36,
            "valuation": valuation_score,
            "earnings": growth_score,
            "sector": sector_score,
        },
        "riskNotes": {
            "volatility": "当前以稳定兜底数据为主，波动管理仍应放在第一位。",
            "drawdown": "修复阶段的个股更需要尊重回撤控制，而不是默认趋势会线性延续。",
            "valuation": "估值并非唯一决策依据，但会决定你能承受多大的业绩偏差。",
            "earnings": "后续财报或经营数据若不及预期，价格对风险的反应会更快。",
            "sector": "板块轮动加快时，行业强弱往往比个股故事更先影响股价表现。",
        },
        "selectionReasons": reasons,
        "selectionSummary": "；".join(reasons[:3]),
    }
    risk = {
        "totalScore": total_score,
        "level": risk_level,
        "exposure": round(clamp(total_score * 0.62 + position * 30, 12, 95)),
        "factors": factors,
        "managementAdvice": management_advice,
        "coachHint": coach_hint,
        "actionSummary": action_summary,
    }
    return {"stock": stock, "risk": risk}


def _load_stock_history(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"stock:history:{symbol}",
        settings.stock_cache_ttl_seconds,
        lambda: ak.stock_zh_a_hist_tx(symbol=_symbol_with_exchange(symbol), start_date="20250101", end_date="20500101", adjust="qfq"),
    )


def _load_stock_info(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"stock:info:{symbol}",
        settings.stock_cache_ttl_seconds,
        lambda: ak.stock_individual_info_em(symbol=symbol),
    )


def _load_financial_abstract(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"stock:financial:{symbol}",
        settings.stock_cache_ttl_seconds,
        lambda: ak.stock_financial_abstract(symbol=symbol),
    )


def _load_hot_rank_snapshot() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "stock:hot_rank_snapshot",
        settings.screener_cache_ttl_seconds,
        lambda: ak.stock_hot_rank_em().head(HOT_UNIVERSE_LIMIT).reset_index(drop=True),
    )


def _info_value(frame: pd.DataFrame, item: str) -> Any:
    matched = frame.loc[frame["item"] == item]
    if matched.empty:
        return None
    return matched.iloc[0]["value"]


def _symbol_with_exchange(symbol: str) -> str:
    if symbol.startswith(("600", "601", "603", "605", "688", "900")):
        return f"sh{symbol}"
    if symbol.startswith(("8", "4")):
        return f"bj{symbol}"
    return f"sz{symbol}"


def _calculate_max_drawdown(closes: list[float]) -> float:
    if not closes:
        return 0.0

    peak = closes[0]
    drawdown = 0.0
    for close in closes:
        peak = max(peak, close)
        if peak:
            drawdown = min(drawdown, (close - peak) / peak)
    return abs(drawdown) * 100


def _calculate_risk_profile(
    *,
    industry: str,
    market_cap: float,
    net_assets: float,
    volatility: float,
    max_drawdown: float,
    revenue_growth: float,
    profit_growth: float,
    position: float,
    systemic_score: int,
) -> tuple[dict[str, int], dict[str, str], dict[str, Any]]:
    price_to_book = market_cap / net_assets if net_assets > 0 else 0.0
    volatility_score = round(clamp(volatility * 120, 18, 88))
    drawdown_score = round(clamp(max_drawdown * 1.35, 20, 88))
    valuation_score = round(clamp(price_to_book * 12 + (8 if price_to_book >= 6 else 0), 18, 88))

    if profit_growth <= -20:
        earnings_score = 82
    elif profit_growth < 0 or revenue_growth < 0:
        earnings_score = 68
    elif profit_growth >= 30 and revenue_growth >= 15:
        earnings_score = 28
    else:
        earnings_score = round(clamp(52 - (profit_growth + revenue_growth) / 6, 24, 76))

    if any(keyword in industry for keyword in HIGH_BETA_SECTORS):
        sector_score = 62
    elif any(keyword in industry for keyword in DEFENSIVE_SECTORS):
        sector_score = 34
    else:
        sector_score = 48

    position_score = round(clamp(position * 100, 10, 100))
    risk_profile = {
        "volatility": volatility_score,
        "drawdown": drawdown_score,
        "valuation": valuation_score,
        "earnings": earnings_score,
        "sector": sector_score,
    }
    risk_notes = {
        "volatility": f"近 60 日年化波动率约 {volatility:.1f}%，价格弹性越大，对纪律执行的要求越高。",
        "drawdown": f"近阶段最大回撤约 {max_drawdown:.1f}%，意味着趋势修复过程中仍可能出现明显反复。",
        "valuation": (
            "当前估值并不便宜，若后续盈利兑现不及预期，估值压力会更早反映到价格上。"
            if valuation_score >= 60
            else "估值压力尚未处于极端区间，但仍需结合盈利持续性判断安全边际。"
        ),
        "earnings": (
            "盈利与收入增速仍有支撑，业绩风险更多来自后续持续性验证。"
            if earnings_score < 45
            else "盈利兑现压力仍需跟踪，一旦增速放缓或利润率承压，市场预期容易下修。"
        ),
        "sector": (
            "所属行业弹性较高，板块强弱切换会明显影响股价波动。"
            if sector_score >= 55
            else "所属行业偏稳健，板块层面的情绪冲击相对有限。"
        ),
    }

    factors = [
        {"key": "volatility", "label": "个股波动风险", "score": volatility_score, "description": risk_notes["volatility"]},
        {"key": "drawdown", "label": "高位回撤风险", "score": drawdown_score, "description": risk_notes["drawdown"]},
        {"key": "valuation", "label": "估值过高风险", "score": valuation_score, "description": risk_notes["valuation"]},
        {"key": "earnings", "label": "业绩兑现风险", "score": earnings_score, "description": risk_notes["earnings"]},
        {"key": "sector", "label": "板块退潮风险", "score": sector_score, "description": risk_notes["sector"]},
        {
            "key": "systemic",
            "label": "系统性市场风险",
            "score": systemic_score,
            "description": "市场环境会直接影响个股承接与风险偏好，系统性分数越高，越不适合情绪化加仓。",
        },
        {
            "key": "position",
            "label": "仓位暴露风险",
            "score": position_score,
            "description": "仓位越重，对单次波动和趋势失效的容忍空间就越小。",
        },
    ]
    total_score = round(sum(item["score"] * RISK_WEIGHTS[item["key"]] for item in factors))

    if total_score >= 68:
        level = "高风险"
        management_advice = "当前风险暴露偏高，更适合先控制仓位与交易频率，再等待趋势与基本面形成新的共振。"
        coach_hint = "这类环境下最重要的不是证明自己看对，而是避免在没有确认前把试错做成重仓。"
        action_summary = "先控仓，再确认"
    elif total_score >= 43:
        level = "中风险"
        management_advice = "风险仍在可控区间，但更适合分批执行与动态跟踪，不建议在单一价格位置一次性重仓。"
        coach_hint = "如果参与，先写清买入理由、加仓条件与失效位置，再决定是否执行。"
        action_summary = "分批观察，纪律优先"
    else:
        level = "低风险"
        management_advice = "当前风险结构相对温和，可以按计划执行，但仍应保留止损与仓位弹性。"
        coach_hint = "低风险不代表没有风险，真正重要的是在顺风环境里也保持一致的执行纪律。"
        action_summary = "按计划执行"

    exposure = round(clamp(total_score * 0.62 + position * 30, 12, 95))
    return risk_profile, risk_notes, {
        "totalScore": total_score,
        "level": level,
        "exposure": exposure,
        "factors": factors,
        "managementAdvice": management_advice,
        "coachHint": coach_hint,
        "actionSummary": action_summary,
    }


def _build_screening_metrics(
    *,
    latest_close: float,
    ma20: float,
    ma60: float,
    volume_ratio: float,
    price_to_book: float,
    revenue_growth: float,
    profit_growth: float,
    risk_total_score: int,
) -> dict[str, Any]:
    trend_score = round(
        clamp(
            45
            + (8 if latest_close >= ma20 else -8)
            + (12 if ma20 >= ma60 else -10)
            + (10 if volume_ratio >= 1.1 else 0),
            18,
            92,
        )
    )
    valuation_score = round(clamp(88 - price_to_book * 10, 18, 90)) if price_to_book > 0 else 45
    growth_score = round(clamp(42 + revenue_growth * 0.8 + profit_growth * 0.6, 18, 92))
    risk_score = round(clamp(100 - risk_total_score, 12, 88))
    composite_score = round(trend_score * 0.3 + valuation_score * 0.2 + growth_score * 0.3 + risk_score * 0.2)
    return {
        "trend": trend_score,
        "valuation": valuation_score,
        "growth": growth_score,
        "risk": risk_score,
        "composite": composite_score,
        "priceToBook": round(price_to_book, 2),
        "revenueGrowth": round(revenue_growth, 2),
        "profitGrowth": round(profit_growth, 2),
        "volumeRatio": round(volume_ratio, 2),
        "isUptrend": latest_close >= ma20 >= ma60,
        "isBreakout": latest_close >= ma20 and volume_ratio >= 1.1,
    }


def _build_selection_reasons(
    *,
    metrics: dict[str, Any],
    industry: str,
    risk_level: str,
) -> list[str]:
    reasons: list[str] = []
    if metrics["isBreakout"]:
        reasons.append("量价配合改善，具备放量突破特征")
    elif metrics["isUptrend"]:
        reasons.append("股价位于中短期均线之上，趋势结构较完整")

    if metrics["growth"] >= 70:
        reasons.append("盈利与营收增速保持正向，成长性数据较好")

    if metrics["valuation"] >= 62:
        reasons.append("当前估值仍处在相对可接受区间")
    elif metrics["valuation"] <= 35:
        reasons.append("估值压力偏高，需依赖后续业绩兑现")

    if risk_level == "低风险":
        reasons.append("综合风险等级较低，更适合稳健配置")
    elif risk_level == "中风险":
        reasons.append("综合风险中性，可分批跟踪")

    reasons.append(f"所属行业为 {industry}，便于与板块强弱联动观察")
    return reasons[:4]


def _build_stock_payload(symbol: str, position: float = 0.45, market_context: dict[str, Any] | None = None) -> dict[str, Any] | None:
    history = _load_stock_history(symbol)
    financial_frame = _load_financial_abstract(symbol)
    if history.empty or financial_frame.empty:
        return None

    try:
        info_frame = _load_stock_info(symbol)
    except Exception:
        info_frame = pd.DataFrame()

    history = history.tail(60).reset_index(drop=True)
    latest = history.iloc[-1]
    latest_close = to_float(latest["close"])
    latest_high = to_float(latest["high"])
    latest_low = to_float(latest["low"])
    previous_close = to_float(history.iloc[-2]["close"]) if len(history) > 1 else latest_close
    latest_change = ((latest_close - previous_close) / previous_close * 100) if previous_close else 0.0
    latest_amplitude = ((latest_high - latest_low) / previous_close * 100) if previous_close else 0.0
    latest_volume = to_float(latest["amount"])
    latest_turnover = latest_volume * 100 * latest_close

    closes = history["close"].map(to_float).tolist()
    ma20 = sum(closes[-20:]) / min(len(closes[-20:]), 20)
    ma60 = sum(closes) / max(len(closes), 1)
    avg_volume_20 = history["amount"].tail(20).map(to_float).mean()
    volume_ratio = latest_volume / avg_volume_20 if avg_volume_20 else 1.0
    return_series = history["close"].map(to_float).pct_change().dropna()
    volatility = return_series.std(ddof=0) * (252**0.5) * 100
    max_drawdown = _calculate_max_drawdown(closes)

    latest_period = latest_financial_period(financial_frame)
    previous_period = previous_year_period(latest_period)
    revenue = safe_get_row_value(financial_frame, "营业总收入", latest_period) if latest_period else 0.0
    previous_revenue = safe_get_row_value(financial_frame, "营业总收入", previous_period) if previous_period else 0.0
    net_profit = safe_get_row_value(financial_frame, "归母净利润", latest_period) if latest_period else 0.0
    previous_profit = safe_get_row_value(financial_frame, "归母净利润", previous_period) if previous_period else 0.0
    cashflow = safe_get_row_value(financial_frame, "经营现金流量净额", latest_period) if latest_period else 0.0
    roe = safe_get_row_value(financial_frame, "净资产收益率(ROE)", latest_period) if latest_period else 0.0
    gross_margin = safe_get_row_value(financial_frame, "毛利率", latest_period) if latest_period else 0.0
    debt_ratio = safe_get_row_value(financial_frame, "资产负债率", latest_period) if latest_period else 0.0
    net_assets = safe_get_row_value(financial_frame, "股东权益合计(净资产)", latest_period) if latest_period else 0.0
    revenue_growth = growth_rate(revenue, previous_revenue)
    profit_growth = growth_rate(net_profit, previous_profit)

    catalog_match = next((item for item in load_stock_catalog() if item["symbol"] == symbol), None)
    seed = UNIVERSE_SEED_PROFILES.get(symbol, {})
    industry = str(_info_value(info_frame, "行业") or seed.get("sector") or "行业待补充")
    company_name = str(_info_value(info_frame, "股票简称") or seed.get("name") or (catalog_match["name"] if catalog_match else symbol))
    market_cap = to_float(_info_value(info_frame, "总市值"))
    market = infer_market(symbol)
    market_context = market_context or {"systemicRiskScore": DEFAULT_SYSTEMIC_SCORE}
    systemic_score = int(market_context.get("systemicRiskScore", DEFAULT_SYSTEMIC_SCORE))

    risk_profile, risk_notes, risk = _calculate_risk_profile(
        industry=industry,
        market_cap=market_cap,
        net_assets=net_assets,
        volatility=volatility,
        max_drawdown=max_drawdown,
        revenue_growth=revenue_growth,
        profit_growth=profit_growth,
        position=position,
        systemic_score=systemic_score,
    )

    price_to_book = market_cap / net_assets if net_assets > 0 else 0.0
    screening = _build_screening_metrics(
        latest_close=latest_close,
        ma20=ma20,
        ma60=ma60,
        volume_ratio=volume_ratio,
        price_to_book=price_to_book,
        revenue_growth=revenue_growth,
        profit_growth=profit_growth,
        risk_total_score=risk["totalScore"],
    )
    reasons = _build_selection_reasons(metrics=screening, industry=industry, risk_level=risk["level"])

    trend_text = (
        "股价运行在 20 日与 60 日均线之上，趋势修复结构相对完整。"
        if latest_close >= ma20 >= ma60
        else "股价仍在均线附近反复，趋势尚未形成单边强化，更像等待确认的整理阶段。"
        if latest_close >= ma20
        else "股价仍低于中期均线，趋势修复尚未完全确认，反弹更多偏交易性。"
    )
    volume_text = (
        f"最新成交量约为 20 日均量的 {volume_ratio:.2f} 倍，量能配合度较好。"
        if volume_ratio >= 1.15
        else f"最新成交量约为 20 日均量的 {volume_ratio:.2f} 倍，量能仍需继续观察。"
    )

    support = min(closes[-10:])
    resistance = max(closes[-10:])
    selection_summary = "；".join(reasons[:3])
    stock = {
        "symbol": symbol,
        "name": company_name,
        "market": market,
        "sector": industry,
        "price": format_number(latest_close),
        "changePercent": round(latest_change, 2),
        "amplitude": format_percent(latest_amplitude),
        "turnover": format_billions(latest_turnover),
        "summary": (
            "趋势修复与基本面改善暂时同向，但估值与市场环境仍要求更注重节奏控制。"
            if risk["level"] != "高风险"
            else "当前个股仍有研究价值，但更适合等待趋势、量能与市场承接进一步确认。"
        ),
        "thesis": [
            f"最新报告期营业总收入同比 {revenue_growth:.1f}%，归母净利润同比 {profit_growth:.1f}%，当前仍处于数据验证阶段。",
            f"当前市净率约 {price_to_book:.1f} 倍，所属行业为 {industry}，估值承接需要结合后续盈利兑现观察。",
            "系统性市场环境仍会影响个股表现，择时与仓位管理的重要性不低于个股逻辑本身。",
        ],
        "coachNotes": [
            risk["managementAdvice"],
            "如果参与，应优先把止损位置定义在趋势失效位，而不是情绪波动位。",
            "先确认自己是在做趋势跟随、财报交易还是估值修复，避免用一个计划进入、用另一个理由硬扛。",
        ],
        "technicalView": {
            "trend": trend_text,
            "volume": volume_text,
            "support": f"{support:.2f}",
            "resistance": f"{resistance:.2f}",
        },
        "fundamentals": [
            {"key": "pb", "label": "市净率(PB)", "value": f"{price_to_book:.1f}x"},
            {"key": "roe", "label": "ROE", "value": format_percent(roe)},
            {"key": "revenue_growth", "label": "营收同比", "value": format_percent(revenue_growth)},
            {"key": "gross_margin", "label": "销售毛利率", "value": format_percent(gross_margin)},
        ],
        "catalysts": [
            f"{latest_period} 财务数据兑现情况仍是最重要的基本面催化。",
            "若量能继续放大且价格维持在中期均线之上，趋势跟随资金更容易回流。",
            f"{industry} 板块强弱切换会直接影响个股溢价与容错率。",
        ],
        "news": [
            {
                "title": f"近 5 个交易日区间涨跌幅约 {(((closes[-1] / closes[-6]) - 1) * 100) if len(closes) >= 6 and closes[-6] else 0:.1f}%。",
                "source": "量价信号",
            },
            {"title": f"{latest_period} 归母净利润约 {net_profit / 1e8:.1f} 亿元，同比 {profit_growth:.1f}%。", "source": "财务摘要"},
            {"title": f"{latest_period} 经营现金流净额约 {cashflow / 1e8:.1f} 亿元，资产负债率 {debt_ratio:.1f}%。", "source": "财务质量"},
        ],
        "radarMetrics": [
            {"name": "趋势", "value": screening["trend"]},
            {"name": "成长", "value": screening["growth"]},
            {"name": "估值", "value": screening["valuation"]},
            {"name": "资金", "value": round(clamp(volume_ratio * 45 + 20, 18, 88))},
            {"name": "风控", "value": screening["risk"]},
        ],
        "priceSeries": [
            {
                "date": str(row["date"])[5:],
                "open": round(to_float(row["open"]), 2),
                "close": round(to_float(row["close"]), 2),
                "low": round(to_float(row["low"]), 2),
                "high": round(to_float(row["high"]), 2),
                "volume": round(to_float(row["amount"]) / 10000, 2),
            }
            for _, row in history.tail(20).iterrows()
        ],
        "riskProfile": risk_profile,
        "riskNotes": risk_notes,
        "selectionReasons": reasons,
        "selectionSummary": selection_summary,
    }
    return {"stock": stock, "risk": risk, "screening": screening}


def _build_universe_candidate(symbol: str, systemic_score: int) -> dict[str, Any] | None:
    seed = UNIVERSE_SEED_PROFILES.get(symbol)
    if not seed:
        return None

    metrics = dict(seed["metrics"])
    composite_score = round(metrics["trend"] * 0.3 + metrics["valuation"] * 0.2 + metrics["growth"] * 0.3 + metrics["risk"] * 0.2)
    summary = "；".join(seed["reasons"][:3])

    return {
        "symbol": symbol,
        "name": str(seed["name"]),
        "market": infer_market(symbol),
        "sector": str(seed["sector"]),
        "price": str(seed["price"]),
        "changePercent": float(seed["changePercent"]),
        "summary": summary,
        "riskLevel": str(seed["riskLevel"]),
        "score": composite_score,
        "reasons": list(seed["reasons"]),
        "metrics": metrics,
        "meta": {
            "systemicScore": systemic_score,
            "poolMode": "seeded",
        },
    }


def _build_catalog_candidate(symbol: str, name: str, systemic_score: int) -> dict[str, Any]:
    return {
        "symbol": symbol,
        "name": name,
        "market": infer_market(symbol),
        "sector": "行业待加载",
        "price": "--",
        "changePercent": 0.0,
        "summary": "已匹配股票代码或名称，可进入个股详情页查看真实行情、风险评估与中文分析结论。",
        "riskLevel": "待评估",
        "score": 50,
        "reasons": [
            "已匹配全市场股票目录",
            "支持进入个股详情做真实分析",
            "当前搜索候选仍以快速定位为主",
        ],
        "metrics": {
            "trend": 0,
            "valuation": 0,
            "growth": 0,
            "risk": 0,
        },
        "meta": {
            "systemicScore": systemic_score,
            "poolMode": "catalog",
        },
    }


def _build_featured_catalog_candidates(systemic_score: int, seen_symbols: set[str]) -> list[dict[str, Any]]:
    catalog_map = {item["symbol"]: item for item in load_stock_catalog()}
    items: list[dict[str, Any]] = []
    for symbol in FEATURED_CATALOG_SYMBOLS:
        if symbol in seen_symbols or symbol not in catalog_map:
            continue
        candidate = _build_catalog_candidate(symbol=symbol, name=catalog_map[symbol]["name"], systemic_score=systemic_score)
        candidate["summary"] = "属于默认关注候选，可作为首页搜索、自选候选与研究入口的补充标的。"
        candidate["reasons"] = ["属于默认精选候选", "已纳入全市场目录底座", "适合继续进入个股详情页查看真实分析"]
        candidate["meta"]["poolMode"] = "catalog"
        items.append(candidate)
        seen_symbols.add(symbol)

    return items


def _build_hot_rank_candidate(symbol: str, name: str, price: float, change_percent: float, rank: int, systemic_score: int) -> dict[str, Any]:
    trend_score = round(clamp(58 + max(change_percent, -6) * 2.2 - rank * 0.6, 26, 90))
    risk_score = round(clamp(72 - abs(change_percent) * 3.4, 24, 84))
    growth_score = round(clamp(56 + (12 - rank) * 1.2, 32, 82))
    valuation_score = 50
    composite_score = round(trend_score * 0.35 + valuation_score * 0.15 + growth_score * 0.2 + risk_score * 0.3)

    if abs(change_percent) >= 8:
        risk_level = "中风险"
    elif abs(change_percent) >= 4:
        risk_level = "中风险"
    else:
        risk_level = "低风险"

    reasons = [
        f"当前热度排名位于前 {rank} 名",
        "短线关注度明显提升，适合做事件与情绪跟踪",
        "当前为市场热度候选，估值与成长标签仍需进入个股详情进一步确认",
    ]

    return {
        "symbol": symbol,
        "name": name,
        "market": infer_market(symbol),
        "sector": "市场热度候选",
        "price": format_number(price),
        "changePercent": round(change_percent, 2),
        "summary": "；".join(reasons),
        "riskLevel": risk_level,
        "score": composite_score,
        "reasons": reasons,
        "metrics": {
            "trend": trend_score,
            "valuation": valuation_score,
            "growth": growth_score,
            "risk": risk_score,
        },
        "meta": {
            "systemicScore": systemic_score,
            "poolMode": "market",
            "rank": rank,
        },
    }


def build_stock_analysis(symbol: str, position: float = 0.45) -> dict[str, Any] | None:
    seed_payload = _build_seed_stock_analysis(symbol=symbol, position=position)
    if seed_payload is not None:
        return seed_payload

    payload = _build_stock_payload(
        symbol=symbol,
        position=position,
        market_context={"systemicRiskScore": DEFAULT_SYSTEMIC_SCORE},
    )
    if payload is None:
        return None
    return {"stock": payload["stock"], "risk": payload["risk"]}


def _universe_item_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    stock = payload["stock"]
    risk = payload["risk"]
    screening = payload["screening"]
    return {
        "symbol": stock["symbol"],
        "name": stock["name"],
        "market": stock["market"],
        "sector": stock["sector"],
        "price": stock["price"],
        "changePercent": stock["changePercent"],
        "summary": stock["selectionSummary"],
        "riskLevel": risk["level"],
        "score": screening["composite"],
        "reasons": stock["selectionReasons"],
        "metrics": {
            "trend": screening["trend"],
            "valuation": screening["valuation"],
            "growth": screening["growth"],
            "risk": screening["risk"],
        },
    }


def build_stock_universe(query: str | None = None, limit: int = 20) -> dict[str, Any]:
    settings = get_settings()
    cache_key = "stocks:universe:hybrid:v3"

    def builder() -> list[dict[str, Any]]:
        systemic_score = 52
        base_items: list[dict[str, Any]] = []
        seen_symbols: set[str] = set()

        for symbol in settings.watch_symbols:
            try:
                payload = _build_universe_candidate(symbol=symbol, systemic_score=systemic_score)
            except Exception:
                continue
            if payload:
                base_items.append(payload)
                seen_symbols.add(symbol)

        try:
            hot_rank = _load_hot_rank_snapshot()
        except Exception:
            hot_rank = pd.DataFrame()

        if not hot_rank.empty:
            for _, row in hot_rank.iterrows():
                raw_code = str(row.get("代码") or "").strip()
                symbol = raw_code[-6:] if len(raw_code) >= 6 else raw_code.zfill(6)
                if not symbol or symbol in seen_symbols:
                    continue

                base_items.append(
                    _build_hot_rank_candidate(
                        symbol=symbol,
                        name=str(row.get("股票名称") or symbol),
                        price=to_float(row.get("最新价")),
                        change_percent=to_float(row.get("涨跌幅")),
                        rank=to_int(row.get("当前排名"), len(base_items) + 1),
                        systemic_score=systemic_score,
                    )
                )
                seen_symbols.add(symbol)

        if len(base_items) < 10:
            base_items.extend(_build_featured_catalog_candidates(systemic_score=systemic_score, seen_symbols=seen_symbols))

        return sorted(base_items, key=lambda item: (-item["score"], item["symbol"]))

    items = ttl_cache.get_or_set(cache_key, settings.screener_cache_ttl_seconds, builder)
    if query:
        systemic_score = 52
        catalog_matches = search_stock_catalog(query=query, limit=max(limit, 8))
        mapped_items: list[dict[str, Any]] = []
        for match in catalog_matches:
            if match["symbol"] in UNIVERSE_SEED_PROFILES:
                candidate = _build_universe_candidate(symbol=match["symbol"], systemic_score=systemic_score)
                if candidate:
                    mapped_items.append(candidate)
                continue

            mapped_items.append(
                _build_catalog_candidate(
                    symbol=match["symbol"],
                    name=match["name"],
                    systemic_score=systemic_score,
                )
            )

        items = mapped_items

    return {
        "items": items[:limit],
        "poolName": "市场关注股票池" if not query else "全市场检索候选",
        "poolSize": len(items),
        "poolMode": "hybrid" if not query else "catalog",
        "updatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "catalogSize": len(load_stock_catalog()),
    }


def _passes_filter(item: dict[str, Any], *, trend: str, valuation: str, growth: str, risk: str) -> bool:
    metrics = item["metrics"]
    if trend == "uptrend" and metrics["trend"] < 65:
        return False
    if trend == "breakout" and "放量突破" not in " ".join(item["reasons"]):
        return False

    if valuation == "reasonable" and metrics["valuation"] < 55:
        return False
    if valuation == "low" and metrics["valuation"] < 70:
        return False

    if growth == "positive" and metrics["growth"] < 60:
        return False
    if growth == "strong" and metrics["growth"] < 75:
        return False

    if risk == "low" and item["riskLevel"] != "低风险":
        return False
    if risk == "medium_or_below" and item["riskLevel"] == "高风险":
        return False

    return True


def build_screener_snapshot(
    *,
    trend: str = "all",
    valuation: str = "all",
    growth: str = "all",
    risk: str = "all",
    limit: int = 12,
) -> dict[str, Any]:
    universe = build_stock_universe(limit=50)
    items = universe["items"]
    filtered = [
        item
        for item in items
        if _passes_filter(item, trend=trend, valuation=valuation, growth=growth, risk=risk)
    ]
    filtered = sorted(filtered, key=lambda item: (-item["score"], item["riskLevel"], item["symbol"]))[:limit]

    return {
        "strategies": SCREENING_STRATEGIES,
        "filters": {
            "trend": [
                {"value": "all", "label": "全部趋势"},
                {"value": "uptrend", "label": "趋势向上"},
                {"value": "breakout", "label": "放量突破"},
            ],
            "valuation": [
                {"value": "all", "label": "全部估值"},
                {"value": "reasonable", "label": "估值合理"},
                {"value": "low", "label": "相对低估"},
            ],
            "growth": [
                {"value": "all", "label": "全部成长"},
                {"value": "positive", "label": "正向增长"},
                {"value": "strong", "label": "成长更强"},
            ],
            "risk": [
                {"value": "all", "label": "全部风险"},
                {"value": "medium_or_below", "label": "中风险及以下"},
                {"value": "low", "label": "仅低风险"},
            ],
        },
        "appliedFilters": {
            "trend": trend,
            "valuation": valuation,
            "growth": growth,
            "risk": risk,
        },
        "poolSummary": {
            "poolName": universe["poolName"],
            "poolSize": universe["poolSize"],
            "poolMode": universe["poolMode"],
            "matchCount": len(filtered),
        },
        "items": filtered,
    }
