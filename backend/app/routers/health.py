from fastapi import APIRouter

from app.core.response import build_response

router = APIRouter(tags=["health"])


@router.get("/health")
def get_health() -> dict:
    return build_response({"status": "ok"})
