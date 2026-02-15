 "use client";

import { useEffect } from "react";
import type { Brand } from "@/lib/brand/types";
import { applyBrandToDocument } from "@/lib/brand/apply";
import { loadBrandFromStorage, DEFAULT_BRAND } from "@/lib/brand/storage";

function computeTitle(brandName: string) {
  const name = brandName?.trim();
  return name && name.length > 0 ? name : DEFAULT_BRAND.brandName;
}

export default function BrandHydrator() {
  useEffect(() => {
    const initial = loadBrandFromStorage();
    applyBrandToDocument(initial);
    document.title = computeTitle(initial.brandName);

    function onBrand(e: Event) {
      const ce = e as CustomEvent<Brand>;
      if (!ce.detail) return;
      applyBrandToDocument(ce.detail);
      document.title = computeTitle(ce.detail.brandName);
    }

    window.addEventListener("bcc:brand", onBrand);
    return () => window.removeEventListener("bcc:brand", onBrand);
  }, []);

  return null;
}
   