from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

import akshare as ak
import pandas as pd

from app.core.cache import ttl_cache
from app.core.config import get_settings
from app.services.utils import to_float, weekday_label


MACRO_KEYWORDS = ("CPI", "PPI", "PMI", "非农", "利率", "央行", "美联储", "GDP", "失业", "消费", "制造业")
CHINA_KEYWORDS = ("中国", "中国台湾", "中国香港")


def _load_macro_for_day(target: date) -> pd.DataFrame:
    settings = get_settings()
    key = f"calendar:macro:{target.isoformat()}"
    return ttl_cache.get_or_set(
        key,
        settings.calendar_cache_ttl_seconds,
        lambda: ak.macro_info_ws(date=target.strftime("%Y%m%d")),
    )


def _load_report_schedule() -> pd.DataFrame:
    settings = get_settings()
    current = datetime.now()
    period = f"{current.year - 1}年报"
    key = f"calendar:report:{period}"
    return ttl_cache.get_or_set(
        key,
        settings.calendar_cache_ttl_seconds,
        lambda: ak.stock_report_disclosure(market="沪深京", period=period),
    )


def _load_earnings_preview() -> pd.DataFrame:
    settings = get_settings()
    current = datetime.now()
    quarter = ((current.month - 1) // 3 + 1) * 3
    period = f"{current.year}{quarter:02d}{'31' if quarter in {3, 12} else '30'}"
    key = f"calendar:earnings:{period}"
    return ttl_cache.get_or_set(
        key,
        settings.calendar_cache_ttl_seconds,
        lambda: ak.stock_yjyg_em(date=period),
    )


def _safe_frame(loader) -> pd.DataFrame:
    try:
        frame = loader()
        return frame if isinstance(frame, pd.DataFrame) else pd.DataFrame()
    except Exception:
        return pd.DataFrame()


def _importance_from_macro(event: str, actual: float, expected: float) -> str:
    if any(keyword in event for keyword in ("非农", "利率", "美联储", "央行", "CPI", "PMI")):
        return "高"
    if expected and abs(actual - expected) / max(abs(expected), 1) >= 0.1:
        return "高"
    return "中"


def _bias_text(actual: float, expected: float, previous: float) -> str:
    segments = []
    if actual:
        segments.append(f"今值 {actual:g}")
    if expected:
        segments.append(f"预期 {expected:g}")
    if previous:
        segments.append(f"前值 {previous:g}")
    return " / ".join(segments) if segments else "等待数据更新"


def build_calendar_events() -> dict[str, Any]:
    today = date.today()
    items: list[dict[str, Any]] = []

    for offset in range(0, 7):
        current_day = today + timedelta(days=offset)
        macro_frame = _safe_frame(lambda target=current_day: _load_macro_for_day(target))
        if macro_frame.empty:
            continue

        macro_frame = macro_frame.copy()
        macro_frame["importance_rank"] = macro_frame["重要性"].map(to_float)
        macro_frame = macro_frame.loc[
            macro_frame["事件"].astype(str).str.contains("|".join(MACRO_KEYWORDS), na=False)
            | macro_frame["地区"].astype(str).str.contains("|".join(CHINA_KEYWORDS), na=False)
        ].sort_values(["importance_rank", "时间"], ascending=[False, True])

        for index, (_, row) in enumerate(macro_frame.head(5).iterrows()):
            event_time = pd.to_datetime(row["时间"])
            actual = to_float(row["今值"])
            expected = to_float(row["预期"])
            previous = to_float(row["前值"])
            items.append(
                {
                    "id": f"macro-{current_day.isoformat()}-{index}",
                    "date": event_time.strftime("%m-%d"),
                    "weekday": weekday_label(event_time),
                    "time": event_time.strftime("%H:%M"),
                    "type": "宏观",
                    "importance": _importance_from_macro(str(row["事件"]), actual, expected),
                    "title": f"{row['地区']} {row['事件']}",
                    "detail": f"{_bias_text(actual, expected, previous)}，建议结合外盘与利率预期同步观察。",
                }
            )

    report_frame = _safe_frame(_load_report_schedule).copy()
    if not report_frame.empty:
        report_frame["首次预约"] = pd.to_datetime(report_frame["首次预约"], errors="coerce")
        report_frame = report_frame.loc[
            report_frame["首次预约"].notna()
            & (report_frame["首次预约"].dt.date >= today)
            & (report_frame["首次预约"].dt.date <= today + timedelta(days=7))
        ].sort_values("首次预约")

        for index, (_, row) in enumerate(report_frame.head(8).iterrows()):
            scheduled = row["首次预约"]
            items.append(
                {
                    "id": f"report-{row['股票代码']}-{index}",
                    "date": scheduled.strftime("%m-%d"),
                    "weekday": weekday_label(scheduled),
                    "time": "09:00",
                    "type": "财报",
                    "importance": "高" if row["股票代码"] in {"300750", "600519", "601899", "000333", "688111"} else "中",
                    "title": f"{row['股票简称']} 年报预约披露",
                    "detail": f"来自预约披露时间表，股票代码 {row['股票代码']}，适合提前安排财报跟踪与风险复核。",
                }
            )

    earnings_frame = _safe_frame(_load_earnings_preview).copy()
    if not earnings_frame.empty:
        earnings_frame["公告日期"] = pd.to_datetime(earnings_frame["公告日期"], errors="coerce")
        earnings_frame = earnings_frame.loc[
            earnings_frame["公告日期"].notna()
            & (earnings_frame["公告日期"].dt.date >= today)
            & (earnings_frame["公告日期"].dt.date <= today + timedelta(days=7))
            & (earnings_frame["预测指标"] == "归属于上市公司股东的净利润")
        ].sort_values("公告日期")

        for index, (_, row) in enumerate(earnings_frame.head(8).iterrows()):
            announce_date = row["公告日期"]
            items.append(
                {
                    "id": f"earnings-{row['股票代码']}-{index}",
                    "date": announce_date.strftime("%m-%d"),
                    "weekday": weekday_label(announce_date),
                    "time": "18:00",
                    "type": "重要事件",
                    "importance": "高" if abs(to_float(row["业绩变动幅度"])) >= 30 else "中",
                    "title": f"{row['股票简称']} 业绩预告跟踪",
                    "detail": f"{row['预告类型']}，业绩变动幅度约 {to_float(row['业绩变动幅度']):.1f}%，适合结合估值与板块情绪同步观察。",
                }
            )

    items = sorted(items, key=lambda item: (item["date"], item["time"], item["title"]))
    filter_order = {"财报": 0, "宏观": 1, "重要事件": 2}
    filters = sorted({item["type"] for item in items}, key=lambda value: filter_order.get(value, 9))
    return {"filters": filters, "items": items}
