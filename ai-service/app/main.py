"""FastAPI entry point."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import close_pool, init_pool
from app.routers import chat, ingest, recommend

logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(
    title="My Phạm AI Service",
    description="RAG chatbot + recommendations cho hệ thống TMĐT mỹ phẩm",
    version="1.0.0",
    lifespan=lifespan,
)

# Spring Boot là client duy nhất → chỉ cho localhost:8080.
# Không expose service này trực tiếp ra Internet trong production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "ai-service", "version": "1.0.0"}


app.include_router(ingest.router, tags=["ingest"])
app.include_router(chat.router, tags=["chat"])
app.include_router(recommend.router, tags=["recommend"])


# DEBUG: log raw body cho mọi POST tới /chat — xoá sau khi fix
@app.middleware("http")
async def debug_chat_body(request, call_next):
    if request.url.path == "/chat" and request.method == "POST":
        body = await request.body()
        ct = request.headers.get("content-type", "")
        cl = request.headers.get("content-length", "")
        logging.getLogger("DEBUG").warning(
            "RAW /chat: ct=%r cl=%r len=%d body=%r",
            ct, cl, len(body), body[:300]
        )

        async def receive():
            return {"type": "http.request", "body": body, "more_body": False}
        request._receive = receive
    return await call_next(request)
