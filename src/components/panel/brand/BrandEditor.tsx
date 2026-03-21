"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Brand, BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import { BRAND_PALETTES } from "@/lib/brand/presets";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
  DEFAULT_BRAND_THEME_CONFIG,
  extractPaletteFromImageUrl,
  getBrandThemePalettePreset,
  normalizeBrandPaletteSeed,
  resolveBrandThemeMode,
  resolveBrandThemeTokensFromBrand,
  resolveBrandThemeTokensFromPaletteSeed,
  toBrandCssVariables,
} from "@/lib/brand-theme";
import type {
  BrandAccentStyle,
  BrandCorePaletteTokens,
  BrandHarmonyStrategy,
  BrandPaletteSeedSource,
  BrandSemanticTokens,
  BrandTypographyPreset,
  ExtractedPaletteResult,
} from "@/lib/brand-theme";
import {
  getBrandChannel,
  getBrandStorageKey,
  getDefaultBrandForScope,
  type BrandScope,
} from "@/lib/brand/storage";
import { getBrand, setBrand, subscribeBrand, syncBrandFromStorage } from "@/lib/brand/service";
import type { AssetItem } from "@/lib/taller/media/types";
import { fetchSystemMediaClient } from "@/lib/taller/media/service";
import BrandThemePreviewSurface from "./BrandThemePreviewSurface";

const PRESET_MODULATION_PERCENT = 26;
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
const PALETTE_SOURCE_LABELS: Record<BrandPaletteSeedSource, string> = {
  manual: "Manual",
  logo: "Logo",
  hero: "Hero image",
};
const TYPOGRAPHY_FONT_STACK: Record<BrandTypographyPreset, string> = {
  editorial: "Georgia, Cambria, 'Times New Roman', Times, serif",
  modern:
    "var(--font-geist-sans), system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  classic: "'Trebuchet MS', 'Segoe UI', Tahoma, Arial, sans-serif",
  geometric:
    "'Avenir Next', Avenir, 'Century Gothic', Montserrat, var(--font-geist-sans), sans-serif",
};

type BrandEditorProps = { scope?: BrandScope; businessSlug?: string };
type RGB = { r: number; g: number; b: number };
type TokenDiagnosticKey =
  | "background"
  | "card"
  | "surface2"
  | "surface3"
  | "primary"
  | "accent"
  | "accentSoft"
  | "accentStrong"
  | "link"
  | "border"
  | "ring";

