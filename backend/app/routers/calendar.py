from fastapi import APIRouter

from app.core.response import build_response
from app.services.calendar_service import build_calendar_events

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/events")
def get_calendar_events() -> dict:
    return build_response(build_calendar_events())
