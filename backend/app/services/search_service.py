from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
from datetime import datetime, timedelta
from io import StringIO
from typing import Any

import akshare as ak
import pandas as pd

from app.core.cache import ttl_cache
from app.core.config import get_settings
from app.services.lookup_service import search_stock_catalog
from app.services.utils import parse_datetime, to_float


SEARCH_TYPES = [
    {"key": "all", "label": "全部情报"},
    {"key": "news", "label": "新闻"},
    {"key": "announcements", "label": "公告"},
    {"key": "research", "label": "机构观点"},
    {"key": "digest", "label": "市场情报"},
]

POSITIVE_KEYWORDS = ("增长", "上调", "超预期", "回购", "中标", "新签", "扩产", "增持", "买入", "改善", "修复")
NEGATIVE_KEYWORDS = ("下滑", "下调", "减持", "亏损", "风险", "诉讼", "停牌", "质押", "减值", "问询", "承压", "波动")
NEGATIVE_NOTICE_TYPES = ("风险提示", "问询", "诉讼", "减持", "冻结", "质押", "延期", "处罚")
POSITIVE_RATINGS = ("买入", "增持", "强烈推荐", "推荐")
NEGATIVE_RATINGS = ("减持", "卖出", "回避")


def _run_quietly(loader) -> pd.DataFrame:
    try:
        with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
            frame = loader()
    except Exception:
        return pd.DataFrame()

    return frame if isinstance(frame, pd.DataFrame) else pd.DataFrame()


def _format_time(value: Any, *, with_time: bool = True) -> str:
    parsed = parse_datetime(value)
    if not parsed:
        return ""
    return parsed.strftime("%Y-%m-%d %H:%M" if with_time else "%Y-%m-%d")


