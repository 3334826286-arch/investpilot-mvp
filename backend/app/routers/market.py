from fastapi import APIRouter

from app.core.response import build_response
from app.services.market_service import build_market_overview

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/overview")
def get_market_overview() -> dict:
    return build_response(build_market_overview())
