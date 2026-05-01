"""
/ingest endpoints — embed sản phẩm + upsert vào product_embeddings.
- POST /ingest        — 1 sp (gọi từ Spring khi create/update product)
- POST /ingest/full   — chạy lại cho TẤT CẢ sp ACTIVE (admin manual)
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.embedding import compose_product_text, vector_to_pg_literal
from app.core.llm import get_llm
from app.db import get_pool

logger = logging.getLogger(__name__)
router = APIRouter()


class IngestRequest(BaseModel):
    sanPhamId: int
    tenSanPham: str
    moTa: str | None = None
    loaiDa: str | None = None
    thuongHieu: str | None = None
    danhMuc: str | None = None


class IngestDeleteRequest(BaseModel):
    sanPhamId: int


class IngestFullResponse(BaseModel):
    total: int
    embedded: int
    failed: int


async def _upsert_embedding(
    san_pham_id: int,
    text: str,
    vec: list[float],
) -> None:
    sql = """
        INSERT INTO product_embeddings (san_pham_id, embedding, source_text, updated_at)
        VALUES ($1, $2::vector, $3, now())
        ON CONFLICT (san_pham_id) DO UPDATE SET
            embedding   = EXCLUDED.embedding,
            source_text = EXCLUDED.source_text,
            updated_at  = now()
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(sql, san_pham_id, vector_to_pg_literal(vec), text)


@router.post("/ingest")
async def ingest_one(req: IngestRequest) -> dict:
    text = compose_product_text(
        req.tenSanPham, req.moTa, req.loaiDa, req.thuongHieu, req.danhMuc
    )
    try:
        vec = await get_llm().embed(text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embed failed: {e}") from e

    await _upsert_embedding(req.sanPhamId, text, vec)
    return {"sanPhamId": req.sanPhamId, "ok": True, "dim": len(vec)}


@router.post("/ingest/delete")
async def ingest_delete(req: IngestDeleteRequest) -> dict:
    """Xoá embedding khi sp bị xoá / ẩn ở BE chính."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM product_embeddings WHERE san_pham_id = $1",
            req.sanPhamId,
        )
    return {"sanPhamId": req.sanPhamId, "deleted": True}


@router.post("/ingest/full", response_model=IngestFullResponse)
async def ingest_full() -> IngestFullResponse:
    """Re-embed TẤT CẢ sp ACTIVE — gọi 1 lần khi mới setup, hoặc khi đổi model."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT sp.id, sp.ten_san_pham, sp.mo_ta, sp.loai_da,
                   sp.thuong_hieu, dm.ten_danh_muc
            FROM san_pham sp
            LEFT JOIN danh_muc dm ON sp.danh_muc_id = dm.id
            WHERE sp.trang_thai = 'ACTIVE'
            ORDER BY sp.id
            """
        )

    total = len(rows)
    embedded = 0
    failed = 0
    llm = get_llm()

    for r in rows:
        text = compose_product_text(
            r["ten_san_pham"],
            r["mo_ta"],
            r["loai_da"],
            r["thuong_hieu"],
            r["ten_danh_muc"],
        )
        try:
            vec = await llm.embed(text)
            await _upsert_embedding(r["id"], text, vec)
            embedded += 1
            logger.info("Ingested sp #%s (%s)", r["id"], r["ten_san_pham"])
        except Exception as e:
            failed += 1
            logger.error("Ingest sp #%s failed: %s", r["id"], e)

    return IngestFullResponse(total=total, embedded=embedded, failed=failed)
