"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { imageUrl } from "@/features/san-pham/api";
import { cn } from "@/lib/cn";

export function ProductGallery({
  images,
  alt,
  fallbackBg,
}: {
  images: string[];
  alt: string;
  fallbackBg: string;
}) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const main = imageUrl(images[selected]);
  const hasMany = images.length > 1;

  function next() {
    setSelected((s) => (s + 1) % images.length);
  }
  function prev() {
    setSelected((s) => (s - 1 + images.length) % images.length);
  }

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length]);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => main && setLightbox(true)}
        disabled={!main}
        className={cn(
          "group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl",
          fallbackBg,
          main && "cursor-zoom-in",
        )}
      >
        {main ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main}
              alt={alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">
              Phóng to
            </span>
          </>
        ) : (
          <span className="text-xs text-[color:var(--color-muted)]">Chưa có ảnh</span>
        )}
      </button>

      {hasMany && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((url, i) => {
            const u = imageUrl(url);
            return (
              <button
                key={url}
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg ring-2 transition",
                  selected === i
                    ? "ring-[color:var(--color-ink)]"
                    : "ring-transparent hover:ring-[color:var(--color-border)]",
                )}
                aria-label={`Ảnh ${i + 1}`}
              >
                {u && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={u}
                    alt={`${alt} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {lightbox && main && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(false);
            }}
            aria-label="Đóng"
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="size-6" />
          </button>

          {hasMany && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Ảnh trước"
                className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Ảnh sau"
                className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          {hasMany && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
            >
              <span>
                {selected + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
