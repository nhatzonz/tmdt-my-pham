"""
GET /recommend/{userId} — gợi ý cho user dựa trên lịch sử mua.
GET /similar/{productId} — gợi ý sản phẩm tương tự cho trang detail.
Cả 2 dùng cùng pgvector retrieve.
"""
from __future__ import annotations

import logging
from typing import Any

import numpy as np
from fastapi import APIRouter, HTTPException

from app.core.embedding import vector_to_pg_literal
from app.core.retriever import retrieve_similar
from app.db import get_pool

logger = logging.getLogger(__name__)
router = APIRouter()


async def _record_impressions(
    user_id: int | None,
    products: list[dict[str, Any]],
    nguon: str,
) -> None:
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


@router.get("/recommend/{user_id}")
async def recommend_for_user(user_id: int, limit: int = 6) -> dict:
    """
    Gợi ý dựa trên trung bình embedding các sp user đã mua (đơn COMPLETED).
    Nếu user chưa mua → trả top sản phẩm phổ biến (fallback).
    Loại trừ các sp user đã mua.
    """
    if limit < 1:
        limit = 6
    if limit > 20:
        limit = 20

    pool = get_pool()
    async with pool.acquire() as conn:
        # Sản phẩm user đã mua (đơn COMPLETED)
        bought_rows = await conn.fetch(
            """
            SELECT DISTINCT ct.san_pham_id
            FROM chi_tiet_don_hang ct
            JOIN don_hang dh ON ct.don_hang_id = dh.id
            WHERE dh.nguoi_dung_id = $1 AND dh.trang_thai = 'COMPLETED'
            """,
            user_id,
        )
        bought_ids = [r["san_pham_id"] for r in bought_rows]

        if not bought_ids:
            # Fallback: top sản phẩm bán chạy
            top_rows = await conn.fetch(
                """
                SELECT
                    sp.id           AS san_pham_id,
                    sp.ten_san_pham AS ten_san_pham,
                    sp.gia          AS gia,
                    sp.loai_da      AS loai_da,
                    sp.thuong_hieu  AS thuong_hieu,
                    sp.mo_ta        AS mo_ta,
                    (SELECT url FROM san_pham_anh
                      WHERE san_pham_id = sp.id ORDER BY thu_tu LIMIT 1) AS hinh_anh,
                    COALESCE(SUM(ct.so_luong), 0) AS so_luong_ban
                FROM san_pham sp
                JOIN danh_muc dm ON dm.id = sp.danh_muc_id
                LEFT JOIN chi_tiet_don_hang ct ON ct.san_pham_id = sp.id
                LEFT JOIN don_hang dh ON ct.don_hang_id = dh.id AND dh.trang_thai = 'COMPLETED'
                WHERE sp.trang_thai = 'ACTIVE'
                  AND dm.trang_thai = 'ACTIVE'
                GROUP BY sp.id
                ORDER BY so_luong_ban DESC, sp.id DESC
                LIMIT $1
                """,
                limit,
            )
            products = [
                {
                    "sanPhamId": r["san_pham_id"],
                    "tenSanPham": r["ten_san_pham"],
                    "gia": float(r["gia"]) if r["gia"] is not None else None,
                    "loaiDa": r["loai_da"],
                    "thuongHieu": r["thuong_hieu"],
                    "moTa": r["mo_ta"],
                    "hinhAnh": r["hinh_anh"],
                    "score": None,
                }
                for r in top_rows
            ]
            await _record_impressions(user_id, products, "HOMEPAGE")
            return {
                "userId": user_id,
                "strategy": "POPULAR",
                "items": products,
            }

        # Lấy embeddings của các sp đã mua
        emb_rows = await conn.fetch(
            "SELECT embedding FROM product_embeddings WHERE san_pham_id = ANY($1)",
            bought_ids,
        )

    if not emb_rows:
        # Có đơn nhưng sp chưa được ingest — trả empty + log
        logger.warning("User %s có đơn nhưng sp chưa ingest", user_id)
        return {"userId": user_id, "strategy": "EMPTY", "items": []}

    # Trung bình embeddings → đại diện sở thích user
    vecs = np.array(
        [
            [float(x) for x in r["embedding"][1:-1].split(",")]
            if isinstance(r["embedding"], str)
            else r["embedding"]
            for r in emb_rows
        ]
    )
    user_vector = vecs.mean(axis=0).tolist()

    products = await retrieve_similar(user_vector, top_k=limit, exclude_ids=bought_ids)
    await _record_impressions(user_id, products, "HOMEPAGE")

    return {
        "userId": user_id,
        "strategy": "PERSONALIZED",
        "items": products,
    }


@router.get("/similar/{product_id}")
async def similar_products(product_id: int, limit: int = 4) -> dict:
    """Sản phẩm tương tự sp đang xem — dùng embedding của sp đó."""
    if limit < 1:
        limit = 4
    if limit > 10:
        limit = 10

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT embedding FROM product_embeddings WHERE san_pham_id = $1",
            product_id,
        )

    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Sản phẩm #{product_id} chưa được ingest",
        )

    embedding = row["embedding"]
    if isinstance(embedding, str):
        # asyncpg trả vector dưới dạng string '[a,b,c]'
        vec = [float(x) for x in embedding[1:-1].split(",")]
    else:
        vec = list(embedding)

    products = await retrieve_similar(vec, top_k=limit, exclude_ids=[product_id])
    await _record_impressions(None, products, "PRODUCT_DETAIL")

    return {"productId": product_id, "items": products}
