// src/components/panel/brand/BrandEditor.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Brand, BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import { BRAND_PALETTES } from "@/lib/brand/presets";
import {
  applyBrandThemePreviewToDocument,
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
  DEFAULT_BRAND_THEME_CONFIG,
} from "@/lib/brand-theme";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandTypographyPreset,
} from "@/lib/brand-theme";
import {
  getBrandChannel,
  getBrandStorageKey,
  getDefaultBrandForScope,
  type BrandScope,
} from "@/lib/brand/storage";
import { getBrand, setBrand, subscribeBrand, syncBrandFromStorage } from "@/lib/brand/service";
import BrandThemePreviewSurface from "./BrandThemePreviewSurface";

const MODES: Array<{ key: BrandMode; label: string }> = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

const HARMONY_LABELS: Record<BrandHarmonyStrategy, string> = {
  monochromatic: "Monochromatic",
  analogous: "Analogous",
  complementary: "Complementary",
  "split-complementary": "Split-complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
};

const ACCENT_STYLE_LABELS: Record<BrandAccentStyle, string> = {
  minimal: "Minimal",
  balanced: "Balanced",
  expressive: "Expressive",
};

const TYPOGRAPHY_LABELS: Record<BrandTypographyPreset, string> = {
  editorial: "Editorial",
  modern: "Modern",
  classic: "Classic",
  geometric: "Geometric",
};

function readActiveBusinessSlug(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("bcc:activeBusinessSlug")?.trim() || "";
}

function useBrandScoped(storageKey: string, channel: string, fallback: Brand, enabled: boolean) {
  return useSyncExternalStore(
    (cb) => (enabled ? subscribeBrand(cb, storageKey, channel, fallback) : () => {}),
    () => (enabled ? getBrand(storageKey, channel, fallback) : fallback),
    () => fallback
  );
}

type BrandEditorProps = {
  scope?: BrandScope;
  businessSlug?: string; // ✅ para admin (seleccionar cliente)
};

