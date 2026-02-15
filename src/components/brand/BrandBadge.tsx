"use client";

import { useState } from "react";
import type { Brand } from "@/lib/brand/types";
import { DEFAULT_BRAND, loadBrandFromStorage } from "@/lib/brand/storage";

function safeBrandName(value: string) {
  const v = value?.trim();
  return v && v.length > 0 ? v : DEFAULT_BRAND.brandName;
}

export default function BrandBadge() {
  const [brand] = useState<Brand>(() => loadBrandFromStorage());

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-sm text-(--card-foreground) shadow-sm">
      <span className="h-2 w-2 rounded-full bg-(--primary)" />
      <span className="font-medium">{safeBrandName(brand.brandName)}</span>
      <span className="text-(--muted-foreground)">
        {brand.palette}/{brand.mode}
      </span>
    </div>
  );
}
