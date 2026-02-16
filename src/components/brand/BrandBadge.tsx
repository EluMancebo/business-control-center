// src/components/brand/BrandBadge.tsx
"use client";

import type { Brand } from "@/lib/brand/types";
import { DEFAULT_BRAND } from "@/lib/brand/storage";
import { useBrand } from "@/lib/brand/hooks";

function safeBrandName(value: string) {
  const v = value?.trim();
  return v && v.length > 0 ? v : DEFAULT_BRAND.brandName;
}

export default function BrandBadge() {
  const brand: Brand = useBrand();

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-card-foreground shadow-sm"
      suppressHydrationWarning
    >
      <span className="h-2 w-2 rounded-full bg-primary" />
      <span className="font-medium">{safeBrandName(brand.brandName)}</span>
      <span className="text-muted-foreground">
        {brand.palette}/{brand.mode}
      </span>
    </div>
  );
}