export default function BrandEditor({ scope = "panel", businessSlug }: BrandEditorProps) {
  const previewTargetRef = useRef<HTMLDivElement | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<string>(() => readActiveBusinessSlug());
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewHarmony, setPreviewHarmony] = useState<BrandHarmonyStrategy>(
    DEFAULT_BRAND_THEME_CONFIG.harmony
  );
  const [previewAccentStyle, setPreviewAccentStyle] = useState<BrandAccentStyle>(
    DEFAULT_BRAND_THEME_CONFIG.accentStyle
  );
  const [previewTypography, setPreviewTypography] = useState<BrandTypographyPreset>(
    DEFAULT_BRAND_THEME_CONFIG.typographyPreset
  );
  const scopeUsesBusinessSlug = scope === "panel" || scope === "web";

  // Para panel/web cliente: toma activeBusinessSlug (si NO viene businessSlug por prop)
  useEffect(() => {
    if (!scopeUsesBusinessSlug) return;
    if (businessSlug && businessSlug.trim()) return;

    const sync = () => setResolvedSlug(readActiveBusinessSlug());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [scopeUsesBusinessSlug, businessSlug]);

  const effectiveSlug = scopeUsesBusinessSlug ? (businessSlug?.trim() || resolvedSlug) : "";
  const skipWebWithoutSlug = scope === "web" && !effectiveSlug;

  const storageKey = useMemo(
    () => getBrandStorageKey(scope, scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined),
    [scope, scopeUsesBusinessSlug, effectiveSlug]
  );

  const channel = useMemo(
    () => getBrandChannel(scope, scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined),
    [scope, scopeUsesBusinessSlug, effectiveSlug]
  );

  const fallback = useMemo(() => getDefaultBrandForScope(scope), [scope]);

  // Rehidratación: solo scopes de shell global (studio/panel) aplican al documento.
  useEffect(() => {
    if (skipWebWithoutSlug) return;
    syncBrandFromStorage(storageKey, channel, fallback, {
      applyToDocument: scope === "panel" || scope === "studio",
    });
  }, [storageKey, channel, fallback, scope, skipWebWithoutSlug]);

  const current = useBrandScoped(storageKey, channel, fallback, !skipWebWithoutSlug);
  const [brand, setBrandLocal] = useState<Brand>(fallback);

  useEffect(() => {
    setBrandLocal(current);
  }, [current]);

  const palettes = useMemo<Array<{ key: BrandPaletteKey; label: string }>>(
    () => BRAND_PALETTES,
    []
  );

  useEffect(() => {
    if (!previewEnabled) return;
    if (skipWebWithoutSlug) return;
    const previewTarget = previewTargetRef.current;
    if (!previewTarget) return;

    return applyBrandThemePreviewToDocument({
      brand,
      config: {
        harmony: previewHarmony,
        accentStyle: previewAccentStyle,
        typographyPreset: previewTypography,
      },
      options: { systemModeFallback: "light" },
      target: previewTarget,
    });
  }, [
    previewEnabled,
    previewHarmony,
    previewAccentStyle,
    previewTypography,
    brand,
    skipWebWithoutSlug,
  ]);

  function resetPreviewState() {
    setPreviewHarmony(DEFAULT_BRAND_THEME_CONFIG.harmony);
    setPreviewAccentStyle(DEFAULT_BRAND_THEME_CONFIG.accentStyle);
    setPreviewTypography(DEFAULT_BRAND_THEME_CONFIG.typographyPreset);
    setPreviewEnabled(false);
  }

  function update(next: Brand) {
    setBrandLocal(next);
    if (skipWebWithoutSlug) return;

    // Solo "studio/panel" gobiernan shell global. "system/web" quedan aislados.
    setBrand(next, storageKey, channel, fallback, {
      applyToDocument: scope === "panel" || scope === "studio",
    });
  }

  const title =
    scope === "system"
      ? "Apariencia (Taller / Capa 1)"
      : scope === "studio"
      ? "Apariencia del shell (Capa 1)"
      : scope === "panel"
      ? "Apariencia del panel (Capa 2)"
      : "Apariencia web pública";

  const subtitle =
    scope === "system"
      ? "Laboratorio de identidad del sistema (aislado del shell global del panel)."
      : scope === "studio"
      ? "Gobierna la UI global interna de Capa 1 (admin/studio)."
      : scope === "panel"
      ? "Gobierna la UI global del panel cliente (Capa 2)."
      : "Solo afecta a la web pública del negocio.";

  return (
    <section className="w-full max-w-3xl">
      <div
        ref={previewTargetRef}
        className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm"
      >
        <header className="mb-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

          {scopeUsesBusinessSlug ? (
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

        <section className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Brand Theme Preview (runtime only)</p>
            <button
              type="button"
              onClick={() => setPreviewEnabled((value) => !value)}
              disabled={skipWebWithoutSlug}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {previewEnabled ? "Disable preview" : "Enable preview"}
            </button>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            No se guarda en DB/localStorage. Solo aplica en esta pestaña y se limpia al desactivar o salir.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">Harmony</span>
              <select
                value={previewHarmony}
                onChange={(e) => setPreviewHarmony(e.target.value as BrandHarmonyStrategy)}
                disabled={!previewEnabled || skipWebWithoutSlug}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {BRAND_THEME_HARMONY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {HARMONY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">Accent style</span>
              <select
                value={previewAccentStyle}
                onChange={(e) => setPreviewAccentStyle(e.target.value as BrandAccentStyle)}
                disabled={!previewEnabled || skipWebWithoutSlug}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {BRAND_THEME_ACCENT_STYLE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {ACCENT_STYLE_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">Typography</span>
              <select
                value={previewTypography}
                onChange={(e) => setPreviewTypography(e.target.value as BrandTypographyPreset)}
                disabled={!previewEnabled || skipWebWithoutSlug}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {BRAND_THEME_TYPOGRAPHY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {TYPOGRAPHY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Preview: {previewEnabled ? "active" : "off"} · {previewHarmony} · {previewAccentStyle} ·{" "}
              {previewTypography}
            </span>

            <button
              type="button"
              onClick={resetPreviewState}
              className="h-8 rounded-lg border border-border bg-background px-3 font-medium text-foreground hover:opacity-90"
            >
              Clear preview
            </button>
          </div>

          <BrandThemePreviewSurface
            previewEnabled={previewEnabled}
            harmony={previewHarmony}
            accentStyle={previewAccentStyle}
            typographyPreset={previewTypography}
          />
        </section>

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
 
