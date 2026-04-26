from __future__ import annotations

from datetime import datetime
from typing import Any

import akshare as ak
import pandas as pd

from app.core.cache import ttl_cache
from app.core.config import get_settings
from app.services.utils import clamp, format_number, format_trillions, latest_non_null_row, to_float, to_int


INDEX_CONFIG = [
    {"code": "sh000001", "name": "上证指数"},
    {"code": "sz399001", "name": "深证成指"},
    {"code": "sz399006", "name": "创业板指"},
]

GLOBAL_MARKET_TARGETS = [
    {"code": "SPX", "name": "标普500", "note": "衡量全球风险偏好的核心锚。"},
    {"code": "NDX", "name": "纳斯达克", "note": "成长风格与科技情绪的重要风向标。"},
    {"code": "HSI", "name": "恒生指数", "note": "对中概、互联网与南北向情绪更敏感。"},
    {"code": "N225", "name": "日经225", "note": "反映亚洲风险资产与汇率环境变化。"},
    {"code": "GDAXI", "name": "德国DAX30", "note": "观察欧洲制造业与出口链景气。"},
    {"code": "FTSE", "name": "英国富时100", "note": "更偏资源、金融与防御资产配置。"},
]

MOCK_CAPITAL_FLOW_SERIES = {
    "dates": ["周一", "周二", "周三", "周四", "周五"],
    "northbound": [12.4, 18.8, 9.6, 26.7, 21.3],
    "mainForce": [34.0, 52.0, 41.0, 58.0, 49.0],
}


def _load_index_spot() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:index_spot_sina",
        settings.market_cache_ttl_seconds,
        ak.stock_zh_index_spot_sina,
    )


def _load_index_history(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"market:index_history:{symbol}",
        settings.market_cache_ttl_seconds,
        lambda: ak.stock_zh_index_daily(symbol=symbol).tail(10).reset_index(drop=True),
    )


def _load_hsgt_summary() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:hsgt_summary",
        settings.market_cache_ttl_seconds,
        ak.stock_hsgt_fund_flow_summary_em,
    )


def _load_hot_rank() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:hot_rank",
        settings.market_cache_ttl_seconds,
        lambda: ak.stock_hot_rank_em().head(20).reset_index(drop=True),
    )


def _load_board_change() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:board_change",
        settings.market_cache_ttl_seconds,
        lambda: ak.stock_board_change_em().head(40).reset_index(drop=True),
    )


def _load_global_spot() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:global_spot",
        settings.market_cache_ttl_seconds,
        ak.index_global_spot_em,
    )


def _load_macro_china_lpr() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:macro:china_lpr",
        settings.market_cache_ttl_seconds,
        ak.macro_china_lpr,
    )


def _load_macro_china_cpi() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:macro:china_cpi_yearly",
        settings.market_cache_ttl_seconds,
        ak.macro_china_cpi_yearly,
    )


def _load_macro_china_pmi() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:macro:china_pmi_yearly",
        settings.market_cache_ttl_seconds,
        ak.macro_china_pmi_yearly,
    )


def _load_macro_usa_cpi() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:macro:usa_cpi_yoy",
        settings.market_cache_ttl_seconds,
        ak.macro_usa_cpi_yoy,
    )


def _load_market_fund_flow() -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        "market:fund_flow_history",
        settings.market_cache_ttl_seconds,
        ak.stock_market_fund_flow,
    )


def _safe_frame(loader, *, default: pd.DataFrame | None = None) -> pd.DataFrame:
    try:
        frame = loader()
        return frame if isinstance(frame, pd.DataFrame) else (default or pd.DataFrame())
    except Exception:
        return default or pd.DataFrame()


def _find_index_row(spot_frame: pd.DataFrame, code: str, name: str) -> pd.Series | None:
    matched = spot_frame.loc[(spot_frame["代码"] == code) | (spot_frame["名称"] == name)]
    if matched.empty:
        return None
    return matched.iloc[0]


