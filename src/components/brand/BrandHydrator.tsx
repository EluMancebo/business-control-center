"use client";

import { useEffect } from "react";
import { applyBrandToDocument } from "@/lib/brand/apply";
import { loadBrandFromStorage, DEFAULT_BRAND } from "@/lib/brand/storage";

const BRAND_STORAGE_KEY = "bcc:brand";
const BRAND_CHANNEL = "bcc:brand";

function computeTitle(brandName: string) {
  const name = brandName?.trim();
  return name && name.length > 0 ? name : DEFAULT_BRAND.brandName;
}

export default function BrandHydrator() {
  useEffect(() => {
    function applyFromStorage() {
      const next = loadBrandFromStorage();
      applyBrandToDocument(next);
      document.title = computeTitle(next.brandName);
    }

    // Inicial
    applyFromStorage();

    function onStorage(e: StorageEvent) {
      if (e.key === BRAND_STORAGE_KEY) applyFromStorage();
    }
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(BRAND_CHANNEL);
      bc.onmessage = () => applyFromStorage();
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  return null;
}
 