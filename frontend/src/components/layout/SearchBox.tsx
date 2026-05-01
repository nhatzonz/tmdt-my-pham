"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Loader2, Search, X } from "lucide-react";
import { imageUrl, productApi, type Product } from "@/features/san-pham/api";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

const RECENT_KEY = "mypham.search.recent";
const RECENT_LIMIT = 6;
const SUGGEST_LIMIT = 8;
const DEBOUNCE_MS = 250;

/**
 * SearchBox — autocomplete như Shopee.
 * - Gõ ≥1 ký tự: debounce 250ms → call /api/products/search
 * - Mũi tên ↑↓ chọn gợi ý, Enter mở chi tiết hoặc trang search
 * - Esc / click ngoài: đóng dropdown
 * - Lưu 6 từ khoá gần nhất ở localStorage để gợi ý khi focus mà chưa gõ
 */
export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Load recent từ localStorage 1 lần
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecent(parsed.slice(0, RECENT_LIMIT));
      }
    } catch {
      /* ignore corrupt */
    }
  }, []);

  // Click ngoài → đóng
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounce search — chỉ gọi API khi query ổn định ≥DEBOUNCE_MS.
  // Cancelled flag phải khai báo Ở NGOÀI setTimeout để cleanup useEffect
  // có thể flip nó trước khi callback fire — tránh request cũ overwrite kết
  // quả mới khi user gõ nhanh.
  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      productApi
        .search(q)
        .then((rs) => {
          if (cancelled) return;
          setResults(rs.slice(0, SUGGEST_LIMIT));
          setActiveIdx(-1);
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  // Items hiển thị: chỉ render results khi user đã gõ
  const items = query.trim().length > 0 ? results : [];

  function persistRecent(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(
      0,
      RECENT_LIMIT,
    );
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* quota exceeded — ignore */
    }
  }

  function clearRecent() {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }

  function submitSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    persistRecent(trimmed);
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/san-pham?q=${encodeURIComponent(trimmed)}`);
  }

  function selectProduct(p: Product) {
    persistRecent(p.tenSanPham);
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/san-pham/${p.id}`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // IME đang compose (gõ tiếng Việt Telex/VNI, gõ tiếng Trung/Nhật/Hàn): Enter / Arrow
    // được IME dùng để chốt candidate. KHÔNG xử lý ở đây nếu không bị double text +
    // navigate khi vừa compose vừa submit.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

    const max = items.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (max > 0) setActiveIdx((i) => (i + 1) % max);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (max > 0) setActiveIdx((i) => (i <= 0 ? max - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        selectProduct(items[activeIdx]);
      } else {
        submitSearch(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showRecent = open && query.trim().length === 0 && recent.length > 0;
  const showResults = open && query.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-muted)]" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Tìm theo tên, mã sản phẩm..."
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined
        }
        className="w-full rounded-full border border-[color:var(--color-border)] bg-white/60 py-2 pl-10 pr-10 text-sm placeholder:text-[color:var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ink-soft)]/20"
      />
      {query && (
        <button
          type="button"
          aria-label="Xoá"
          onClick={() => {
            setQuery("");
            setResults([]);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
        >
          <X className="size-4" />
        </button>
      )}

      {(showRecent || showResults) && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[28rem] overflow-y-auto rounded-2xl border border-black/5 bg-white shadow-xl"
        >
          {/* Recent searches — khi chưa gõ */}
          {showRecent && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                <span>Tìm kiếm gần đây</span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-[10px] uppercase hover:text-[color:var(--color-ink)]"
                >
                  Xoá
                </button>
              </div>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setQuery(r);
                    submitSearch(r);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5"
                >
                  <Search className="size-3.5 text-[color:var(--color-muted)]" />
                  <span>{r}</span>
                </button>
              ))}
            </div>
          )}

          {/* Đang gõ — loading state */}
          {showResults && loading && results.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-[color:var(--color-muted)]">
              <Loader2 className="size-4 animate-spin" />
              Đang tìm...
            </div>
          )}

          {/* Đang gõ — không có kết quả */}
          {showResults && !loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[color:var(--color-muted)]">
              Không tìm thấy sản phẩm cho{" "}
              <span className="text-[color:var(--color-ink)]">
                &ldquo;{query}&rdquo;
              </span>
            </div>
          )}

          {/* Đang gõ — có kết quả */}
          {showResults && results.length > 0 && (
            <div className="p-1">
              {results.map((p, idx) => (
                <button
                  key={p.id}
                  id={`${listboxId}-opt-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIdx}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => selectProduct(p)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
                    idx === activeIdx
                      ? "bg-[color:var(--color-pastel-cream)]"
                      : "hover:bg-black/5",
                  )}
                >
                  <div className="size-12 flex-shrink-0 overflow-hidden rounded-lg bg-[color:var(--color-pastel-cream)]">
                    {p.hinhAnh?.[0] && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl(p.hinhAnh[0]) ?? ""}
                        alt={p.tenSanPham}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[color:var(--color-ink)]">
                      {highlight(p.tenSanPham, query)}
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-[color:var(--color-muted)]">
                      <span className="font-mono">
                        {highlight(displayCode(p), query)}
                      </span>
                      {p.thuongHieu && <span>· {p.thuongHieu}</span>}
                    </p>
                  </div>
                  <span className="text-sm text-[color:var(--color-ink)]">
                    {formatCurrency(p.gia)}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => submitSearch(query)}
                className="mt-1 flex w-full items-center justify-center gap-1.5 border-t border-black/5 px-3 py-2.5 text-xs text-[color:var(--color-ink-soft)] hover:bg-black/5"
              >
                <Search className="size-3.5" />
                Xem tất cả kết quả cho{" "}
                <span className="font-medium text-[color:var(--color-ink)]">
                  &ldquo;{query}&rdquo;
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Mã hiển thị: ưu tiên maSanPham thật, fallback "NL-00x" theo id (khớp logic
 *  trang chi tiết sp). BE search cũng accept fake code này. */
function displayCode(p: Product): string {
  return p.maSanPham ?? `NL-${String(p.id).padStart(3, "0")}`;
}

/** Bôi đậm phần text khớp query — không xử lý dấu tiếng Việt nâng cao,
 *  chỉ match plain substring case-insensitive. */
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-[color:var(--color-ink)]">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
