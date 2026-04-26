from fastapi import APIRouter, Query

from app.core.response import build_response
from app.services.stock_service import build_screener_snapshot

router = APIRouter(prefix="/screener", tags=["screener"])


@router.get("/snapshot")
def get_screener_snapshot(
    trend: str = Query("all"),
    valuation: str = Query("all"),
    growth: str = Query("all"),
    risk: str = Query("all"),
    limit: int = Query(12, ge=1, le=30),
) -> dict:
    return build_response(
        build_screener_snapshot(
            trend=trend,
            valuation=valuation,
            growth=growth,
            risk=risk,
            limit=limit,
        )
    )
