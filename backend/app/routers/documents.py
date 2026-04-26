from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.core.response import build_response
from app.services.document_service import summarize_document

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentSummaryRequest(BaseModel):
    text: str = Field(default="")
    source_name: str = Field(default="粘贴文本")
    source_type: str = Field(default="text")


@router.post("/summarize")
def summarize_document_route(payload: DocumentSummaryRequest) -> dict:
    return build_response(
        summarize_document(
            text=payload.text,
            source_name=payload.source_name,
            source_type=payload.source_type
        )
    )
