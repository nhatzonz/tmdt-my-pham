"""
pgvector top-K cosine similarity retriever.
Trả ra sản phẩm + score để LLM ground câu trả lời.
"""
from __future__ import annotations

from typing import Any

from app.core.embedding import vector_to_pg_literal
from app.db import get_pool


async def retrieve_similar(
    query_vector: list[float],
    top_k: int = 5,
    exclude_ids: list[int] | None = None,
) -> list[dict[str, Any]]:
    """
    Trả top-K sản phẩm ACTIVE gần nhất với query vector.
    Mỗi item: {sanPhamId, tenSanPham, gia, loaiDa, thuongHieu, moTa, hinhAnh, score}
    """
    exclude_ids = exclude_ids or []
    vec_lit = vector_to_pg_literal(query_vector)

    sql = """
        SELECT
            sp.id           AS san_pham_id,
            sp.ten_san_pham AS ten_san_pham,
            sp.gia          AS gia,
            sp.loai_da      AS loai_da,
            sp.thuong_hieu  AS thuong_hieu,
            sp.mo_ta        AS mo_ta,
            (SELECT url FROM san_pham_anh
              WHERE san_pham_id = sp.id ORDER BY thu_tu LIMIT 1) AS hinh_anh,
            1 - (pe.embedding <=> $1::vector) AS score
        FROM product_embeddings pe
        JOIN san_pham sp ON sp.id = pe.san_pham_id
        WHERE sp.trang_thai = 'ACTIVE'
          AND ($2::bigint[] IS NULL OR sp.id <> ALL($2::bigint[]))
        ORDER BY pe.embedding <=> $1::vector
        LIMIT $3
    """

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            sql,
            vec_lit,
            exclude_ids if exclude_ids else None,
            top_k,
        )

    return [
        {
            "sanPhamId": r["san_pham_id"],
            "tenSanPham": r["ten_san_pham"],
            "gia": float(r["gia"]) if r["gia"] is not None else None,
            "loaiDa": r["loai_da"],
            "thuongHieu": r["thuong_hieu"],
            "moTa": r["mo_ta"],
            "hinhAnh": r["hinh_anh"],
            "score": round(float(r["score"]), 4),
        }
        for r in rows
    ]