const TOKEN_DIAGNOSTIC_KEYS: TokenDiagnosticKey[] = [
  "background",
  "card",
  "surface2",
  "surface3",
  "primary",
  "accent",
  "accentSoft",
  "accentStrong",
  "link",
  "border",
  "ring",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function parseColor(input: string): RGB | null {
  const value = input.trim().toLowerCase();
  const rgbMatch = value.match(
    /^rgba?\(\s*([0-9]+)[,\s]+([0-9]+)[,\s]+([0-9]+)(?:[,\s/]+([0-9.]+))?\s*\)$/
  );
  if (rgbMatch) {
    return { r: clamp(Number(rgbMatch[1]), 0, 255), g: clamp(Number(rgbMatch[2]), 0, 255), b: clamp(Number(rgbMatch[3]), 0, 255) };
  }
  if (!value.startsWith("#")) return null;
  const hex = value.slice(1);
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return { r: parseInt(`${hex[0]}${hex[0]}`, 16), g: parseInt(`${hex[1]}${hex[1]}`, 16), b: parseInt(`${hex[2]}${hex[2]}`, 16) };
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }
  return null;
}
function rgbToHex(input: RGB) {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(input.r)}${toHex(input.g)}${toHex(input.b)}`;
}
function mixColor(a: string, b: string, ratio: number) {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  const w = clamp(ratio, 0, 1);
  return rgbToHex({ r: ca.r * (1 - w) + cb.r * w, g: ca.g * (1 - w) + cb.g * w, b: ca.b * (1 - w) + cb.b * w });
}
function modulateTokensWithPreset(args: {
  tokens: BrandSemanticTokens;
  presetCore: BrandCorePaletteTokens;
  modulationPercent: number;
}): BrandSemanticTokens {
  const ratio = clamp(args.modulationPercent / 100, 0, 0.42);
  if (ratio <= 0) return args.tokens;
  const { tokens, presetCore } = args;
  const atmosphereBase = mixColor(presetCore.muted, presetCore.primary, 0.32);
  const surfaceRatio = clamp(ratio * 1.22, 0, 0.5);
  const softRatio = clamp(ratio * 0.52, 0, 0.24);
  const ringRatio = clamp(ratio * 0.62, 0, 0.3);
  const linkHoverRatio = clamp(ratio * 0.36, 0, 0.2);
  const accentSoft = mixColor(tokens.accentSoft, atmosphereBase, softRatio);
  return {
    ...tokens,
    background: mixColor(tokens.background, presetCore.background, surfaceRatio),
    card: mixColor(tokens.card, presetCore.card, surfaceRatio * 0.9),
    muted: mixColor(tokens.muted, presetCore.muted, surfaceRatio),
    surface2: mixColor(tokens.surface2, atmosphereBase, surfaceRatio),
    surface3: mixColor(tokens.surface3, atmosphereBase, surfaceRatio * 0.9),
    border: mixColor(tokens.border, presetCore.border, ratio * 0.6),
    ring: mixColor(tokens.ring, presetCore.primary, ringRatio),
    accentSoft,
    badgeBg: accentSoft,
    linkHover: mixColor(tokens.linkHover, presetCore.primary, linkHoverRatio),
  };
}
function readActiveBusinessSlug() {
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

function pickTokenDiagnostics(tokens: BrandSemanticTokens) {
  return {
    background: tokens.background,
    card: tokens.card,
    surface2: tokens.surface2,
    surface3: tokens.surface3,
    primary: tokens.primary,
    accent: tokens.accent,
    accentSoft: tokens.accentSoft,
    accentStrong: tokens.accentStrong,
    link: tokens.link,
    border: tokens.border,
    ring: tokens.ring,
  };
}

function getChangedTokenKeys(a: BrandSemanticTokens, b: BrandSemanticTokens) {
  return TOKEN_DIAGNOSTIC_KEYS.filter((key) => a[key] !== b[key]);
}

export default function BrandEditor({ scope = "panel", businessSlug }: BrandEditorProps) {
  const [resolvedSlug, setResolvedSlug] = useState(() => readActiveBusinessSlug());
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewHarmony, setPreviewHarmony] = useState<BrandHarmonyStrategy>(DEFAULT_BRAND_THEME_CONFIG.harmony);
  const [previewAccentStyle, setPreviewAccentStyle] = useState<BrandAccentStyle>(DEFAULT_BRAND_THEME_CONFIG.accentStyle);
  const [previewTypography, setPreviewTypography] = useState<BrandTypographyPreset>(DEFAULT_BRAND_THEME_CONFIG.typographyPreset);
  const [paletteSeedSource, setPaletteSeedSource] = useState<BrandPaletteSeedSource>("manual");
  const [paletteSeedPrimary, setPaletteSeedPrimary] = useState("#2563eb");
  const [paletteSeedAccent, setPaletteSeedAccent] = useState("");
  const [paletteSeedNeutral, setPaletteSeedNeutral] = useState("");
  const [mediaAssets, setMediaAssets] = useState<AssetItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [selectedVisualAssetId, setSelectedVisualAssetId] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [extractedPalette, setExtractedPalette] = useState<ExtractedPaletteResult | null>(null);
  const [extractError, setExtractError] = useState("");
  const [extracting, setExtracting] = useState(false);

  const scopeUsesBusinessSlug = scope === "panel" || scope === "web";
  const canUsePaletteEngine = scope === "system";
  const showLabPreview = scope === "system";
  const effectiveSlug = scopeUsesBusinessSlug ? (businessSlug?.trim() || resolvedSlug) : "";
  const skipWebWithoutSlug = scope === "web" && !effectiveSlug;
  const storageKey = getBrandStorageKey(scope, scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined);
  const channel = getBrandChannel(scope, scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined);
  const fallback = getDefaultBrandForScope(scope);
  const current = useBrandScoped(storageKey, channel, fallback, !skipWebWithoutSlug);
  const [brand, setBrandLocal] = useState<Brand>(fallback);

  useEffect(() => setBrandLocal(current), [current]);
  useEffect(() => {
    if (!scopeUsesBusinessSlug || (businessSlug && businessSlug.trim())) return;
    const sync = () => setResolvedSlug(readActiveBusinessSlug());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [scopeUsesBusinessSlug, businessSlug]);
  useEffect(() => {
    if (skipWebWithoutSlug) return;
    syncBrandFromStorage(storageKey, channel, fallback, { applyToDocument: scope === "panel" || scope === "studio" });
  }, [skipWebWithoutSlug, storageKey, channel, fallback, scope]);
  useEffect(() => {
    if (!canUsePaletteEngine) return;
    let cancelled = false;
    setMediaLoading(true);
    fetchSystemMediaClient("")
      .then((items) => !cancelled && setMediaAssets(items.filter((item) => item.kind !== "video")))
      .catch((error: unknown) => !cancelled && setMediaError(error instanceof Error ? error.message : "No se pudo cargar Media Center."))
      .finally(() => !cancelled && setMediaLoading(false));
    return () => {
      cancelled = true;
    };
  }, [canUsePaletteEngine]);

  const selectedVisualAsset = useMemo(() => mediaAssets.find((item) => item._id === selectedVisualAssetId) ?? null, [mediaAssets, selectedVisualAssetId]);
  const sourceImageUrl = useMemo(() => (paletteSeedSource === "manual" ? "" : selectedVisualAsset?.url || imageUrlInput.trim()), [paletteSeedSource, selectedVisualAsset, imageUrlInput]);
  const paletteSeedInput = useMemo(() => ({ source: paletteSeedSource, primary: paletteSeedPrimary, accent: paletteSeedAccent, neutral: paletteSeedNeutral }), [paletteSeedSource, paletteSeedPrimary, paletteSeedAccent, paletteSeedNeutral]);
  const normalizedPaletteSeed = useMemo(() => normalizeBrandPaletteSeed(paletteSeedInput), [paletteSeedInput]);
  const resolvedMode = resolveBrandThemeMode(brand.mode, { systemModeFallback: "light" });
  const preset = getBrandThemePalettePreset(brand.palette);
  const presetCore = resolvedMode === "dark" ? preset.dark : preset.light;
  const resolvedTokensFromSeed = useMemo(
    () =>
      resolveBrandThemeTokensFromPaletteSeed({
        seed: paletteSeedInput,
        mode: brand.mode,
        config: { harmony: previewHarmony, accentStyle: previewAccentStyle, typographyPreset: previewTypography },
        options: { systemModeFallback: "light" },
      }),
    [paletteSeedInput, brand.mode, previewHarmony, previewAccentStyle, previewTypography]
  );
  const resolvedTokensFromBrand = useMemo(
    () =>
      resolveBrandThemeTokensFromBrand({
        brand,
        config: { harmony: previewHarmony, accentStyle: previewAccentStyle, typographyPreset: previewTypography },
        options: { systemModeFallback: "light" },
      }),
    [brand, previewHarmony, previewAccentStyle, previewTypography]
  );
  const resolvedTokens = resolvedTokensFromSeed ?? resolvedTokensFromBrand;
  const effectiveTokens = modulateTokensWithPreset({ tokens: resolvedTokens, presetCore, modulationPercent: PRESET_MODULATION_PERCENT });
  const previewVariables = useMemo(() => {
    const variables = toBrandCssVariables(effectiveTokens);
    variables["--brand-typography-preset"] = effectiveTokens.typographyPreset;
    variables["--font-sans"] = TYPOGRAPHY_FONT_STACK[effectiveTokens.typographyPreset];
    return variables;
  }, [effectiveTokens]);

  useEffect(() => {
    if (!canUsePaletteEngine || process.env.NODE_ENV === "production") return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("bcc:brand:debug") !== "1") return;

    const harmonyMatrix = BRAND_THEME_HARMONY_OPTIONS.map((harmonyOption) => {
      const candidate =
        resolveBrandThemeTokensFromPaletteSeed({
          seed: paletteSeedInput,
          mode: brand.mode,
          config: {
            harmony: harmonyOption,
            accentStyle: previewAccentStyle,
            typographyPreset: previewTypography,
          },
          options: { systemModeFallback: "light" },
        }) ??
        resolveBrandThemeTokensFromBrand({
          brand,
          config: {
            harmony: harmonyOption,
            accentStyle: previewAccentStyle,
            typographyPreset: previewTypography,
          },
          options: { systemModeFallback: "light" },
        });

      return {
        harmony: harmonyOption,
        accent: candidate.accent,
        accentSoft: candidate.accentSoft,
        accentStrong: candidate.accentStrong,
        link: candidate.link,
        surface2: candidate.surface2,
      };
    });

    const presetMatrix = BRAND_PALETTES.map((paletteOption) => {
      const palettePreset = getBrandThemePalettePreset(paletteOption.key);
      const paletteCore = resolvedMode === "dark" ? palettePreset.dark : palettePreset.light;
      const withPreset = modulateTokensWithPreset({
        tokens: resolvedTokens,
        presetCore: paletteCore,
        modulationPercent: PRESET_MODULATION_PERCENT,
      });

      return {
        preset: paletteOption.key,
        background: withPreset.background,
        card: withPreset.card,
        surface2: withPreset.surface2,
        surface3: withPreset.surface3,
        border: withPreset.border,
        ring: withPreset.ring,
      };
    });

    const changedByPreset = getChangedTokenKeys(resolvedTokens, effectiveTokens);

    console.groupCollapsed("[BrandLab Debug] Motor cromatico");
    console.log("seed.input", paletteSeedInput);
    console.log("seed.normalized", normalizedPaletteSeed);
    console.log("resolved.source", resolvedTokensFromSeed ? "palette-seed" : "brand-fallback");
    console.log("tokens.beforePreset", pickTokenDiagnostics(resolvedTokens));
    console.log("tokens.afterPreset", pickTokenDiagnostics(effectiveTokens));
    console.log("tokens.changedByPreset", changedByPreset);
    console.table(harmonyMatrix);
    console.table(presetMatrix);
    console.groupEnd();
  }, [
    canUsePaletteEngine,
    paletteSeedInput,
    normalizedPaletteSeed,
    brand,
    resolvedMode,
    previewAccentStyle,
    previewTypography,
    resolvedTokensFromSeed,
    resolvedTokens,
    effectiveTokens,
  ]);

  function update(next: Brand) {
    setBrandLocal(next);
    if (skipWebWithoutSlug) return;
    setBrand(next, storageKey, channel, fallback, { applyToDocument: scope === "panel" || scope === "studio" });
  }
  function resetPreviewState() {
    setPreviewEnabled(false);
    setPreviewHarmony(DEFAULT_BRAND_THEME_CONFIG.harmony);
    setPreviewAccentStyle(DEFAULT_BRAND_THEME_CONFIG.accentStyle);
    setPreviewTypography(DEFAULT_BRAND_THEME_CONFIG.typographyPreset);
  }
  function clearVisualSource() {
    setSelectedVisualAssetId("");
    setImageUrlInput("");
    setExtractedPalette(null);
    setExtractError("");
    setPaletteSeedSource("manual");
  }
  function resetLab() {
    clearVisualSource();
    setPaletteSeedPrimary((resolvedMode === "dark" ? preset.dark : preset.light).primary);
    setPaletteSeedAccent("");
    setPaletteSeedNeutral("");
    resetPreviewState();
  }
  async function runExtraction() {
    if (!sourceImageUrl) return setExtractError("Selecciona un asset o pega una URL antes de extraer.");
    setExtracting(true);
    setExtractError("");
    try {
      const result = await extractPaletteFromImageUrl(sourceImageUrl, { source: paletteSeedSource === "hero" ? "hero" : "logo" });
      setExtractedPalette(result);
      setPaletteSeedPrimary(result.proposal.primary);
      setPaletteSeedAccent(result.proposal.accent);
      setPaletteSeedNeutral(result.proposal.neutral);
    } catch (error: unknown) {
      setExtractError(error instanceof Error ? error.message : "No se pudo extraer paleta.");
    } finally {
      setExtracting(false);
    }
  }

  if (skipWebWithoutSlug) {
    return (
      <section className="w-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">Apariencia web pública</h1>
        <p className="mt-2 text-sm text-muted-foreground">No hay negocio activo para scope web.</p>
      </section>
    );
  }

  const technicalTokens: Array<{ label: string; value: string }> = [
    { label: "background", value: effectiveTokens.background },
    { label: "card", value: effectiveTokens.card },
    { label: "surface2", value: effectiveTokens.surface2 },
    { label: "surface3", value: effectiveTokens.surface3 },
    { label: "primary", value: effectiveTokens.primary },
    { label: "accent", value: effectiveTokens.accent },
    { label: "link", value: effectiveTokens.link },
    { label: "border", value: effectiveTokens.border },
  ];

  return (
    <section className="w-full max-w-none">
      <div className="rounded-2xl border border-border/55 bg-card/95 p-4 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] sm:p-6">
        <header>
          <h1 className="text-xl font-semibold">{scope === "system" ? "Brand Lab (Taller / Capa 1)" : "Apariencia"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{scope === "system" ? "Laboratorio visual para decisiones cromáticas con preview local aislada." : "Editor de apariencia por scope."}</p>
        </header>

        {showLabPreview ? (
          <section className="mt-4 rounded-xl border border-border/55 p-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Preview runtime local</p>
                <p className="text-xs text-muted-foreground">ON/OFF por pestaña. Sin persistencia global.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={previewEnabled}
                onClick={() => setPreviewEnabled((v) => !v)}
                className={[
                  "relative inline-flex h-8 w-14 items-center rounded-full border p-1 transition",
                  previewEnabled
                    ? "border-emerald-400/70 bg-emerald-500/35 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.45),0_8px_18px_-14px_rgba(16,185,129,0.5)]"
                    : "border-border/70 bg-slate-200/70 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.4)] dark:bg-slate-700/60",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex h-6 w-6 rounded-full border shadow-[0_6px_16px_-12px_rgba(15,23,42,0.6)] transition-transform",
                    previewEnabled
                      ? "translate-x-6 border-emerald-200/80 bg-white dark:bg-emerald-50"
                      : "translate-x-0 border-border/70 bg-white dark:bg-slate-100",
                  ].join(" ")}
                />
              </button>
            </div>
          </section>
        ) : null}

        {showLabPreview ? (
          <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
          {canUsePaletteEngine ? (
            <section className="flex h-full flex-col rounded-xl border border-border/55 p-4 shadow-[0_14px_28px_-22px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
              <h2 className="text-base font-semibold text-foreground">A. Fuente visual</h2>
              <p className="mt-1 text-xs text-muted-foreground">Estado: {paletteSeedSource === "manual" ? "Manual" : sourceImageUrl ? "Fuente activa" : "Sin fuente seleccionada"}.</p>
              <div className="mt-3 grid gap-2">
                <select value={paletteSeedSource} onChange={(e) => setPaletteSeedSource(e.target.value as BrandPaletteSeedSource)} className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)]">{Object.entries(PALETTE_SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <select value={selectedVisualAssetId} onChange={(e) => setSelectedVisualAssetId(e.target.value)} disabled={paletteSeedSource === "manual" || mediaLoading} className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)] disabled:opacity-60"><option value="">{mediaLoading ? "Cargando assets..." : "Seleccionar asset"}</option>{mediaAssets.map((asset) => <option key={asset._id} value={asset._id}>{asset.label}</option>)}</select>
                <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} disabled={paletteSeedSource === "manual"} placeholder={paletteSeedSource === "manual" ? "Modo manual activo" : "https://..."} className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)] disabled:opacity-60" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={runExtraction} disabled={paletteSeedSource === "manual" || !sourceImageUrl || extracting} className="h-10 rounded-lg border border-primary/40 bg-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_-14px_rgba(37,99,235,0.55)] transition hover:bg-primary disabled:opacity-60">{extracting ? "Extrayendo..." : "Extraer paleta"}</button>
                <button type="button" onClick={clearVisualSource} className="h-10 rounded-lg border border-border/55 bg-background px-4 text-sm font-semibold text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)] transition hover:bg-muted">Limpiar fuente</button>
              </div>
              {extractError ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{extractError}</p> : null}
              {mediaError ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{mediaError}</p> : null}
              {paletteSeedSource === "manual" ? (
                <div className="mt-3 rounded-lg border border-dashed border-border/55 p-3 [background:color-mix(in_oklab,var(--surface-3,var(--card))_88%,white)]">
                  <p className="text-xs font-semibold text-foreground">Selección manual de paleta</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    En modo manual trabajas directamente sobre primary, accent y neutral.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-border/55 bg-background/70 p-2">
                      <input type="color" value={paletteSeedPrimary || "#2563eb"} onChange={(e) => setPaletteSeedPrimary(e.target.value)} className="h-8 w-9 rounded-md border border-border/70 bg-background p-1" />
                      <input value={paletteSeedPrimary} onChange={(e) => setPaletteSeedPrimary(e.target.value)} className="h-8 w-full min-w-0 rounded-md border border-border/70 bg-background px-2 font-mono text-xs text-foreground" />
                    </label>
                    <label className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/55 bg-background/70 p-2">
                      <input type="color" value={paletteSeedAccent || "#0f62fe"} onChange={(e) => setPaletteSeedAccent(e.target.value)} className="h-8 w-9 rounded-md border border-border/70 bg-background p-1" />
                      <input value={paletteSeedAccent} onChange={(e) => setPaletteSeedAccent(e.target.value)} placeholder="AUTO" className="h-8 w-full min-w-0 rounded-md border border-border/70 bg-background px-2 font-mono text-xs text-foreground placeholder:text-muted-foreground" />
                      <button type="button" onClick={() => setPaletteSeedAccent("")} className="h-8 rounded-md border border-border/70 bg-background px-2 text-[11px] font-semibold text-foreground">Auto</button>
                    </label>
                    <label className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/55 bg-background/70 p-2">
                      <input type="color" value={paletteSeedNeutral || "#e2e8f0"} onChange={(e) => setPaletteSeedNeutral(e.target.value)} className="h-8 w-9 rounded-md border border-border/70 bg-background p-1" />
                      <input value={paletteSeedNeutral} onChange={(e) => setPaletteSeedNeutral(e.target.value)} placeholder="AUTO" className="h-8 w-full min-w-0 rounded-md border border-border/70 bg-background px-2 font-mono text-xs text-foreground placeholder:text-muted-foreground" />
                      <button type="button" onClick={() => setPaletteSeedNeutral("")} className="h-8 rounded-md border border-border/70 bg-background px-2 text-[11px] font-semibold text-foreground">Auto</button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mt-3 overflow-hidden rounded-lg border border-dashed border-border/55 p-2 [background:color-mix(in_oklab,var(--surface-3,var(--card))_88%,white)]">
                  {sourceImageUrl ? (
                    <div className="aspect-[4/3] w-full sm:aspect-[16/10] xl:aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sourceImageUrl}
                        alt="Fuente visual seleccionada"
                        className="h-full w-full rounded-md object-contain"
                      />
                    </div>
                  ) : (
                    <div className="grid aspect-[4/3] w-full place-items-center sm:aspect-[16/10] xl:aspect-[4/3]">
                      <p className="px-2 text-center text-xs text-muted-foreground">Sin imagen seleccionada.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : null}

          <BrandThemePreviewSurface previewEnabled={previewEnabled} harmony={previewHarmony} accentStyle={previewAccentStyle} typographyPreset={previewTypography} showCompositionPanel={canUsePaletteEngine} modeLabel={resolvedMode} paletteLabel={preset.label} presetRoleLabel="La seed manda identidad. Preset modula superficies y atmósfera." presetModulationPercent={PRESET_MODULATION_PERCENT} previewVariables={previewEnabled ? previewVariables : {}} resolvedTokens={effectiveTokens} />
          </div>
        ) : null}

        {canUsePaletteEngine ? (
          <section className="mt-4 rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
            <h2 className="text-base font-semibold text-foreground">B. Paleta propuesta</h2>
            <div className="mt-3 grid gap-3 xl:grid-cols-3">
              <div className="rounded-lg border border-border/55 p-3 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_84%,white)]">
                <p className="text-sm font-semibold text-foreground">Primary</p>
                <div className="mt-2 flex items-center gap-2">
                  <input type="color" value={paletteSeedPrimary || "#2563eb"} onChange={(e) => setPaletteSeedPrimary(e.target.value)} className="h-9 w-10 rounded-md border border-border/70 bg-background p-1" />
                  <input value={paletteSeedPrimary} onChange={(e) => setPaletteSeedPrimary(e.target.value)} className="h-9 min-w-0 flex-1 rounded-md border border-border/70 bg-background px-3 font-mono text-sm text-foreground" />
                </div>
              </div>
              <div className="rounded-lg border border-border/55 p-3 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_84%,white)]">
                <p className="text-sm font-semibold text-foreground">Accent</p>
                <div className="mt-2 flex items-center gap-2">
                  <input type="color" value={paletteSeedAccent || "#0f62fe"} onChange={(e) => setPaletteSeedAccent(e.target.value)} className="h-9 w-10 rounded-md border border-border/70 bg-background p-1" />
                  <input value={paletteSeedAccent} onChange={(e) => setPaletteSeedAccent(e.target.value)} placeholder="AUTO" className="h-9 min-w-0 flex-1 rounded-md border border-border/70 bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground" />
                  <button type="button" onClick={() => setPaletteSeedAccent("")} className="h-9 rounded-md border border-border/70 bg-background px-3 text-xs font-semibold text-foreground">Auto</button>
                </div>
              </div>
              <div className="rounded-lg border border-border/55 p-3 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_84%,white)]">
                <p className="text-sm font-semibold text-foreground">Neutral</p>
                <div className="mt-2 flex items-center gap-2">
                  <input type="color" value={paletteSeedNeutral || "#e2e8f0"} onChange={(e) => setPaletteSeedNeutral(e.target.value)} className="h-9 w-10 rounded-md border border-border/70 bg-background p-1" />
                  <input value={paletteSeedNeutral} onChange={(e) => setPaletteSeedNeutral(e.target.value)} placeholder="AUTO" className="h-9 min-w-0 flex-1 rounded-md border border-border/70 bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground" />
                  <button type="button" onClick={() => setPaletteSeedNeutral("")} className="h-9 rounded-md border border-border/70 bg-background px-3 text-xs font-semibold text-foreground">Auto</button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-4 rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            <h2 className="text-base font-semibold text-foreground">C. Composición y contexto</h2>
            <p className="text-[11px] text-muted-foreground sm:text-right">
              Contexto: <span className="font-medium text-foreground/80">{brand.brandName || "Sin nombre"}</span>
            </p>
          </div>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-3 gap-y-3 lg:gap-x-4">
            <label className="grid min-w-0 gap-1">
              <span className="text-xs font-medium text-muted-foreground">Mode</span>
              <select
                value={brand.mode}
                onChange={(e) => update({ ...brand, mode: e.target.value as BrandMode })}
                className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)]"
              >
                {MODES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1">
              <span className="text-xs font-medium text-muted-foreground">Preset palette</span>
              <select
                value={brand.palette}
                onChange={(e) => update({ ...brand, palette: e.target.value as BrandPaletteKey })}
                className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)]"
              >
                {BRAND_PALETTES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1">
              <span className="text-xs font-medium text-muted-foreground">Harmony</span>
              <select
                value={previewHarmony}
                onChange={(e) => setPreviewHarmony(e.target.value as BrandHarmonyStrategy)}
                className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)]"
              >
                {BRAND_THEME_HARMONY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {HARMONY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1">
              <span className="text-xs font-medium text-muted-foreground">Accent style</span>
              <select
                value={previewAccentStyle}
                onChange={(e) => setPreviewAccentStyle(e.target.value as BrandAccentStyle)}
                className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)]"
              >
                {BRAND_THEME_ACCENT_STYLE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {ACCENT_STYLE_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1">
              <span className="text-xs font-medium text-muted-foreground">Typography</span>
              <select
                value={previewTypography}
                onChange={(e) => setPreviewTypography(e.target.value as BrandTypographyPreset)}
                className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.4)]"
              >
                {BRAND_THEME_TYPOGRAPHY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {TYPOGRAPHY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {canUsePaletteEngine ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.45fr)_minmax(240px,0.95fr)]">
            <section className="rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
              <h3 className="text-sm font-semibold text-foreground">Seed activa</h3>
              <div className="mt-2 grid gap-2">
                {normalizedPaletteSeed ? (
                  [{ label: "Primary", value: normalizedPaletteSeed.primary }, { label: "Accent", value: normalizedPaletteSeed.accent }, { label: "Neutral", value: normalizedPaletteSeed.neutral }].map((item) => (
                    <div key={item.label} className="rounded-md border border-border/55 bg-background/75 p-2 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 rounded border border-border/55" style={{ backgroundColor: item.value }} />
                        <p title={item.value} className="truncate font-mono text-xs text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))
                ) : <p className="text-xs text-amber-700 dark:text-amber-300">Seed inválida.</p>}
              </div>
            </section>

            <section className="rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
              <h3 className="text-sm font-semibold text-foreground">Detalles técnicos</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {technicalTokens.map((token) => (
                  <div key={token.label} className="rounded-md border border-border/55 bg-background/75 p-2 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 rounded border border-border/55" style={{ backgroundColor: token.value }} />
                      <p className="text-xs font-semibold text-foreground">{token.label}</p>
                    </div>
                    <p title={token.value} className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{token.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
              <h3 className="text-sm font-semibold text-foreground">D. Acciones laboratorio</h3>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={resetPreviewState} className="h-10 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)] transition hover:-translate-y-px hover:bg-muted">Reset preview</button>
                <button type="button" onClick={resetLab} className="h-10 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)] transition hover:-translate-y-px hover:bg-muted">Reset general</button>
                <button type="button" onClick={() => update(fallback)} className="h-10 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)] transition hover:-translate-y-px hover:bg-muted">Reset scope</button>
              </div>
              <details className="mt-3 rounded-md border border-border/55 bg-background/70 p-2 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                <summary className="cursor-pointer text-xs font-semibold text-foreground">E. Detalles secundarios</summary>
                <p className="mt-2 text-xs text-muted-foreground">Preset activo: {preset.label}. Modulación aplicada: {PRESET_MODULATION_PERCENT}%.</p>
                {extractedPalette ? <p className="mt-1 text-xs text-muted-foreground">Extracción: {extractedPalette.imageWidth}x{extractedPalette.imageHeight} · {extractedPalette.sampledPixels} px.</p> : null}
              </details>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