def _build_overview(avg_change: float, up_count: int, down_count: int, northbound_net: float, systemic_score: int) -> dict[str, str]:
    breadth_ratio = up_count / max(down_count, 1)

    if avg_change >= 0.8 and breadth_ratio >= 1.25 and northbound_net >= 0:
        regime = "市场偏强"
        summary = "指数表现、市场宽度与资金承接同步改善，风险偏好处于修复扩散阶段，但高位分化仍需持续跟踪。"
        strategy_note = "更适合围绕主线方向做结构性跟随，避免在尾盘加速或连续冲高阶段情绪化追涨。"
    elif avg_change <= -0.7 or breadth_ratio <= 0.85:
        regime = "风险升温"
        summary = "指数承压叠加下跌家数偏多，短线风险偏好明显回落，当前更需要优先处理仓位与回撤控制。"
        strategy_note = "这类环境更适合先控制风险暴露与交易频率，等待新的承接信号而不是急于博弈反弹。"
    elif abs(avg_change) <= 0.4:
        regime = "市场震荡"
        summary = "指数方向尚未彻底拉开，市场仍处在资金博弈与板块轮动交替的阶段，趋势延续性有待确认。"
        strategy_note = "适合轻仓试错和分批决策，先观察承接能否持续，再决定是否提高风险暴露。"
    else:
        regime = "板块轮动加快"
        summary = "市场仍有活跃方向，但风格切换与强弱分化较快，交易难度高于单边趋势阶段。"
        strategy_note = "如果参与，优先选择趋势完整且量价配合的方向，同时提前明确止损与仓位上限。"

    if systemic_score >= 68:
        risk_level = "高风险"
        primary_call = "先控制风险暴露，再等待确认。"
    elif systemic_score >= 43:
        risk_level = "中风险"
        primary_call = "先判断环境，再决定仓位与节奏。"
    else:
        risk_level = "低风险"
        primary_call = "环境相对温和，但仍要按计划执行。"

    return {
        "regime": regime,
        "riskLevel": risk_level,
        "summary": summary,
        "strategyNote": strategy_note,
        "primaryCall": primary_call,
    }


def _build_risk_signals(avg_change: float, up_count: int, down_count: int, northbound_net: float) -> list[str]:
    signals: list[str] = []
    if northbound_net > 0:
        signals.append(f"北向资金维持净流入，今日净流入约 {northbound_net:.1f} 亿元，增量资金尚未完全撤退。")
    else:
        signals.append(f"北向资金转为净流出，今日净流出约 {abs(northbound_net):.1f} 亿元，场内承接更依赖内资轮动。")

    if up_count > down_count:
        signals.append("上涨家数占优，短线情绪仍有扩散基础，但高位股分歧需要继续观察。")
    else:
        signals.append("下跌家数占优，市场风险偏好偏弱，仓位管理的重要性进一步提升。")

    if abs(avg_change) <= 0.4:
        signals.append("指数波动不大，但板块切换速度仍快，追涨容错率有限。")
    elif avg_change > 0:
        signals.append("指数修复延续，后续更关键的是量能是否继续配合，而不是单日涨幅本身。")
    else:
        signals.append("指数承压背景下，情绪修复更依赖权重与龙头止跌企稳。")

    return signals


def _build_coach_notes(systemic_score: int, regime: str) -> list[str]:
    if systemic_score >= 68:
        return [
            "当前更适合先缩短出手半径，把注意力放在回撤控制而不是抢反弹。",
            "如需参与，应优先等待指数与主线方向同步企稳，再考虑计划内交易。",
            "仓位上限和失效条件要先写清楚，再决定是否执行。",
        ]

    if regime == "市场偏强":
        return [
            "情绪改善阶段最容易犯的错，是把节奏跟随做成情绪化追高。",
            "优先关注量价配合持续的主线方向，不要把所有活跃板块当成同样质量的机会。",
            "市场允许试错，但不支持没有退出条件的重仓冲动。",
        ]

    return [
        "当前更像结构性环境，先确认主线强度，再决定是否提高仓位。",
        "交易节奏要快于预期变化，慢于情绪波动。",
        "把风险收益比放在短线涨跌之前，胜率和赔率要同时看。",
    ]


def _build_hot_sectors(board_frame: pd.DataFrame) -> list[dict[str, Any]]:
    if board_frame.empty:
        return []

    sectors = []
    selected = board_frame.sort_values(["板块异动总次数", "涨跌幅"], ascending=[False, False]).head(4)
    for _, row in selected.iterrows():
        flow = to_float(row["主力净流入"])
        sectors.append(
            {
                "name": str(row["板块名称"]),
                "changePercent": round(to_float(row["涨跌幅"]), 2),
                "reason": (
                    f"异动次数 {to_int(row['板块异动总次数'])} 次，"
                    f"主力净流入 {flow / 1e8:.1f} 亿元，"
                    f"{row['板块异动最频繁个股及所属类型-股票名称']} 对板块活跃度贡献明显。"
                ),
            }
        )
    return sectors


