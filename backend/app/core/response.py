from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.core.config import get_settings


settings = get_settings()

def build_response(
    data: Any,
    *,
    source: str = "fastapi",
    fallback: bool = False,
    warnings: list[str] | None = None,
    request_id: str | None = None,
) -> dict[str, Any]:
    meta = {
        "source": source,
        "fallback": fallback,
        "warnings": warnings or [],
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "appVersion": settings.app_version,
        "releaseChannel": settings.release_channel,
    }
    if request_id:
        meta["requestId"] = request_id

    return {
        "meta": meta,
        "data": data
    }


def build_error_response(
    *,
    error_code: str,
    message: str,
    request_id: str | None = None,
    details: dict[str, Any] | None = None,
    source: str = "fastapi",
    fallback: bool = False,
    warnings: list[str] | None = None,
) -> dict[str, Any]:
    meta = {
        "meta": {
            "source": source,
            "fallback": fallback,
            "warnings": warnings or [],
            "fetchedAt": datetime.now(timezone.utc).isoformat(),
            "appVersion": settings.app_version,
            "releaseChannel": settings.release_channel,
            "errorCode": error_code,
            "errorMessage": message,
        },
        "data": None
    }
    if request_id:
        meta["meta"]["requestId"] = request_id
    if details:
        meta["meta"]["errorDetails"] = details
    return meta
