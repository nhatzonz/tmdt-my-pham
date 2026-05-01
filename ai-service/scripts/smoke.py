"""
Smoke test (Sprint 2a): kiểm tra Gemini key + DB pgvector trước khi code feature.
Chạy: python scripts/smoke.py
"""
import asyncio
import sys

import asyncpg
import google.generativeai as genai

sys.path.insert(0, ".")
from app.config import settings  # noqa


async def check_db() -> bool:
    print("→ Check DB + pgvector...")
    try:
        conn = await asyncpg.connect(settings.db_dsn)
        row = await conn.fetchrow("SELECT '[1,2,3]'::vector AS v")
        print(f"  ✓ pgvector OK: {row['v']}")
        await conn.close()
        return True
    except Exception as e:
        print(f"  ✗ DB/pgvector FAILED: {e}")
        return False


async def check_gemini_embed() -> bool:
    print("→ Check Gemini embedding...")
    if not settings.gemini_api_key:
        print("  ✗ GEMINI_API_KEY chưa cấu hình trong .env")
        return False
    try:
        genai.configure(api_key=settings.gemini_api_key)
        res = genai.embed_content(
            model=settings.embed_model,
            content="serum cho da dầu mụn",
            task_type="retrieval_query",
        )
        dim = len(res["embedding"])
        print(f"  ✓ Embed OK: dim={dim}")
        return True
    except Exception as e:
        print(f"  ✗ Embed FAILED: {e}")
        return False


async def check_gemini_chat() -> bool:
    print("→ Check Gemini chat...")
    try:
        model = genai.GenerativeModel(model_name=settings.chat_model)
        res = model.generate_content("Trả lời ngắn 1 câu: bạn là ai?")
        print(f"  ✓ Chat OK: {(res.text or '').strip()[:80]}")
        return True
    except Exception as e:
        print(f"  ✗ Chat FAILED: {e}")
        return False


async def main() -> int:
    db_ok = await check_db()
    embed_ok = await check_gemini_embed()
    chat_ok = await check_gemini_chat() if embed_ok else False
    print()
    if db_ok and embed_ok and chat_ok:
        print("✅ Tất cả pass — sẵn sàng chạy uvicorn + ingest /full")
        return 0
    print("❌ Chưa OK — xem docs/SETUP-AI.md để fix")
    return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
