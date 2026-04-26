from __future__ import annotations

import re
from typing import Any

from app.core.cache import ttl_cache
from app.core.config import get_settings


SUMMARY_KEYWORDS = ["收入", "利润", "订单", "毛利", "现金流", "景气", "增长", "改善", "指引", "产能", "需求"]
HIGHLIGHT_KEYWORDS = ["增长", "改善", "超预期", "回暖", "上调", "提升", "修复", "新签", "扩张", "兑现"]
RISK_KEYWORDS = ["风险", "回撤", "下滑", "压力", "波动", "不确定", "减值", "诉讼", "汇率", "价格战", "放缓"]
INSTITUTION_KEYWORDS = ["机构", "券商", "维持", "增持", "买入", "审慎", "中性", "上调", "下调", "预计", "看好"]


def _normalize_text(text: str) -> str:
    return re.sub(r"[ \t]{2,}", " ", text.replace("\r\n", "\n").replace("\r", "\n")).strip()


def _split_sentences(text: str) -> list[str]:
    cleaned = _normalize_text(text)
    if not cleaned:
        return []
    parts = re.split(r"(?<=[。！？；;.!?])", cleaned)
    return [item.strip() for item in parts if item.strip()]


def _score_sentence(sentence: str, keywords: list[str]) -> int:
    keyword_score = sum(3 for keyword in keywords if keyword in sentence)
    numeric_score = 2 if re.search(r"\d", sentence) else 0
    length_score = 1 if 14 <= len(sentence) <= 90 else 0
    return keyword_score + numeric_score + length_score


def _pick_top_sentences(sentences: list[str], keywords: list[str], limit: int) -> list[str]:
    ranked = [
        {"sentence": sentence, "index": index, "score": _score_sentence(sentence, keywords)}
        for index, sentence in enumerate(sentences)
    ]
    selected = sorted(
        (item for item in ranked if item["score"] > 0),
        key=lambda item: (-item["score"], item["index"]),
    )[:limit]
    return [item["sentence"] for item in sorted(selected, key=lambda item: item["index"])]


def _extract_title(source_name: str, text: str) -> str:
    for line in _normalize_text(text).split("\n"):
        candidate = line.strip()
        if 6 <= len(candidate) <= 48:
            return candidate
    return source_name or "文档提炼结果"


def _extract_key_data(text: str) -> list[str]:
    rows: list[str] = []
    for line in _normalize_text(text).split("\n"):
        candidate = line.strip(" -•\t")
        if re.search(r"\d", candidate) and len(candidate) <= 96:
            rows.append(candidate)
        if len(rows) >= 5:
            break
    return rows


def _build_core_conclusion(summary_sentences: list[str], highlight_sentences: list[str], risk_sentences: list[str]) -> str:
    if summary_sentences:
        return "".join(summary_sentences[:2])
    if highlight_sentences and len(highlight_sentences) >= len(risk_sentences):
        return "当前材料更支持基本面改善的判断，但仍需结合后续财务兑现与行业数据继续验证。"
    if risk_sentences:
        return "当前材料中的风险约束较多，投资判断更适合建立在后续数据验证基础之上。"
    return "当前文本已完成结构化提炼，但关键信息仍建议结合财报、公告和行业数据交叉验证。"


def _build_institution_summary(highlights: list[str], risks: list[str], institution_sentences: list[str]) -> str:
    if institution_sentences:
        return "机构观点更关注以下几条主线：" + "；".join(institution_sentences[:2]).rstrip("。") + "。"

    if len(highlights) >= len(risks) + 1:
        return "机构视角更偏向确认基本面改善与盈利兑现，重点在于后续数据能否跟上当前预期。"

    if len(risks) > len(highlights):
        return "机构视角更强调需求、利润率与估值承接的验证，当前更适合把乐观预期落到具体数据上。"

    return "机构视角整体偏中性，既认可材料中的积极变化，也强调后续验证的重要性。"


def _build_conclusion(highlights: list[str], risks: list[str]) -> str:
    if len(highlights) >= len(risks) + 1:
        return "结论偏中性偏多。当前材料更支持基本面修复，但更适合在后续业绩兑现后再提高信心。"
    if len(risks) > len(highlights):
        return "结论偏中性偏谨慎。当前风险项仍然较多，参与前应先明确盈利验证路径与风险边界。"
    return "结论偏中性。材料中既有亮点也有约束，更适合继续跟踪后续财报、订单和行业数据。"


def summarize_document(text: str, source_name: str = "粘贴文本", source_type: str = "text") -> dict[str, Any]:
    normalized = _normalize_text(text)
    if not normalized:
        raise ValueError("未检测到可用于提炼的文本内容。")

    cache_key = f"document:{hash((normalized, source_name, source_type))}"
    settings = get_settings()

    def builder() -> dict[str, Any]:
        sentences = _split_sentences(normalized)
        summary_sentences = _pick_top_sentences(sentences, SUMMARY_KEYWORDS, 2)
        highlight_sentences = _pick_top_sentences(sentences, HIGHLIGHT_KEYWORDS, 4)
        risk_sentences = _pick_top_sentences(sentences, RISK_KEYWORDS, 3)
        institution_sentences = _pick_top_sentences(sentences, INSTITUTION_KEYWORDS, 2)

        if not highlight_sentences:
            highlight_sentences = sentences[:4]

        if not risk_sentences:
            risk_sentences = [
                "当前文本未出现明确风险句，但仍需结合财报、公告与行业数据继续复核。"
            ]

        return {
            "title": _extract_title(source_name, normalized),
            "sourceName": source_name,
            "sourceType": source_type,
            "characterCount": len(normalized),
            "summary": _build_core_conclusion(summary_sentences, highlight_sentences, risk_sentences),
            "conclusion": _build_conclusion(highlight_sentences, risk_sentences),
            "highlights": highlight_sentences,
            "keyData": _extract_key_data(normalized),
            "risks": risk_sentences,
            "institutionSummary": _build_institution_summary(highlight_sentences, risk_sentences, institution_sentences),
        }

    return ttl_cache.get_or_set(cache_key, settings.document_cache_ttl_seconds, builder)
