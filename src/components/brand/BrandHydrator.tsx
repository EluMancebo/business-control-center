"use client";

import { useEffect } from "react";
import { applyBrandToDocument } from "@/lib/brand/apply";
import { loadBrandFromStorage, DEFAULT_BRAND } from "@/lib/brand/storage";

function computeTitle(brandName: string) {
  const name = brandName?.trim();
  return name && name.length > 0 ? name : DEFAULT_BRAND.brandName;
}

export default function BrandHydrator() {
  useEffect(() => {
    const brand = loadBrandFromStorage();

    // 1) Aplica tokens (palette/mode)
    applyBrandToDocument(brand);

    // 2) Refleja brandName en el título (v0)
    document.title = computeTitle(brand.brandName);
  }, []);

  return null;
}
