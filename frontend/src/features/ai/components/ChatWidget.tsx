"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react";
import { aiApi, type AIRecommendItem } from "@/features/ai/api";
import { imageUrl } from "@/features/san-pham/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const SESSION_KEY = "mypham.ai.chatSession";

type Msg = {
  role: "USER" | "ASSISTANT";
  content: string;
  context?: AIRecommendItem[];
  ts: number;
};

const WELCOME: Msg = {
  role: "ASSISTANT",
  content:
    "Chào bạn! Mình là trợ lý của Ngọc Lan Beauty. Bạn đang tìm sản phẩm cho loại da nào, hay quan tâm vấn đề gì (mụn, khô, dầu, lão hoá…)? Mình sẽ gợi ý ngay nhé.",
  ts: Date.now(),
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessionId từ localStorage 1 lần khi mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      const id = Number.parseInt(raw, 10);
      if (Number.isFinite(id)) setSessionId(id);
    }
  }, []);

  // Auto-scroll xuống cuối khi có message mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "USER", content: msg, ts: Date.now() },
    ]);
    setLoading(true);
    try {
      const res = await aiApi.chat(msg, sessionId);
      if (res.sessionId && res.sessionId !== sessionId) {
        setSessionId(res.sessionId);
        window.localStorage.setItem(SESSION_KEY, String(res.sessionId));
      }
      // Chỉ render sp mà LLM thực sự đề cập (sanPhamIds), không phải tất cả top-5 retrieve.
      // Giúp khi user nói "gợi 1 sp" → chỉ thấy 1 card thay vì 5.
      const mentionedIds = new Set(res.sanPhamIds ?? []);
      const filtered = (res.products ?? []).filter((p) =>
        mentionedIds.has(p.sanPhamId),
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "ASSISTANT",
          content: res.reply,
          context: filtered.length > 0 ? filtered : (res.products ?? []),
          ts: Date.now(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ASSISTANT",
          content:
            "Xin lỗi, hệ thống AI hiện đang bận. Bạn thử lại sau ít phút giúp mình nhé.",
          ts: Date.now(),
        },
      ]);
      console.error("[ChatWidget]", err);
    } finally {
      setLoading(false);
    }
  }

  function onProductClick(item: AIRecommendItem) {
    aiApi.trackClick(item.sanPhamId, "CHAT").catch(() => {});
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        aria-label="Mở chat AI"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105",
          "bg-[color:var(--color-primary)]",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-black/5 bg-[color:var(--color-pastel-cream)] px-4 py-3">
            <Sparkles className="size-5 text-[color:var(--color-primary)]" />
            <div className="flex-1">
              <p className="font-serif text-base">Trợ lý Ngọc Lan</p>
              <p className="text-[11px] text-[color:var(--color-muted)]">
                Gợi ý cá nhân hoá theo loại da
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
          >
            {messages.map((m, i) => (
              <div key={i} className="space-y-2">
                <div
                  className={cn(
                    "flex",
                    m.role === "USER" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "USER"
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-black/5 text-[color:var(--color-ink)]",
                    )}
                  >
                    {m.content}
                  </div>
                </div>

                {m.context && m.context.length > 0 && (
                  <div className="space-y-2 pl-1">
                    {m.context.map((item) => (
                      <Link
                        key={item.sanPhamId}
                        href={`/san-pham/${item.sanPhamId}`}
                        onClick={() => onProductClick(item)}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white p-2 text-left transition hover:border-[color:var(--color-primary)]"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[color:var(--color-pastel-cream)]">
                          {item.hinhAnh ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={imageUrl(item.hinhAnh) ?? ""}
                              alt={item.tenSanPham}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[color:var(--color-ink)]">
                            {item.tenSanPham}
                          </p>
                          <p className="text-[11px] text-[color:var(--color-muted)]">
                            {formatCurrency(item.gia)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-black/5 px-3.5 py-2 text-sm text-[color:var(--color-muted)]">
                  <Loader2 className="size-4 animate-spin" />
                  Đang suy nghĩ...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-black/5 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Da bạn đang gặp vấn đề gì?"
                rows={1}
                disabled={loading}
                className="max-h-32 flex-1 resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Gửi"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white transition hover:bg-black disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
