from __future__ import annotations

import logging
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.errors import AppError, ErrorCodes
from app.core.logging import get_logger, log_event, setup_logging
from app.core.response import build_error_response
from app.routers import calendar, documents, health, market, screener, search, stocks


settings = get_settings()
setup_logging(settings.log_level)
logger = get_logger("investpilot.api")
app = FastAPI(title=settings.app_name, version=settings.app_version)
allow_all_origins = "*" in settings.cors_origin_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else settings.cors_origin_list,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = uuid4().hex[:12]
    request.state.request_id = request_id
    started_at = perf_counter()

    try:
        response = await call_next(request)
    except Exception as exc:
        duration_ms = round((perf_counter() - started_at) * 1000, 2)
        log_event(
            logger,
            logging.ERROR,
            "request_failed_uncaught",
            requestId=request_id,
            method=request.method,
            path=request.url.path,
            durationMs=duration_ms,
            errorType=type(exc).__name__,
            errorMessage=str(exc),
        )
        raise

    duration_ms = round((perf_counter() - started_at) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-App-Version"] = settings.app_version
    response.headers["X-Release-Channel"] = settings.release_channel
    log_event(
        logger,
        logging.INFO,
        "request_completed",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=response.status_code,
        durationMs=duration_ms,
    )
    return response


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    request_id = getattr(request.state, "request_id", None)
    log_event(
        logger,
        logging.WARNING,
        "app_error",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=exc.status_code,
        errorCode=exc.error_code,
        errorMessage=exc.message,
        details=exc.details,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_response(
            error_code=exc.error_code,
            message=exc.message,
            request_id=request_id,
            details=exc.details,
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", None)
    details = {"errors": exc.errors()}
    log_event(
        logger,
        logging.WARNING,
        "validation_error",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=422,
        errorCode=ErrorCodes.INVALID_REQUEST,
        details=details,
    )
    return JSONResponse(
        status_code=422,
        content=build_error_response(
            error_code=ErrorCodes.INVALID_REQUEST,
            message="请求参数校验未通过。",
            request_id=request_id,
            details=details,
        ),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    request_id = getattr(request.state, "request_id", None)
    message = exc.detail if isinstance(exc.detail, str) else "请求处理失败。"
    details = exc.detail if isinstance(exc.detail, dict) else None
    error_code = ErrorCodes.NOT_FOUND if exc.status_code == 404 else ErrorCodes.INVALID_REQUEST
    log_event(
        logger,
        logging.WARNING,
        "http_exception",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=exc.status_code,
        errorCode=error_code,
        errorMessage=message,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_response(
            error_code=error_code,
            message=message,
            request_id=request_id,
            details=details,
        ),
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    request_id = getattr(request.state, "request_id", None)
    message = str(exc) or "请求内容不合法。"
    log_event(
        logger,
        logging.WARNING,
        "value_error",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=422,
        errorCode=ErrorCodes.INVALID_REQUEST,
        errorMessage=message,
    )
    return JSONResponse(
        status_code=422,
        content=build_error_response(
            error_code=ErrorCodes.INVALID_REQUEST,
            message=message,
            request_id=request_id,
        ),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    log_event(
        logger,
        logging.ERROR,
        "internal_error",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=500,
        errorCode=ErrorCodes.INTERNAL_ERROR,
        errorType=type(exc).__name__,
        errorMessage=str(exc),
    )
    return JSONResponse(
        status_code=500,
        content=build_error_response(
            error_code=ErrorCodes.INTERNAL_ERROR,
            message="服务暂时不可用，请稍后重试。",
            request_id=request_id,
        ),
    )

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(market.router, prefix=settings.api_prefix)
app.include_router(stocks.router, prefix=settings.api_prefix)
app.include_router(screener.router, prefix=settings.api_prefix)
app.include_router(calendar.router, prefix=settings.api_prefix)
app.include_router(documents.router, prefix=settings.api_prefix)
app.include_router(search.router, prefix=settings.api_prefix)
