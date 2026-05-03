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
    warnings: list[str] | None = None
) -> dict[str, Any]:
    return {
        "meta": {
            "source": source,
            "fallback": fallback,
            "warnings": warnings or [],
            "fetchedAt": datetime.now(timezone.utc).isoformat(),
            "appVersion": settings.app_version,
            "releaseChannel": settings.release_channel,
        },
        "data": data
    }
