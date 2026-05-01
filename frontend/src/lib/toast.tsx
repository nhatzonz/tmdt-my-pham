"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  variant?: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
};

type ToastEntry = ToastInput & { id: number; createdAt: number };

type Ctx = {
  push: (t: ToastInput) => number;
  dismiss: (id: number) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

let nextId = 0;
const DEFAULT_DURATION = 3500;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (t: ToastInput) => {
      const id = ++nextId;
      const entry: ToastEntry = {
        variant: t.variant ?? "info",
        title: t.title,
        description: t.description,
        duration: t.duration ?? DEFAULT_DURATION,
        id,
        createdAt: Date.now(),
      };
      setToasts((cur) => [...cur.slice(-(MAX_VISIBLE - 1)), entry]);
      if (entry.duration && entry.duration > 0) {
        const tm = setTimeout(() => dismiss(id), entry.duration);
        timers.current.set(id, tm);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((tm) => clearTimeout(tm));
      map.clear();
    };
  }, []);

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast phải được dùng bên trong <ToastProvider>");
  }
  return {
    success: (title: string, description?: string) =>
      ctx.push({ variant: "success", title, description }),
    error: (title: string, description?: string) =>
      ctx.push({ variant: "error", title, description }),
    info: (title: string, description?: string) =>
      ctx.push({ variant: "info", title, description }),
    show: ctx.push,
    dismiss: ctx.dismiss,
  };
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastEntry;
  onClose: () => void;
}) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const styles = {
    success: {
      bg: "bg-[color:var(--color-pastel-mint)]/95",
      ring: "ring-emerald-200",
      iconBg: "bg-emerald-500/10 text-emerald-700",
      Icon: Check,
    },
    error: {
      bg: "bg-rose-50",
      ring: "ring-rose-200",
      iconBg: "bg-rose-500/10 text-rose-700",
      Icon: AlertTriangle,
    },
    info: {
      bg: "bg-[color:var(--color-pastel-cream)]/95",
      ring: "ring-[color:var(--color-border)]",
      iconBg: "bg-[color:var(--color-ink)]/10 text-[color:var(--color-ink)]",
      Icon: Info,
    },
  } as const;
  const v = styles[toast.variant ?? "info"];
  const Icon = v.Icon;

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 overflow-hidden rounded-2xl p-4 shadow-lg ring-1 backdrop-blur",
        "transition-all duration-300 ease-out",
        entered
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-2 opacity-0 scale-95",
        v.bg,
        v.ring,
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          v.iconBg,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[color:var(--color-ink)]">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="cursor-pointer text-[color:var(--color-muted)] transition hover:text-[color:var(--color-ink)]"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