def _sort_by_time_desc(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def sort_key(item: dict[str, Any]) -> float:
        parsed = parse_datetime(item.get("publishedAt"))
        return parsed.timestamp() if parsed else 0.0

    return sorted(items, key=sort_key, reverse=True)


def _shorten(text: str, limit: int = 88) -> str:
    content = str(text or "").strip().replace("\n", " ")
    if len(content) <= limit:
        return content
    return f"{content[:limit].rstrip()}..."


def _extract_text(title: str, summary: str, source: str, published_at: str) -> str:
    segments = [title, summary]
    if source:
        segments.append(f"来源：{source}")
    if published_at:
        segments.append(f"时间：{published_at}")
    return "\n".join(segment for segment in segments if segment)


def _infer_signal(text: str, *, positive_words: tuple[str, ...] = POSITIVE_KEYWORDS, negative_words: tuple[str, ...] = NEGATIVE_KEYWORDS) -> str:
    content = str(text or "")
    positive_score = sum(1 for word in positive_words if word in content)
    negative_score = sum(1 for word in negative_words if word in content)
    if positive_score > negative_score:
        return "利好"
    if negative_score > positive_score:
        return "利空"
    return "中性"


def _build_guide(keyword: str) -> dict[str, Any]:
    has_query = bool(keyword.strip())
    return {
        "title": "结构化情报搜索工作台",
        "description": (
            "当前已接入个股新闻、公告和研报三类真实情报源，适合围绕股票代码、简称或拼音缩写快速补充研究。"
            if has_query
            else "输入股票代码、公司简称或拼音缩写后，系统会返回结构化情报；不输入关键词时，会先展示市场级情报摘要。"
        ),
        "tips": [
            "优先输入股票代码、完整简称或拼音缩写，匹配会更稳定。",
            "公告更适合核对原文，研报更适合快速把握机构评级与观点倾向。",
            "情报搜索当前已可用于研究辅助，但还不是全网新闻聚合与去重引擎。",
        ],
        "exampleQueries": ["300750", "宁德时代", "ndsd", "zsyh", "美的集团"],
    }


def _load_market_digest(day: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"search:digest:cctv:{day}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.news_cctv(date=day)),
    )


def _load_macro_digest(day: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"search:digest:macro:{day}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.news_economic_baidu(date=day)),
    )


def _load_report_digest(day: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"search:digest:report:{day}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.news_report_time_baidu(date=day)),
    )


def _build_market_digest(keyword: str, limit: int) -> list[dict[str, Any]]:
    day = datetime.now().strftime("%Y%m%d")
    fallback_day = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")

    cctv_frame = _load_market_digest(day)
    if cctv_frame.empty:
        cctv_frame = _load_market_digest(fallback_day)

    macro_frame = _load_macro_digest(day)
    report_frame = _load_report_digest(day)

    items: list[dict[str, Any]] = []

    if not cctv_frame.empty:
        working = cctv_frame.copy()
        if keyword.strip():
            lowered = keyword.strip().lower()
            mask = working["title"].astype(str).str.lower().str.contains(lowered, na=False) | working["content"].astype(str).str.lower().str.contains(lowered, na=False)
            working = working.loc[mask]

        for index, row in working.head(max(2, limit // 2)).iterrows():
            published_at = _format_time(row.get("date"), with_time=False)
            summary = _shorten(str(row["content"]), 120)
            title = str(row["title"])
            source = "新闻联播"
            items.append(
                {
                    "id": f"digest-cctv-{index}",
                    "type": "digest",
                    "title": title,
                    "summary": summary,
                    "publishedAt": published_at,
                    "source": source,
                    "url": "",
                    "tags": ["市场情报", "政策跟踪"],
                    "signal": _infer_signal(f"{title} {summary}"),
                    "extractText": _extract_text(title, summary, source, published_at),
                }
            )

    if not macro_frame.empty:
        important = macro_frame.copy().sort_values(["重要性"], ascending=[False]).head(2)
        for index, row in important.iterrows():
            title = str(row.get("事件") or "宏观事件")
            region = str(row.get("地区") or "全球")
            published_at = f"{_format_time(row.get('日期'), with_time=False)} {row.get('时间') or ''}".strip()
            summary = f"{region} {title}，公布值 {row.get('公布') if row.get('公布') is not None else '--'}，前值 {row.get('前值') if row.get('前值') is not None else '--'}。"
            source = "百度股市通"
            items.append(
                {
                    "id": f"digest-macro-{index}",
                    "type": "digest",
                    "title": title,
                    "summary": summary,
                    "publishedAt": published_at,
                    "source": source,
                    "url": "",
                    "tags": ["宏观日历", region],
                    "signal": "中性",
                    "extractText": _extract_text(title, summary, source, published_at),
                }
            )

    if not report_frame.empty and len(items) < limit:
        upcoming = report_frame.copy().sort_values(["市值"], ascending=[False]).head(2)
        for index, row in upcoming.iterrows():
            title = f"{row.get('股票简称') or row.get('股票代码')} 即将披露 {row.get('财报类型') or '财报'}"
            published_at = _format_time(row.get("发布日期"), with_time=False)
            summary = f"{row.get('股票简称') or row.get('股票代码')} 将在 {published_at or '近期'} 披露 {row.get('财报类型') or '财报'}，适合提前纳入情报和复盘观察。"
            source = "百度股市通"
            items.append(
                {
                    "id": f"digest-report-{index}",
                    "type": "digest",
                    "title": title,
                    "summary": summary,
                    "publishedAt": published_at,
                    "source": source,
                    "url": "",
                    "tags": ["财报日历", str(row.get("交易所") or "")],
                    "signal": "中性",
                    "extractText": _extract_text(title, summary, source, published_at),
                }
            )

    return _sort_by_time_desc(items)[:limit]


def _load_stock_news(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"search:news:{symbol}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.stock_news_em(symbol=symbol)),
    )


def _load_stock_announcements(symbol: str, begin_date: str, end_date: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"search:announcements:{symbol}:{begin_date}:{end_date}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(
            lambda: ak.stock_individual_notice_report(
                security=symbol,
                symbol="全部",
                begin_date=begin_date,
                end_date=end_date,
            )
        ),
    )


def _load_stock_research(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"search:research:{symbol}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.stock_research_report_em(symbol=symbol)),
    )


def _build_news_items(symbol: str, name: str, limit: int) -> list[dict[str, Any]]:
    frame = _load_stock_news(symbol)
    if frame.empty:
        return []

    items: list[dict[str, Any]] = []
    for index, row in frame.head(limit).iterrows():
        title = str(row["新闻标题"])
        summary = _shorten(str(row["新闻内容"]), 110)
        published_at = _format_time(row.get("发布时间"))
        source = str(row.get("文章来源") or "东方财富")
        items.append(
            {
                "id": f"news-{symbol}-{index}",
                "type": "news",
                "title": title,
                "summary": summary,
                "publishedAt": published_at,
                "source": source,
                "url": str(row.get("新闻链接") or ""),
                "tags": [name, symbol, "个股新闻"],
                "signal": _infer_signal(f"{title} {summary}"),
                "extractText": _extract_text(title, summary, source, published_at),
            }
        )

    return _sort_by_time_desc(items)


def _build_announcement_items(symbol: str, name: str, limit: int) -> list[dict[str, Any]]:
    end_date = datetime.now().strftime("%Y%m%d")
    begin_date = (datetime.now() - timedelta(days=45)).strftime("%Y%m%d")
    frame = _load_stock_announcements(symbol=symbol, begin_date=begin_date, end_date=end_date)
    if frame.empty:
        return []

    items: list[dict[str, Any]] = []
    for index, row in frame.head(limit).iterrows():
        notice_type = str(row.get("公告类型") or "公司公告")
        title = str(row["公告标题"])
        published_at = _format_time(row.get("公告日期"), with_time=False)
        source = "东方财富公告"
        summary = f"{name}披露 {notice_type}，建议结合公告原文判断是否涉及业绩、融资、股权或风险提示。"
        signal = "利空" if any(word in notice_type or word in title for word in NEGATIVE_NOTICE_TYPES) else "中性"
        items.append(
            {
                "id": f"announcement-{symbol}-{index}",
                "type": "announcements",
                "title": title,
                "summary": summary,
                "publishedAt": published_at,
                "source": source,
                "url": str(row.get("网址") or ""),
                "tags": [notice_type, symbol],
                "signal": signal,
                "extractText": _extract_text(title, summary, source, published_at),
            }
        )

    return _sort_by_time_desc(items)


def _build_research_items(symbol: str, name: str, limit: int) -> list[dict[str, Any]]:
    frame = _load_stock_research(symbol)
    if frame.empty:
        return []

    items: list[dict[str, Any]] = []
    for index, row in frame.head(limit).iterrows():
        institution = str(row.get("机构") or "机构研报")
        rating = str(row.get("东财评级") or "未评级")
        industry = str(row.get("行业") or "行业跟踪")
        title = str(row.get("报告名称") or f"{name}研报")
        published_at = _format_time(row.get("日期"), with_time=False)
        source = institution
        summary = f"{institution}给出 {rating} 观点，行业归类为 {industry}，可用于快速把握机构的核心判断与评级倾向。"
        signal = "利好" if any(word in rating for word in POSITIVE_RATINGS) else "利空" if any(word in rating for word in NEGATIVE_RATINGS) else "中性"
        items.append(
            {
                "id": f"research-{symbol}-{index}",
                "type": "research",
                "title": title,
                "summary": summary,
                "publishedAt": published_at,
                "source": source,
                "url": str(row.get("报告PDF链接") or ""),
                "tags": [rating, industry, symbol],
                "signal": signal,
                "extractText": _extract_text(title, summary, source, published_at),
            }
        )

    return _sort_by_time_desc(items)


def _build_tabs(sections: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    total_count = sum(section["count"] for key, section in sections.items() if key != "digest")
    digest_count = sections["digest"]["count"]

    counts = {
        "all": total_count if total_count else digest_count,
        "news": sections["news"]["count"],
        "announcements": sections["announcements"]["count"],
        "research": sections["research"]["count"],
        "digest": digest_count,
    }

    return [
        {
            "key": item["key"],
            "label": item["label"],
            "count": counts[item["key"]],
        }
        for item in SEARCH_TYPES
    ]


def _build_signal_breakdown(sections: dict[str, dict[str, Any]]) -> dict[str, int]:
    items = [item for section in sections.values() for item in section["items"]]
    return {
        "positive": sum(1 for item in items if item.get("signal") == "利好"),
        "negative": sum(1 for item in items if item.get("signal") == "利空"),
        "neutral": sum(1 for item in items if item.get("signal") == "中性"),
    }


def build_search_intel(query: str = "", limit: int = 6) -> dict[str, Any]:
    keyword = str(query or "").strip()
    guide = _build_guide(keyword)
    candidates = search_stock_catalog(keyword, limit=6) if keyword else []
    resolved = candidates[0] if candidates else None

    news_items = _build_news_items(resolved["symbol"], resolved["name"], limit) if resolved else []
    announcement_items = _build_announcement_items(resolved["symbol"], resolved["name"], limit) if resolved else []
    research_items = _build_research_items(resolved["symbol"], resolved["name"], limit) if resolved else []
    digest_items = _build_market_digest(keyword, limit if not keyword or not resolved else 4)

    sections = {
        "news": {
            "label": "新闻",
            "count": len(news_items),
            "items": news_items,
            "emptyMessage": "当前未获取到相关新闻。",
        },
        "announcements": {
            "label": "公告",
            "count": len(announcement_items),
            "items": announcement_items,
            "emptyMessage": "当前未获取到公告结果。",
        },
        "research": {
            "label": "机构观点",
            "count": len(research_items),
            "items": research_items,
            "emptyMessage": "当前未获取到机构观点结果。",
        },
        "digest": {
            "label": "市场情报",
            "count": len(digest_items),
            "items": digest_items,
            "emptyMessage": "当前未获取到市场级情报。",
        },
    }

    total_hits = sum(section["count"] for key, section in sections.items() if key != "digest")
    if resolved:
        summary_title = f"{resolved['name']} 情报跟踪"
        summary_description = f"已围绕 {resolved['name']}（{resolved['symbol']}）聚合新闻、公告和机构观点，可直接用于事件跟踪、公告核对与研究补充。"
    elif keyword:
        summary_title = "未锁定明确个股，已回退到市场级情报"
        summary_description = "当前更适合输入股票代码、完整简称或拼音缩写。系统已先返回市场级情报，帮助你快速判断是否值得继续深挖。"
    else:
        summary_title = "情报搜索工作台"
        summary_description = "输入股票代码、简称或拼音缩写后，可快速补充新闻、公告和机构观点；不输入关键词时，则先展示市场级情报摘要。"

    return {
        "query": {
            "keyword": keyword,
            "limit": limit,
            "hasQuery": bool(keyword),
        },
        "summary": {
            "title": summary_title,
            "description": summary_description,
            "totalHits": total_hits,
            "signalBreakdown": _build_signal_breakdown(sections),
        },
        "resolved": resolved,
        "candidates": candidates,
        "tabs": _build_tabs(sections),
        "sections": sections,
        "guide": guide,
        "updatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
