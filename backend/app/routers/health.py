from __future__ import annotations

from datetime import datetime, timezone
from time import perf_counter

from fastapi import APIRouter

from app.core.config import get_settings

from app.core.response import build_response

router = APIRouter(tags=["health"])
settings = get_settings()
started_at = perf_counter()


def _runtime_seconds() -> int:
    return int(perf_counter() - started_at)


@router.get("/health")
def get_health() -> dict:
    return build_response(
        {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.env,
            "appVersion": settings.app_version,
            "releaseChannel": settings.release_channel,
            "runtimeSeconds": _runtime_seconds(),
        }
    )


@router.get("/health/live")
def get_liveness() -> dict:
    return build_response(
        {
            "status": "alive",
            "service": settings.app_name,
            "checkedAt": datetime.now(timezone.utc).isoformat(),
        }
    )


@router.get("/health/ready")
def get_readiness() -> dict:
    return build_response(
        {
            "status": "ready",
            "service": settings.app_name,
            "runtimeSeconds": _runtime_seconds(),
            "apiPrefix": settings.api_prefix,
        }
    )


@router.get("/health/status")
def get_status() -> dict:
    cors_policy = "open" if "*" in settings.cors_origin_list else "restricted"
    return build_response(
        {
            "service": settings.app_name,
            "environment": settings.env,
            "appVersion": settings.app_version,
            "releaseChannel": settings.release_channel,
            "runtimeSeconds": _runtime_seconds(),
            "corsPolicy": cors_policy,
            "apiPrefix": settings.api_prefix,
            "advancedDataMode": settings.advanced_data_mode,
            "providers": {
                "fundamentals": settings.preferred_fundamentals_provider,
                "news": settings.preferred_news_provider,
                "research": settings.preferred_research_provider,
                "premiumFundamentals": settings.premium_fundamentals_provider,
                "premiumNews": settings.premium_news_provider,
            },
            "timeouts": {
                "externalRequestSeconds": settings.external_request_timeout_seconds,
                "slowRequestMs": settings.slow_request_threshold_ms,
            },
            "cacheTtl": {
                "market": settings.market_cache_ttl_seconds,
                "stock": settings.stock_cache_ttl_seconds,
                "screener": settings.screener_cache_ttl_seconds,
                "calendar": settings.calendar_cache_ttl_seconds,
                "search": settings.search_cache_ttl_seconds,
                "document": settings.document_cache_ttl_seconds,
            },
        }
    )
