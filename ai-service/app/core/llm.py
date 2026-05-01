"""
Abstraction LLM — hiện dùng Gemini.
Có thể swap sang Anthropic / OpenAI bằng cách viết class mới implement
cùng interface.
"""
from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)


class LLMClient(ABC):
    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Embed 1 đoạn text → vector."""

    @abstractmethod
    async def chat(self, system_prompt: str, user_message: str) -> str:
        """Single-turn chat completion."""


class GeminiClient(LLMClient):
    def __init__(self) -> None:
        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY chưa được cấu hình — xem docs/SETUP-AI.md"
            )
        genai.configure(api_key=settings.gemini_api_key)

    async def embed(self, text: str) -> list[float]:
        # genai SDK đồng bộ → chạy trên thread pool
        # gemini-embedding-001 mặc định 3072 dim, truncate về 768 cho khớp
        # schema vector(768) (HNSW pgvector chỉ chịu được ≤2000 dim).
        def _call() -> list[float]:
            res = genai.embed_content(
                model=settings.embed_model,
                content=text,
                task_type="retrieval_document",
                output_dimensionality=768,
            )
            return res["embedding"]

        try:
            return await asyncio.to_thread(_call)
        except Exception as e:
            logger.exception("Gemini embed failed: %s", e)
            raise

    async def embed_query(self, text: str) -> list[float]:
        """Khi embed CÂU HỎI người dùng (khác task_type với document)."""
        def _call() -> list[float]:
            res = genai.embed_content(
                model=settings.embed_model,
                content=text,
                task_type="retrieval_query",
                output_dimensionality=768,
            )
            return res["embedding"]

        try:
            return await asyncio.to_thread(_call)
        except Exception as e:
            logger.exception("Gemini embed query failed: %s", e)
            raise

    async def chat(self, system_prompt: str, user_message: str) -> str:
        def _call() -> str:
            model = genai.GenerativeModel(
                model_name=settings.chat_model,
                system_instruction=system_prompt,
            )
            response = model.generate_content(user_message)
            return response.text or ""

        try:
            return await asyncio.to_thread(_call)
        except Exception as e:
            logger.exception("Gemini chat failed: %s", e)
            raise


# Singleton
_client: LLMClient | None = None


def get_llm() -> LLMClient:
    global _client
    if _client is None:
        _client = GeminiClient()
    return _client
