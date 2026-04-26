from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
from datetime import datetime, timedelta
from io import StringIO
from typing import Any

import akshare as ak
import pandas as pd
import requests

from app.core.cache import ttl_cache
from app.core.config import get_settings
from app.services.utils import parse_datetime, to_float


POSITIVE_KEYWORDS = ("增长", "上调", "超预期", "回购", "中标", "扩产", "增持", "买入", "改善", "修复")
NEGATIVE_KEYWORDS = ("下滑", "下调", "减持", "亏损", "风险", "诉讼", "停牌", "质押", "问询", "承压", "波动")
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


def _shorten(text: str, limit: int = 110) -> str:
    content = str(text or "").strip().replace("\n", " ")
    if len(content) <= limit:
        return content
    return f"{content[:limit].rstrip()}..."


def _infer_signal(
    text: str,
    *,
    positive_words: tuple[str, ...] = POSITIVE_KEYWORDS,
    negative_words: tuple[str, ...] = NEGATIVE_KEYWORDS,
) -> str:
    content = str(text or "")
    positive_score = sum(1 for word in positive_words if word in content)
    negative_score = sum(1 for word in negative_words if word in content)
    if positive_score > negative_score:
        return "利好"
    if negative_score > positive_score:
        return "利空"
    return "中性"


def _format_time(value: Any, *, with_time: bool = False) -> str:
    parsed = parse_datetime(value)
    if not parsed:
        return ""
    return parsed.strftime("%Y-%m-%d %H:%M" if with_time else "%Y-%m-%d")


