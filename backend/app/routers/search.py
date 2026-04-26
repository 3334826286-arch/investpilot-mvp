from fastapi import APIRouter, Query

from app.core.response import build_response
from app.services.search_service import build_search_intel

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/intel")
def get_search_intel(
    query: str = Query("", alias="q"),
    limit: int = Query(6, ge=3, le=12),
) -> dict:
    return build_response(build_search_intel(query=query, limit=limit))
