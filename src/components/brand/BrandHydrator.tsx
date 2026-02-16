// src/components/brand/BrandHydrator.tsx
"use client";

import { useEffect } from "react";
import {
  BRAND_CHANNEL,
  getBrand,
  subscribeBrand,
  syncBrandFromStorage,
} from "@/lib/brand/service";
import { applyBrandToDocument } from "@/lib/brand/apply";

export default function BrandHydrator() {
  useEffect(() => {
    // 1) Al montar: leer storage + aplicar (asegura refresh correcto)
    syncBrandFromStorage();

    // 2) Por si acaso: aplica el estado actual
    applyBrandToDocument(getBrand());

    // 3) Re-aplicar ante cambios internos del store
    const unsubscribe = subscribeBrand(() => {
      applyBrandToDocument(getBrand());
    });

    // 4) Re-aplicar ante evento local (misma pestaña)
    const onLocal = () => syncBrandFromStorage();
    window.addEventListener(BRAND_CHANNEL, onLocal);

    // 5) Re-aplicar ante cambios cross-tab via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(BRAND_CHANNEL);
      bc.onmessage = () => syncBrandFromStorage();
    }

    // 6) Re-aplicar ante evento storage (solo otras pestañas, pero lo dejamos)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bcc:brand") syncBrandFromStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener(BRAND_CHANNEL, onLocal);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  return null;
}



 