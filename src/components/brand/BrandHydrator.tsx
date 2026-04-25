// src/components/brand/BrandHydrator.tsx
"use client";

import { useEffect } from "react";
import {
  applyBrandToDocument,
  registerBrandScope,
  unregisterBrandScope,
} from "@/lib/brand/apply";
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
import { loadBrandThemeStateV1 } from "@/lib/brand-theme/state/storage.v1";
import { applyBrandThemeRuntimeFromPipelineResult } from "@/lib/brand-theme/runtime/apply";
import { isBrandThemeSemanticRuntimeEnabled } from "@/lib/brand-theme/runtime/flag";
import { resolveBrandHydratorThemeResolution } from "@/lib/brand-theme/runtime/hydrator";

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
    const semanticRuntimeEnabled = isBrandThemeSemanticRuntimeEnabled(scope);
    let resetSemanticRuntime: (() => void) | null = null;

    registerBrandScope(scope);

    const applyCurrentBrand = () => {
      if (!shouldApplyBrandToDocument(storageKey, channel, fallback)) return;
      const stateV1 = loadBrandThemeStateV1(scope, resolvedSlug);
      const resolution = resolveBrandHydratorThemeResolution({
        scope,
        businessSlug: resolvedSlug,
        semanticRuntimeEnabled,
        stateV1,
      });

      if (resolution.kind === "semantic") {
        if (resetSemanticRuntime) {
          resetSemanticRuntime();
        }
        resetSemanticRuntime = applyBrandThemeRuntimeFromPipelineResult({
          result: resolution.pipeline,
        });
        return;
      }

      if (resetSemanticRuntime) {
        resetSemanticRuntime();
        resetSemanticRuntime = null;
      }
      applyBrandToDocument(getBrand(storageKey, channel, fallback), scope);
    };

    // 1) Suscripción antes del sync para que notify la alcance en la rehidratación inicial
    const unsubscribe = subscribeBrand(
      applyCurrentBrand,
      storageKey,
      channel,
      fallback
    );

    // 2) Rehidratación inicial — notify dispara applyCurrentBrand
    syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });

    // 3) Evento local
    const onLocal = () =>
      syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });
    window.addEventListener(channel, onLocal);

    // 4) Cross-tab
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(channel);
      bc.onmessage = () =>
        syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });
    }

    // 5) Storage (otras pestañas)
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument });
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      unregisterBrandScope(scope);
      window.removeEventListener(channel, onLocal);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
      if (resetSemanticRuntime) {
        resetSemanticRuntime();
      }
    };
  }, [scope, businessSlug, applyToDocument]);

  return null;
}
