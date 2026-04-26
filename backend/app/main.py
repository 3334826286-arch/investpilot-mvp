from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import calendar, documents, health, market, screener, search, stocks


settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)
allow_all_origins = "*" in settings.cors_origin_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else settings.cors_origin_list,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(market.router, prefix=settings.api_prefix)
app.include_router(stocks.router, prefix=settings.api_prefix)
app.include_router(screener.router, prefix=settings.api_prefix)
app.include_router(calendar.router, prefix=settings.api_prefix)
app.include_router(documents.router, prefix=settings.api_prefix)
app.include_router(search.router, prefix=settings.api_prefix)