def _build_sector_heatmap(board_frame: pd.DataFrame) -> list[dict[str, Any]]:
    if board_frame.empty:
        return []

    items: list[dict[str, Any]] = []
    selected = board_frame.sort_values(["板块异动总次数", "涨跌幅"], ascending=[False, False]).head(4)
    for _, row in selected.iterrows():
        intensity = clamp(to_float(row["板块异动总次数"]) / 180, 12, 36)
        change = round(to_float(row["涨跌幅"]), 2)
        items.append(
            {
                "name": str(row["板块名称"]),
                "value": round(intensity),
                "change": change,
                "children": [
                    {
                        "name": str(row["板块异动最频繁个股及所属类型-股票名称"]),
                        "value": round(clamp(intensity / 2.2, 6, 16)),
                        "change": change,
                    }
                ],
            }
        )
    return items


def _build_global_markets() -> tuple[list[dict[str, Any]], dict[str, str]]:
    frame = _safe_frame(_load_global_spot)
    if frame.empty:
        return [], {"source": "mock", "label": "全球市场未连通", "note": "当前全球市场卡片暂无法获取实时数据。"}

    items: list[dict[str, Any]] = []
    for target in GLOBAL_MARKET_TARGETS:
        matched = frame.loc[frame["代码"] == target["code"]]
        if matched.empty:
            continue

        row = matched.iloc[0]
        items.append(
            {
                "name": target["name"],
                "value": format_number(to_float(row["最新价"])),
                "changePercent": round(to_float(row["涨跌幅"]), 2),
                "note": target["note"],
            }
        )

    return items, {
        "source": "real" if items else "mock",
        "label": "真实全球行情",
        "note": "卡片行情来自 AKShare 全球指数实时数据。",
    }


def _build_macro_signals() -> tuple[list[dict[str, Any]], dict[str, str]]:
    return [], {
        "source": "mock",
        "label": "演示宏观卡片",
        "note": "宏观卡片当前仍为演示数据，后续将替换为更稳定的真实宏观序列。",
    }


def _build_capital_flow_series(northbound_net: float) -> tuple[dict[str, Any], dict[str, str]]:
    frame = _safe_frame(_load_market_fund_flow)
    if not frame.empty:
        working = frame.copy()
        working["日期"] = pd.to_datetime(working["日期"], errors="coerce")
        working = working.loc[working["日期"].notna()].sort_values("日期")
        if not working.empty:
            latest_date = working.iloc[-1]["日期"]
            days_gap = (datetime.now().date() - latest_date.date()).days
            if days_gap <= 90:
                recent = working.tail(5)
                return (
                    {
                        "dates": [item.strftime("%m-%d") for item in recent["日期"].tolist()],
                        "northbound": [round(to_float(item) / 1e8, 1) for item in recent["主力净流入-净额"].tolist()],
                        "mainForce": [round(to_float(item) / 1e8, 1) for item in recent["超大单净流入-净额"].tolist()],
                    },
                    {
                        "source": "real",
                        "label": "真实资金流序列",
                        "note": "序列来自市场资金流历史数据。",
                    },
                )

    series = {
        **MOCK_CAPITAL_FLOW_SERIES,
        "northbound": [round(value + northbound_net * 0.1, 1) for value in MOCK_CAPITAL_FLOW_SERIES["northbound"]],
    }
    return series, {
        "source": "mock",
        "label": "演示资金流序列",
        "note": "当前历史资金流接口时效不足，图表仍为演示序列。",
    }


