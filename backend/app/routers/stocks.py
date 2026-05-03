from fastapi import APIRouter, Query

from app.core.errors import AppError, ErrorCodes
from app.core.response import build_response
from app.services.stock_service import build_stock_analysis, build_stock_universe

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("/universe")
def get_stock_universe(query: str = Query("", alias="q"), limit: int = Query(20, ge=1, le=50)) -> dict:
    return build_response(build_stock_universe(query=query, limit=limit))


@router.get("/{symbol}/analysis")
def get_stock_analysis(symbol: str, position: float = Query(0.45, ge=0.1, le=1.0)) -> dict:
    payload = build_stock_analysis(symbol=symbol, position=position)
    if payload is None:
        raise AppError(
            status_code=404,
            error_code=ErrorCodes.NOT_FOUND,
            message="未找到对应股票，请检查代码或简称后重试。",
            details={"symbol": symbol},
        )
    return build_response(payload)
