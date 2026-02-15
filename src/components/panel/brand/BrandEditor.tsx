"use client";

import { useMemo, useState } from "react";
import type { Brand, BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import { BRAND_PALETTES } from "@/lib/brand/presets";
import { DEFAULT_BRAND, loadBrandFromStorage } from "@/lib/brand/storage";
import { applyBrandToDocument } from "@/lib/brand/apply";
import { LocalBrandRepository } from "@/lib/brand/repository.local";

const MODES: Array<{ key: BrandMode; label: string }> = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

function safeTitle(name: string) {
  const v = name?.trim();
  return v && v.length > 0 ? v : DEFAULT_BRAND.brandName;
}

export default function BrandEditor() {
  const palettes = useMemo<Array<{ key: BrandPaletteKey; label: string }>>(
    () => BRAND_PALETTES,
    []
  );

  const [brand, setBrand] = useState<Brand>(() => loadBrandFromStorage());

  function update(next: Brand) {
    setBrand(next);

    // Persistencia (hoy: localStorage, mañana: API sin reescribir el editor)
    LocalBrandRepository.set(next);

    // Aplicación visual inmediata (tokens CSS)
    applyBrandToDocument(next);

    // Demo: title refleja brandName
    document.title = safeTitle(next.brandName);

    // Same-tab (opcional, no rompe)
    window.dispatchEvent(new CustomEvent("bcc:brand", { detail: next }));

    // Cross-tab
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("bcc:brand");
      bc.postMessage({ type: "brand:update" });
      bc.close();
    }
  }

  return (
    <section className="w-full max-w-3xl">
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 text-(--card-foreground) shadow-sm">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Brand (v0)</h1>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Edición simulada con <code className="px-1">localStorage</code> + tokens CSS.
            Preview inmediato en el mismo instante.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Brand name</span>
            <input
              value={brand.brandName}
              onChange={(e) => update({ ...brand, brandName: e.target.value })}
              className="h-11 rounded-xl border border-(--border) bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="Business Control Center"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Mode</span>
            <select
              value={brand.mode}
              onChange={(e) =>
                update({ ...brand, mode: e.target.value as BrandMode })
              }
              className="h-11 rounded-xl border border-(--border) bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
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
              onChange={(e) =>
                update({ ...brand, palette: e.target.value as BrandPaletteKey })
              }
              className="h-11 rounded-xl border border-(--border) bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
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
          <div className="text-sm text-(--muted-foreground)">
            Aplicado:{" "}
            <span className="font-medium text-foreground">
              {brand.palette} / {brand.mode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => update(DEFAULT_BRAND)}
            className="h-10 rounded-xl border border-(--border) bg-(--muted) px-4 text-sm font-medium text-foreground hover:opacity-90"
          >
            Reset (default)
          </button>
        </div>
      </div>
    </section>
  );
}