def build_market_overview() -> dict[str, Any]:
    spot_frame = _safe_frame(_load_index_spot)
    hsgt_frame = _safe_frame(_load_hsgt_summary)
    hot_rank_frame = _safe_frame(_load_hot_rank)
    board_frame = _safe_frame(_load_board_change)

    index_rows: list[dict[str, Any]] = []
    trend_series = {"dates": [], "series": []}
    turnover_today = 0.0
    turnover_proxy_today = 0.0
    turnover_proxy_previous = 0.0
    index_changes: list[float] = []

    for item in INDEX_CONFIG:
        row = _find_index_row(spot_frame, item["code"], item["name"])
        history = _safe_frame(lambda symbol=item["code"]: _load_index_history(symbol))
        if row is None or history.empty:
            continue

        latest_close = to_float(row["最新价"])
        latest_change = to_float(row["涨跌幅"])
        index_changes.append(latest_change)

        if item["code"] in {"sh000001", "sz399001"}:
            turnover_today += to_float(row["成交额"])
            turnover_proxy_today += to_float(history.iloc[-1]["volume"])
            if len(history) >= 2:
                turnover_proxy_previous += to_float(history.iloc[-2]["volume"])

        if item["name"] == "上证指数":
            note = "权重方向承接相对稳定。" if latest_change >= 0 else "权重板块承压，防御性抬升。"
        elif item["name"] == "深证成指":
            note = "成长风格相对占优。" if latest_change >= 0 else "成长板块弹性不足。"
        else:
            note = "高弹性方向仍有活跃资金参与。" if latest_change >= 0 else "高弹性方向风险偏好回落。"

        index_rows.append(
            {
                "code": item["code"].upper(),
                "name": item["name"],
                "value": format_number(latest_close),
                "changePercent": round(latest_change, 2),
                "note": note,
            }
        )
        trend_series["dates"] = [str(value)[5:] for value in history["date"].tolist()]
        trend_series["series"].append(
            {
                "name": item["name"],
                "values": [round(to_float(value), 2) for value in history["close"].tolist()],
            }
        )

    northbound_rows = hsgt_frame.loc[hsgt_frame["资金方向"] == "北向"] if not hsgt_frame.empty else pd.DataFrame()
    northbound_net = round(northbound_rows["成交净买额"].map(to_float).sum(), 2) if not northbound_rows.empty else 0.0
    up_count = to_int(northbound_rows["上涨数"].sum()) if not northbound_rows.empty else 0
    flat_count = to_int(northbound_rows["持平数"].sum()) if not northbound_rows.empty else 0
    down_count = to_int(northbound_rows["下跌数"].sum()) if not northbound_rows.empty else 0
    breadth_ratio = up_count / max(down_count, 1)
    avg_change = sum(index_changes) / max(len(index_changes), 1)

    systemic_score = round(
        clamp(
            52 - avg_change * 11 - (breadth_ratio - 1) * 16 - clamp(northbound_net / 6, -8, 8),
            18,
            86,
        )
    )
    overview = _build_overview(avg_change, up_count, down_count, northbound_net, systemic_score)

    turnover_change = 0.0
    if turnover_proxy_previous > 0:
        turnover_change = (turnover_proxy_today - turnover_proxy_previous) / turnover_proxy_previous * 100

    hot_stock_name = str(hot_rank_frame.iloc[0]["股票名称"]) if not hot_rank_frame.empty else "暂无热门股"
    index_rows.append(
        {
            "code": "TURNOVER",
            "name": "两市成交额",
            "value": format_trillions(turnover_today),
            "changePercent": round(turnover_change, 2),
            "note": "按上证指数与深证成指成交额合并估算，可用于观察增量资金是否继续入场。",
        }
    )

    global_markets, global_lineage = _build_global_markets()
    macro_signals, macro_lineage = _build_macro_signals()
    capital_flow_series, capital_flow_lineage = _build_capital_flow_series(northbound_net)

    return {
        "productName": "InvestPilot",
        "heroTitle": "用更清晰的中文结论，先判断市场环境，再决定该关注哪些风险与机会。",
        "heroDescription": "首页优先回答市场强弱、情绪温度、主线方向与系统性风险，再把个股、选股、日历和文档分析连接起来。",
        "overview": {
            "updatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
            **overview,
        },
        "indices": index_rows,
        "breadth": [
            {"label": "上涨家数", "value": format_number(up_count, 0), "tone": "positive" if up_count >= down_count else "warning"},
            {"label": "平盘家数", "value": format_number(flat_count, 0), "tone": "warning"},
            {"label": "下跌家数", "value": format_number(down_count, 0), "tone": "negative" if down_count > up_count else "warning"},
            {
                "label": "北向资金",
                "value": f"{'净流入' if northbound_net >= 0 else '净流出'} {abs(northbound_net):.1f} 亿元",
                "tone": "positive" if northbound_net >= 0 else "negative",
            },
            {"label": "热门个股", "value": hot_stock_name, "tone": "warning"},
        ],
        "hotSectors": _build_hot_sectors(board_frame),
        "riskSignals": _build_risk_signals(avg_change, up_count, down_count, northbound_net),
        "coachNotes": _build_coach_notes(systemic_score, overview["regime"]),
        "macroSignals": macro_signals,
        "globalMarkets": global_markets,
        "quickLinks": [
            {"label": "查看市场总览", "href": "/market"},
            {"label": "进入风险评估", "href": "/risk"},
            {"label": "浏览财经日历", "href": "/calendar"},
            {"label": "查看量化选股", "href": "/screener"},
        ],
        "charts": {
            "trendSeries": trend_series,
            "sectorHeatmap": _build_sector_heatmap(board_frame),
            "capitalFlowSeries": capital_flow_series,
        },
        "dataLineage": {
            "indices": {"source": "real", "label": "真实指数行情", "note": "指数、成交额与宽度来自真实行情接口。"},
            "globalMarkets": global_lineage,
            "macroSignals": macro_lineage,
            "capitalFlowSeries": capital_flow_lineage,
        },
        "systemicRiskScore": systemic_score,
    }
