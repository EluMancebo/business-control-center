// src/components/panel/brand/BrandEditor.tsx
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Brand, BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import { BRAND_PALETTES } from "@/lib/brand/presets";
import {
  getBrandChannel,
  getBrandStorageKey,
  getDefaultBrandForScope,
  type BrandScope,
} from "@/lib/brand/storage";
import { getBrand, setBrand, subscribeBrand, syncBrandFromStorage } from "@/lib/brand/service";

const MODES: Array<{ key: BrandMode; label: string }> = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

function readActiveBusinessSlug(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("bcc:activeBusinessSlug")?.trim() || "";
}

function defer(fn: () => void) {
  const q =
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb);
  q(fn);
}

function useBrandScoped(storageKey: string, channel: string, fallback: Brand) {
  return useSyncExternalStore(
    (cb) => subscribeBrand(cb, storageKey, channel, fallback),
    () => getBrand(storageKey, channel, fallback),
    () => fallback
  );
}

type BrandEditorProps = {
  scope?: BrandScope;
  businessSlug?: string; // ✅ para admin (seleccionar cliente)
};

export default function BrandEditor({ scope = "panel", businessSlug }: BrandEditorProps) {
  const [resolvedSlug, setResolvedSlug] = useState<string>("");

  // Para panel/web cliente: toma activeBusinessSlug (si NO viene businessSlug por prop)
  useEffect(() => {
    if (scope === "system") return;
    if (businessSlug && businessSlug.trim()) return;

    defer(() => setResolvedSlug(readActiveBusinessSlug()));
  }, [scope, businessSlug]);

  const effectiveSlug =
    scope === "system" ? "" : (businessSlug?.trim() || resolvedSlug);

  const storageKey = useMemo(
    () => getBrandStorageKey(scope, scope === "system" ? undefined : effectiveSlug || undefined),
    [scope, effectiveSlug]
  );

  const channel = useMemo(
    () => getBrandChannel(scope, scope === "system" ? undefined : effectiveSlug || undefined),
    [scope, effectiveSlug]
  );

  const fallback = useMemo(() => getDefaultBrandForScope(scope), [scope]);

  // Rehidratación: en scope web dentro del panel NO aplicamos al documento
  useEffect(() => {
    syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument: scope !== "web" });
  }, [storageKey, channel, fallback, scope]);

  const current = useBrandScoped(storageKey, channel, fallback);
  const [brand, setBrandLocal] = useState<Brand>(fallback);

  useEffect(() => {
    setBrandLocal(current);
  }, [current]);

  const palettes = useMemo<Array<{ key: BrandPaletteKey; label: string }>>(
    () => BRAND_PALETTES,
    []
  );

  function update(next: Brand) {
    setBrandLocal(next);

    // ✅ clave: web no aplica al documento del panel
    setBrand(next, storageKey, channel, fallback, { applyToDocument: scope !== "web" });
  }

  const title =
    scope === "system"
      ? "Apariencia (Taller / Capa 1)"
      : scope === "panel"
      ? "Apariencia del panel (Capa 2)"
      : "Apariencia web pública";

  const subtitle =
    scope === "system"
      ? "Solo afecta al Taller (Admin)."
      : scope === "panel"
      ? "Solo afecta a la UI del panel del cliente."
      : "Solo afecta a la web pública del negocio.";

  return (
    <section className="w-full max-w-3xl">
      <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

          {scope !== "system" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Business slug activo:{" "}
              <span className="font-semibold text-foreground">{effectiveSlug || "—"}</span>
            </p>
          ) : null}

          <p className="mt-2 text-[11px] text-muted-foreground">
            storageKey: <span className="font-mono">{storageKey}</span> · channel:{" "}
            <span className="font-mono">{channel}</span>
          </p>

          {scope === "web" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Nota: aquí guardas la apariencia de la web. El panel no cambia (por diseño).
            </p>
          ) : null}
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Brand name</span>
            <input
              value={brand.brandName}
              onChange={(e) => update({ ...brand, brandName: e.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Business Control Center"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Mode</span>
            <select
              value={brand.mode}
              onChange={(e) => update({ ...brand, mode: e.target.value as BrandMode })}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {MODES.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-medium">Palette</span>
            <select
              value={brand.palette}
              onChange={(e) => update({ ...brand, palette: e.target.value as BrandPaletteKey })}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {palettes.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Aplicado:{" "}
            <span className="font-medium text-foreground">
              {brand.palette} / {brand.mode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => update(fallback)}
            className="h-10 rounded-xl border border-border bg-muted px-4 text-sm font-medium text-foreground hover:opacity-90"
          >
            Reset (scope default)
          </button>
        </div>
      </div>
    </section>
  );
}
 
