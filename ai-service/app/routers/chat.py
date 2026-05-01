"""
/chat — RAG pipeline.
1. Embed user message
2. Retrieve top-K sản phẩm gần nhất từ pgvector
3. Compose system prompt với product context
4. Gọi Gemini → trả reply
5. Lưu chat_messages + ghi goi_y_ai impression
"""
from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.llm import GeminiClient, get_llm
from app.core.retriever import retrieve_similar
from app.db import get_pool

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    sessionId: int | None = None  # nếu không có → tạo mới
    userId: int | None = None     # NULL = guest


class ChatResponse(BaseModel):
    sessionId: int
    reply: str
    sanPhamIds: list[int]
    products: list[dict[str, Any]]


SYSTEM_PROMPT = """
Bạn là trợ lý mua sắm mỹ phẩm thân thiện của cửa hàng.
Nhiệm vụ: trả lời câu hỏi của khách dựa TRÊN DANH SÁCH SẢN PHẨM được cung cấp dưới đây.

QUY TẮC NGHIÊM NGẶT:
1. CHỈ giới thiệu các sản phẩm có trong danh sách context — TUYỆT ĐỐI không bịa sản phẩm khác.
2. Mỗi lần đề cập sản phẩm phải dẫn đúng tên + mã id giống context.
3. Trả lời ngắn gọn 2-4 câu, giọng văn thân thiện, dùng tiếng Việt.
4. Nếu danh sách rỗng hoặc câu hỏi không liên quan mỹ phẩm → lịch sự nói "Xin lỗi, tôi chưa
   tìm thấy sản phẩm phù hợp" và đề nghị khách mô tả rõ hơn.
5. KHÔNG đưa link, KHÔNG markdown phức tạp — frontend sẽ tự render product card.
6. KHÔNG dùng emoji.
"""


def _format_products_for_prompt(products: list[dict[str, Any]]) -> str:
    if not products:
        return "(không có sản phẩm phù hợp)"
    lines = []
    for p in products:
        gia = f"{p['gia']:,.0f}đ" if p.get("gia") is not None else "—"
        lines.append(
            f"- ID {p['sanPhamId']} | {p['tenSanPham']} | "
            f"Loại da: {p.get('loaiDa') or 'không rõ'} | "
            f"Thương hiệu: {p.get('thuongHieu') or 'không rõ'} | "
            f"Giá: {gia} | "
            f"Mô tả: {(p.get('moTa') or '')[:200]}"
        )
    return "\n".join(lines)


async def _ensure_session(session_id: int | None, user_id: int | None) -> int:
    pool = get_pool()
    if session_id is not None:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id FROM chat_sessions WHERE id = $1", session_id
            )
            if row:
                return row["id"]
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO chat_sessions (nguoi_dung_id) VALUES ($1) RETURNING id",
            user_id,
        )
        return row["id"]


async def _save_messages(
    session_id: int,
    user_msg: str,
    assistant_reply: str,
    san_pham_ids: list[int],
) -> None:
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO chat_messages (session_id, role, noi_dung)
                VALUES ($1, 'USER', $2)
                """,
                session_id, user_msg,
            )
            await conn.execute(
                """
                INSERT INTO chat_messages (session_id, role, noi_dung, san_pham_ids)
                VALUES ($1, 'ASSISTANT', $2, $3)
                """,
                session_id, assistant_reply, san_pham_ids,
            )
            await conn.execute(
                "UPDATE chat_sessions SET updated_at = now() WHERE id = $1",
                session_id,
            )


async def _record_impressions(
    user_id: int | None,
    products: list[dict[str, Any]],
    nguon: str = "CHAT",
) -> None:
    """Ghi 1 row goi_y_ai cho mỗi sp được trả về để tính CTR."""
    if not products:
        return
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.executemany(
            """
            INSERT INTO goi_y_ai (nguoi_dung_id, san_pham_id, diem_tuong_thich, nguon)
            VALUES ($1, $2, $3, $4)
            """,
            [(user_id, p["sanPhamId"], p["score"], nguon) for p in products],
        )


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="message không được rỗng")
    if len(msg) > 1000:
        raise HTTPException(status_code=400, detail="message quá dài (>1000 ký tự)")

    llm = get_llm()
    # Embed query
    try:
        if isinstance(llm, GeminiClient):
            query_vec = await llm.embed_query(msg)
        else:
            query_vec = await llm.embed(msg)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embed failed: {e}") from e

    # Retrieve top-5
    products = await retrieve_similar(query_vec, top_k=5)

    # Compose prompt
    user_block = (
        f"Câu hỏi của khách: {msg}\n\n"
        f"Danh sách sản phẩm hiện có (CHỈ giới thiệu trong danh sách này):\n"
        f"{_format_products_for_prompt(products)}\n\n"
        f"Hãy trả lời khách bằng 2-4 câu tiếng Việt."
    )

    try:
        reply = await llm.chat(SYSTEM_PROMPT, user_block)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM failed: {e}") from e

    reply = (reply or "").strip()
    if not reply:
        reply = "Xin lỗi, tôi chưa tìm thấy sản phẩm phù hợp. Bạn có thể mô tả rõ hơn không?"

    # Validate sản phẩm trong reply phải thuộc context (chống hallucinate)
    valid_ids = {p["sanPhamId"] for p in products}
    san_pham_ids = [p["sanPhamId"] for p in products if p["sanPhamId"] in valid_ids]

    # Save messages + impressions (best-effort, không block response)
    session_id = await _ensure_session(req.sessionId, req.userId)
    try:
        await _save_messages(session_id, msg, reply, san_pham_ids)
        await _record_impressions(req.userId, products, nguon="CHAT")
    except Exception as e:
        logger.warning("Save chat side-effects failed: %s", e)

    return ChatResponse(
        sessionId=session_id,
        reply=reply,
        sanPhamIds=san_pham_ids,
        products=products,
    )
