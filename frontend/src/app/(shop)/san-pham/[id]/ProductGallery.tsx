"use client";

import { useState } from "react";
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
  const main = imageUrl(images[selected]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl",
          fallbackBg,
        )}
      >
        {main ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={main} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="text-xs text-[color:var(--color-muted)]">Chưa có ảnh</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
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
                  <img src={u} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