def _sort_by_time_desc(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def sort_key(item: dict[str, Any]) -> float:
        parsed = parse_datetime(item.get("publishedAt"))
        return parsed.timestamp() if parsed else 0.0

    return sorted(items, key=sort_key, reverse=True)


def load_stock_news_frame(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"research:news:{symbol}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.stock_news_em(symbol=symbol)),
    )


def load_stock_research_frame(symbol: str) -> pd.DataFrame:
    settings = get_settings()
    return ttl_cache.get_or_set(
        f"research:reports:{symbol}",
        settings.search_cache_ttl_seconds,
        lambda: _run_quietly(lambda: ak.stock_research_report_em(symbol=symbol)),
    )


def load_stock_announcements_frame(symbol: str, begin_date: str, end_date: str) -> pd.DataFrame:
    settings = get_settings()

    def builder() -> pd.DataFrame:
        url = "https://np-anotice-stock.eastmoney.com/api/security/ann"
        params = {
            "sr": "-1",
            "page_size": "20",
            "page_index": "1",
            "ann_type": "A",
            "client_source": "web",
            "f_node": "0",
            "s_node": "0",
            "stock_list": symbol,
            "begin_time": begin_date,
            "end_time": end_date,
        }
        response = requests.get(url, params=params, timeout=settings.external_request_timeout_seconds)
        response.raise_for_status()
        payload = response.json()
        rows = payload.get("data", {}).get("list", [])
        items: list[dict[str, Any]] = []
        for row in rows:
            code_info = next((item for item in row.get("codes", []) if str(item.get("ann_type", "")).startswith("A")), {})
            column_info = row.get("columns", [{}])[0] if row.get("columns") else {}
            items.append(
                {
                    "symbol": str(code_info.get("stock_code") or symbol).zfill(6),
                    "name": str(code_info.get("short_name") or ""),
                    "title": str(row.get("title") or ""),
                    "noticeType": str(column_info.get("column_name") or "公司公告"),
                    "publishedAt": pd.to_datetime(row.get("notice_date"), errors="coerce"),
                    "url": f"https://data.eastmoney.com/notices/detail/{str(code_info.get('stock_code') or symbol).zfill(6)}/{row.get('art_code')}.html",
                }
            )
        return pd.DataFrame(items)

    return ttl_cache.get_or_set(
        f"research:announcements:{symbol}:{begin_date}:{end_date}",
        settings.search_cache_ttl_seconds,
        builder,
    )


def build_news_cards(symbol: str, company_name: str, limit: int = 4) -> list[dict[str, Any]]:
    frame = load_stock_news_frame(symbol)
    if frame.empty:
        return []

    items: list[dict[str, Any]] = []
    for _, row in frame.head(limit).iterrows():
        title = str(row.get("新闻标题") or f"{company_name} 新闻")
        summary = _shorten(str(row.get("新闻内容") or ""), 120)
        published_at = _format_time(row.get("发布时间"), with_time=True)
        source = str(row.get("文章来源") or "东方财富")
        items.append(
            {
                "title": title,
                "summary": summary,
                "source": source,
                "publishedAt": published_at,
                "url": str(row.get("新闻链接") or ""),
                "tags": ["公司新闻", symbol],
                "signal": _infer_signal(f"{title} {summary}"),
            }
        )

    return _sort_by_time_desc(items)


def build_announcement_cards(symbol: str, company_name: str, limit: int = 4) -> list[dict[str, Any]]:
    end_date = datetime.now().strftime("%Y-%m-%d")
    begin_date = (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d")
    frame = load_stock_announcements_frame(symbol=symbol, begin_date=begin_date, end_date=end_date)
    if frame.empty:
        return []

    items: list[dict[str, Any]] = []
    for _, row in frame.head(limit).iterrows():
        notice_type = str(row.get("noticeType") or "公司公告")
        title = str(row.get("title") or f"{company_name} 公告")
        date_label = _format_time(row.get("publishedAt"))
        items.append(
            {
                "title": title,
                "summary": f"公告类型为 {notice_type}，建议优先核对原文，确认是否涉及业绩、融资、股权变动或风险提示。",
                "source": "东方财富公告",
                "publishedAt": date_label,
                "url": str(row.get("url") or ""),
                "tags": [notice_type],
                "signal": "利空" if any(word in notice_type or word in title for word in NEGATIVE_NOTICE_TYPES) else "中性",
            }
        )
    return _sort_by_time_desc(items)


def build_research_cards(symbol: str, company_name: str, limit: int = 4) -> list[dict[str, Any]]:
    frame = load_stock_research_frame(symbol)
    if frame.empty:
        return []

    items: list[dict[str, Any]] = []
    for _, row in frame.head(limit).iterrows():
        institution = str(row.get("机构") or "机构研报")
        rating = str(row.get("东财评级") or "未评级")
        industry = str(row.get("行业") or "")
        title = str(row.get("报告名称") or f"{company_name} 研报")
        published_at = _format_time(row.get("日期"))
        summary = f"{institution} 给出 {rating} 观点"
        if industry:
            summary += f"，行业分类为 {industry}"
        pe_2025 = to_float(row.get("2025-盈利预测-市盈率"))
        if pe_2025 > 0:
            summary += f"，2025 年预测市盈率约 {pe_2025:.1f} 倍。"
        else:
            summary += "。"
        items.append(
            {
                "title": title,
                "summary": summary,
                "source": institution,
                "publishedAt": published_at,
                "url": str(row.get("报告PDF链接") or ""),
                "tags": [tag for tag in [rating, industry] if tag],
                "signal": "利好"
                if any(word in rating for word in POSITIVE_RATINGS)
                else "利空"
                if any(word in rating for word in NEGATIVE_RATINGS)
                else "中性",
            }
        )
    return _sort_by_time_desc(items)


def build_event_timeline(
    announcements: list[dict[str, Any]],
    research_reports: list[dict[str, Any]],
    news_items: list[dict[str, Any]],
    limit: int = 10,
) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for item in announcements:
        items.append({**item, "kind": "announcement"})
    for item in research_reports:
        items.append({**item, "kind": "research"})
    for item in news_items:
        items.append({**item, "kind": "news"})
    return _sort_by_time_desc(items)[:limit]


def build_source_matrix(
    *,
    has_quote: bool,
    has_financials: bool,
    has_announcements: bool,
    has_research: bool,
    has_news: bool,
) -> list[dict[str, Any]]:
    settings = get_settings()
    fundamentals_provider = settings.preferred_fundamentals_provider
    news_provider = settings.preferred_news_provider
    research_provider = settings.preferred_research_provider
    premium_fundamentals = settings.premium_fundamentals_provider
    premium_news = settings.premium_news_provider

    items = [
        {
            "key": "quote",
            "label": "行情数据",
            "provider": "AKShare / 腾讯历史行情",
            "status": "已接入" if has_quote else "待补齐",
            "note": "用于价格、均线、波动和回撤判断。",
        },
        {
            "key": "fundamentals",
            "label": "财报与估值",
            "provider": fundamentals_provider,
            "status": "已接入" if has_financials else "补充中",
            "note": f"当前主用 {fundamentals_provider}，已预留 {premium_fundamentals} 作为更高等级基础面源。",
        },
        {
            "key": "announcements",
            "label": "公告数据",
            "provider": "东方财富公告中心",
            "status": "已接入" if has_announcements else "补充中",
            "note": "优先展示最近公告并保留原文入口。",
        },
        {
            "key": "research",
            "label": "研报数据",
            "provider": research_provider,
            "status": "已接入" if has_research else "补充中",
            "note": "用于补充机构评级、目标价与行业视角。",
        },
        {
            "key": "news",
            "label": "新闻资讯",
            "provider": news_provider,
            "status": "已接入" if has_news else "补充中",
            "note": f"当前主用 {news_provider}，已预留 {premium_news} 作为更高级资讯源。",
        },
    ]
    return items


def build_research_digest(
    *,
    company_name: str,
    industry: str,
    summary: str,
    thesis: list[str] | None,
    announcements: list[dict[str, Any]],
    research_reports: list[dict[str, Any]],
    news_items: list[dict[str, Any]],
    valuation_highlights: list[dict[str, Any]] | None,
    financial_highlights: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    positives: list[str] = []
    watchpoints: list[str] = []
    next_steps: list[str] = []
    evidence: list[str] = []

    for item in research_reports[:3]:
        rating = "、".join(item.get("tags", [])[:2])
        positives.append(f"{item['source']} 的最新观点为 {rating or '机构跟踪中'}。")
        evidence.append(item["title"])

    for item in announcements[:3]:
        notice_type = item.get("tags", ["公司公告"])[0]
        if item.get("signal") == "利空":
            watchpoints.append(f"最近公告出现 {notice_type}，建议优先核对原文。")
        else:
            next_steps.append(f"继续跟踪 {notice_type} 公告对预期的影响。")
        evidence.append(item["title"])

    for item in news_items[:2]:
        if item.get("signal") == "利好":
            positives.append(f"新闻面暂时偏正向，线索集中在 {item['title']}。")
        elif item.get("signal") == "利空":
            watchpoints.append(f"新闻面出现偏负面线索，需核实 {item['title']}。")
        else:
            next_steps.append(f"新闻线索目前偏中性，适合继续观察 {item['title']}。")

    for item in (financial_highlights or [])[:3]:
        label = item.get("label")
        value = item.get("value")
        note = item.get("note")
        if value and value != "待补充":
            positives.append(f"{label} 当前为 {value}。{note or ''}".strip())

    for item in (valuation_highlights or [])[:2]:
        label = item.get("label")
        value = item.get("value")
        if value and value != "待补充":
            watchpoints.append(f"{label} 口径当前为 {value}，仍需结合行业与后续业绩兑现判断。")

    positives = positives[:3] or [f"{company_name} 的行情、公告、研报链路已开始联通，可用于形成正式研究入口。"] 
    watchpoints = watchpoints[:3] or [f"{industry} 板块与系统性风险仍会影响个股定价，结论不宜脱离市场环境单独看。"] 
    next_steps = next_steps[:3] or [
        f"继续跟踪 {company_name} 的最新公告和机构评级变化。",
        "将当前研究结论与财报披露日、行业景气度和市场情绪联动观察。",
    ]

    return {
        "title": "研究摘要",
        "summary": summary,
        "positives": positives,
        "watchpoints": watchpoints,
        "nextSteps": next_steps,
        "evidence": evidence[:6],
        "overview": (thesis or [])[:3],
        "sourceSummary": {
            "announcements": len(announcements),
            "researchReports": len(research_reports),
            "newsItems": len(news_items),
        },
    }
