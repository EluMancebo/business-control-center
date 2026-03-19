// src/components/brand/BrandHydrator.tsx
"use client";

import { useEffect } from "react";
import { applyBrandToDocument } from "@/lib/brand/apply";
import {
  getBrand,
  shouldApplyBrandToDocument,
  subscribeBrand,
  syncBrandFromStorage,
} from "@/lib/brand/service";
import {
  getBrandChannel,
  getBrandStorageKey,
  getDefaultBrandForScope,
  type BrandScope,
} from "@/lib/brand/storage";

function readActiveBusinessSlug(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = window.localStorage.getItem("bcc:activeBusinessSlug");
  return v && v.trim() ? v.trim() : undefined;
}

export default function BrandHydrator({
  scope = "panel",
  businessSlug,
  applyToDocument = true,
}: {
  scope?: BrandScope;
  businessSlug?: string;
  applyToDocument?: boolean;
}) {
  useEffect(() => {
    const scopeUsesBusinessSlug = scope === "panel" || scope === "web";
    const resolvedSlug =
      scopeUsesBusinessSlug ? businessSlug ?? readActiveBusinessSlug() : undefined;
    const skipWebWithoutSlug = scope === "web" && !resolvedSlug;
    if (skipWebWithoutSlug) return;

    const storageKey = getBrandStorageKey(scope, resolvedSlug);
    const channel = getBrandChannel(scope, resolvedSlug);
    const fallback = getDefaultBrandForScope(scope);

    const applyCurrentBrand = () => {
      if (!shouldApplyBrandToDocument(storageKey, channel, fallback)) return;
      applyBrandToDocument(getBrand(storageKey, channel, fallback));
    };

    // 1) Rehidratación inicial
    syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });

    // 2) Aplicar estado actual
    applyCurrentBrand();

    // 3) Suscripción a cambios del store
    const unsubscribe = subscribeBrand(
      applyCurrentBrand,
      storageKey,
      channel,
      fallback
    );

    // 4) Evento local
    const onLocal = () =>
      syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });
    window.addEventListener(channel, onLocal);

    // 5) Cross-tab
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(channel);
      bc.onmessage = () =>
        syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });
    }

    // 6) Storage (otras pestañas)
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener(channel, onLocal);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, [scope, businessSlug, applyToDocument]);

  return null;
}



 
