from __future__ import annotations

from typing import Any

import akshare as ak
from pypinyin import Style, lazy_pinyin

from app.core.cache import ttl_cache
from app.services.utils import infer_market


CATALOG_CACHE_TTL_SECONDS = 60 * 60 * 12


def normalize_search_text(value: str) -> str:
    return str(value or "").replace(" ", "").replace("*", "").strip().lower()


def build_pinyin_tokens(name: str) -> tuple[str, str]:
    cleaned = str(name or "").replace(" ", "").strip()
    if not cleaned:
        return "", ""

    full = "".join(lazy_pinyin(cleaned))
    initials = "".join(lazy_pinyin(cleaned, style=Style.FIRST_LETTER))
    return full.lower(), initials.lower()


def load_stock_catalog() -> list[dict[str, Any]]:
    def builder() -> list[dict[str, Any]]:
        frame = ak.stock_info_a_code_name()
        items: list[dict[str, Any]] = []

        for _, row in frame.iterrows():
            symbol = str(row["code"]).strip().zfill(6)
            name = str(row["name"]).strip().replace(" ", "")
            full_pinyin, initials = build_pinyin_tokens(name)
            items.append(
                {
                    "symbol": symbol,
                    "name": name,
                    "market": infer_market(symbol),
                    "normalizedName": normalize_search_text(name),
                    "pinyin": full_pinyin,
                    "initials": initials,
                }
            )

        return items

    return ttl_cache.get_or_set("lookup:stock_catalog", CATALOG_CACHE_TTL_SECONDS, builder)


def _catalog_match_score(item: dict[str, Any], keyword: str) -> int:
    if item["symbol"] == keyword:
        return 100
    if item["normalizedName"] == keyword:
        return 98
    if item["initials"] == keyword:
        return 96
    if item["pinyin"] == keyword:
        return 95
    if item["symbol"].startswith(keyword):
        return 92
    if item["normalizedName"].startswith(keyword):
        return 90
    if item["initials"].startswith(keyword):
        return 88
    if item["pinyin"].startswith(keyword):
        return 86
    if keyword in item["normalizedName"]:
        return 82
    if keyword in item["initials"]:
        return 80
    if keyword in item["pinyin"]:
        return 78
    if keyword in item["symbol"]:
        return 74
    return 0


def search_stock_catalog(query: str, limit: int = 8) -> list[dict[str, Any]]:
    keyword = normalize_search_text(query)
    if not keyword:
        return []

    scored: list[dict[str, Any]] = []
    for item in load_stock_catalog():
        score = _catalog_match_score(item, keyword)
        if score <= 0:
            continue

        scored.append(
            {
                "symbol": item["symbol"],
                "name": item["name"],
                "market": item["market"],
                "score": score,
                "matchType": (
                    "symbol"
                    if keyword in item["symbol"]
                    else "name"
                    if keyword in item["normalizedName"]
                    else "pinyin"
                ),
            }
        )

    scored.sort(key=lambda item: (-item["score"], item["symbol"]))
    return scored[:limit]
