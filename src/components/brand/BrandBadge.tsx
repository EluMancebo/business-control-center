 "use client";

import { useEffect, useState } from "react";
import type { Brand } from "@/lib/brand/types";
import { DEFAULT_BRAND, loadBrandFromStorage } from "@/lib/brand/storage";

const BRAND_STORAGE_KEY = "bcc:brand";
const BRAND_CHANNEL = "bcc:brand";

function safeBrandName(value: string) {
  const v = value?.trim();
  return v && v.length > 0 ? v : DEFAULT_BRAND.brandName;
}

export default function BrandBadge() {
  // Render estable inicial (SSR + primer render)
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);

  useEffect(() => {
    function refreshFromStorage() {
      setBrand(loadBrandFromStorage());
    }

    // 1) Primera carga cliente
    refreshFromStorage();

    // 2) Cross-tab: localStorage
    function onStorage(e: StorageEvent) {
      if (e.key === BRAND_STORAGE_KEY) refreshFromStorage();
    }
    window.addEventListener("storage", onStorage);

    // 3) Cross-tab: BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(BRAND_CHANNEL);
      bc.onmessage = () => refreshFromStorage();
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-sm text-(--card-foreground) shadow-sm"
      suppressHydrationWarning
    >
      <span className="h-2 w-2 rounded-full bg-(--primary)" />
      <span className="font-medium">{safeBrandName(brand.brandName)}</span>
      <span className="text-(--muted-foreground)">
        {brand.palette}/{brand.mode}
      </span>
    </div>
  );
}
 