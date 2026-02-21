 // src/components/brand/BrandScopeOverride.tsx
"use client";

import { useEffect } from "react";
import type { Brand } from "@/lib/brand/types";
import { getBrand } from "@/lib/brand/service";
import { applyBrandToDocument } from "@/lib/brand/apply";

export default function BrandScopeOverride({
  palette = "bcc",
  mode = "light",
}: {
  palette?: Brand["palette"];
  mode?: Brand["mode"];
}) {
  useEffect(() => {
    
    const previous = getBrand();

    
    applyBrandToDocument({ ...previous, palette, mode });

    return () => {
      
      applyBrandToDocument(previous);
    };
  }, [palette, mode]);

  return null;
}   