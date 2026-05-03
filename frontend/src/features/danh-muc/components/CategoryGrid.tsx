"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Category } from "@/features/danh-muc/api";
import { CategoryCard } from "@/features/danh-muc/components/CategoryCard";

const INITIAL_VISIBLE = 6;

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = categories.length > INITIAL_VISIBLE;
  const visible = expanded ? categories : categories.slice(0, INITIAL_VISIBLE);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {visible.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            productCount={c.productCount}
          />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white px-5 py-2 text-sm transition hover:border-[color:var(--color-ink)]"
          >
            {expanded ? (
              <>
                Thu gọn <ChevronUp className="size-4" />
              </>
            ) : (
              <>
                Xem thêm ({categories.length - INITIAL_VISIBLE} danh mục){" "}
                <ChevronDown className="size-4" />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
