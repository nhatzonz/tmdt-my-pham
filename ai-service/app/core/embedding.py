"""
Helper compose text từ sản phẩm → embed.
Quan trọng: text format phải nhất quán giữa ingest và (sau này) re-ingest
để embedding ổn định.
"""
from __future__ import annotations


def compose_product_text(
    ten_san_pham: str,
    mo_ta: str | None = None,
    loai_da: str | None = None,
    thuong_hieu: str | None = None,
    danh_muc: str | None = None,
) -> str:
    """
    Gộp các trường text quan trọng nhất của 1 sản phẩm thành 1 đoạn để embed.
    Format dùng tiếng Việt vì Gemini text-embedding-004 hỗ trợ đa ngôn ngữ.
    """
    parts: list[str] = [f"Sản phẩm: {ten_san_pham}."]
    if thuong_hieu:
        parts.append(f"Thương hiệu: {thuong_hieu}.")
    if danh_muc:
        parts.append(f"Danh mục: {danh_muc}.")
    if loai_da:
        parts.append(f"Phù hợp loại da: {loai_da}.")
    if mo_ta:
        parts.append(f"Mô tả: {mo_ta}")
    return " ".join(parts)


def vector_to_pg_literal(vec: list[float]) -> str:
    """Format vector sang string literal cho pgvector: '[1.0, 2.0, 3.0]'."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"
