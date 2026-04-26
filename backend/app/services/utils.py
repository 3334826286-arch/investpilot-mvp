from __future__ import annotations

from datetime import date, datetime
from typing import Any

import pandas as pd


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def to_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default

    if isinstance(value, str):
        cleaned = (
            value.replace(",", "")
            .replace("%", "")
            .replace("亿", "")
            .replace("万亿", "")
            .replace("万元", "")
            .replace("元", "")
            .strip()
        )
        if not cleaned or cleaned in {"nan", "None", "--"}:
            return default
        value = cleaned

    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default

    if pd.isna(numeric):
        return default

    return numeric


def to_int(value: Any, default: int = 0) -> int:
    return int(round(to_float(value, float(default))))


def format_number(value: float, digits: int = 2) -> str:
    return f"{value:,.{digits}f}"


def format_percent(value: float, digits: int = 2) -> str:
    return f"{value:.{digits}f}%"


def format_billions(value: float) -> str:
    return f"{value / 1e8:.1f} 亿"


def format_trillions(value: float) -> str:
    return f"{value / 1e12:.2f} 万亿"


def safe_get_row_value(frame: pd.DataFrame, label: str, period: str) -> float:
    matched = frame.loc[frame["指标"] == label]
    if matched.empty or period not in matched.columns:
        return 0.0
    return to_float(matched.iloc[0][period], 0.0)


def latest_financial_period(frame: pd.DataFrame) -> str | None:
    period_columns = [column for column in frame.columns if str(column).isdigit()]
    return period_columns[0] if period_columns else None


def previous_year_period(period: str | None) -> str | None:
    if not period or not period.isdigit() or len(period) != 8:
        return None
    return str(int(period) - 10000)


def growth_rate(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0
    return (current - previous) / abs(previous) * 100


def infer_market(symbol: str) -> str:
    if symbol.startswith("300"):
        return "创业板"
    if symbol.startswith("688"):
        return "科创板"
    if symbol.startswith(("8", "4")):
        return "北交所"
    return "主板"


def weekday_label(value: date | datetime) -> str:
    mapping = {
        0: "周一",
        1: "周二",
        2: "周三",
        3: "周四",
        4: "周五",
        5: "周六",
        6: "周日"
    }
    return mapping[value.weekday()]


def parse_datetime(value: Any) -> datetime | None:
    if value is None:
        return None

    parsed = pd.to_datetime(value, errors="coerce")
    if pd.isna(parsed):
        return None

    if isinstance(parsed, pd.Timestamp):
        return parsed.to_pydatetime()
    return parsed


def latest_non_null_row(frame: pd.DataFrame, value_column: str, date_column: str) -> pd.Series | None:
    if frame.empty:
        return None

    working = frame.copy()
    working[date_column] = pd.to_datetime(working[date_column], errors="coerce")
    working[value_column] = pd.to_numeric(working[value_column], errors="coerce")
    working = working.loc[working[date_column].notna() & working[value_column].notna()]
    if working.empty:
        return None
    return working.sort_values(date_column).iloc[-1]
