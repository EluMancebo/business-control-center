"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  resolveBrandThemeTokensFromPaletteSeedWithMeta,
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
import type {
  BrandPresetVaultItem,
  BrandPresetVaultMode,
  BrandPresetVaultResponse,
} from "@/lib/brand-theme/vault-contract";
import { mapVaultPresetToHeroInput } from "@/lib/content-lab/hero/vault-to-hero";
import {
  getBrandChannel,
  getBrandStorageKey,
  getDefaultBrandForScope,
  type BrandScope,
} from "@/lib/brand/storage";
import { getBrand, setBrand, subscribeBrand, syncBrandFromStorage } from "@/lib/brand/service";
import {
  buildBrandThemeStateV1FromEditorInput,
  persistLegacyAndBrandThemeShadow,
  saveBrandThemeStateV1Shadow,
} from "@/lib/brand-theme/state/from-editor";
import type { AssetItem } from "@/lib/taller/media/types";
import { fetchSystemMediaClient } from "@/lib/taller/media/service";
import BrandThemePreviewSurface from "./BrandThemePreviewSurface";
import {
  getSeedChannelMode,
  resolveSeedInputDisplayValue,
} from "./seedDisplay";

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
type StudioAppearanceConfig = {
  mode: BrandMode;
  atmosphere: BrandPaletteKey;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typography: BrandTypographyPreset;
};
type StudioAppearanceResponse =
  | { ok: true; config: StudioAppearanceConfig }
  | { ok: false; error?: string };
type RGB = { r: number; g: number; b: number };
const DARK_SWATCH_TEXT: RGB = { r: 11, g: 18, b: 32 };
const LIGHT_SWATCH_TEXT: RGB = { r: 248, g: 250, b: 252 };
type SourceAssetKind = "hero" | "logo";
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
type PresetAtmosphereProfile = {
  atmospherePrimaryMix: number;
  surfaceInfluence: number;
  atmosphereInfluence: number;
  borderInfluence: number;
  ringInfluence: number;
  linkInfluence: number;
  accentSoftInfluence: number;
  neutralizeAccent: boolean;
};

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
const PRESET_ATMOSPHERE_PROFILES: Record<BrandPaletteKey, PresetAtmosphereProfile> = {
  bcc: {
    atmospherePrimaryMix: 0.2,
    surfaceInfluence: 0.16,
    atmosphereInfluence: 0.13,
    borderInfluence: 0.2,
    ringInfluence: 0.16,
    linkInfluence: 0.14,
    accentSoftInfluence: 0.14,
    neutralizeAccent: false,
  },
  ocean: {
    atmospherePrimaryMix: 0.42,
    surfaceInfluence: 0.5,
    atmosphereInfluence: 0.68,
    borderInfluence: 0.36,
    ringInfluence: 0.4,
    linkInfluence: 0.36,
    accentSoftInfluence: 0.48,
    neutralizeAccent: false,
  },
  sunset: {
    atmospherePrimaryMix: 0.5,
    surfaceInfluence: 0.49,
    atmosphereInfluence: 0.58,
    borderInfluence: 0.34,
    ringInfluence: 0.38,
    linkInfluence: 0.32,
    accentSoftInfluence: 0.46,
    neutralizeAccent: false,
  },
  mono: {
    atmospherePrimaryMix: 0.02,
    surfaceInfluence: 0.52,
    atmosphereInfluence: 0.14,
    borderInfluence: 0.46,
    ringInfluence: 0.14,
    linkInfluence: 0.1,
    accentSoftInfluence: 0.5,
    neutralizeAccent: true,
  },
};
const HARMONY_SURFACE_FACTOR: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 0.88,
  analogous: 0.9,
  complementary: 1.44,
  "split-complementary": 1.14,
  triadic: 1.14,
  tetradic: 1.28,
};
const ACCENT_STYLE_FACTOR: Record<BrandAccentStyle, number> = {
  minimal: 0.74,
  balanced: 1,
  expressive: 1.38,
};
const SOURCE_INTERPRETATION_FACTOR: Record<BrandPaletteSeedSource, number> = {
  manual: 0.72,
  logo: 0.92,
  hero: 1.08,
};
const STUDIO_APPEARANCE_DEFAULTS: StudioAppearanceConfig = {
  mode: "system",
  atmosphere: "bcc",
  harmony: DEFAULT_BRAND_THEME_CONFIG.harmony,
  accentStyle: DEFAULT_BRAND_THEME_CONFIG.accentStyle,
  typography: DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
};

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
function toLinearChannel(value: number) {
  const channel = clamp(value, 0, 255) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}
function getRelativeLuminance(input: RGB) {
  const r = toLinearChannel(input.r);
  const g = toLinearChannel(input.g);
  const b = toLinearChannel(input.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function getContrastRatio(a: RGB, b: RGB) {
  const la = getRelativeLuminance(a);
  const lb = getRelativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
function getSwatchTextColor(background: string) {
  const color = parseColor(background);
  if (!color) return "var(--foreground)";
  const darkRatio = getContrastRatio(color, DARK_SWATCH_TEXT);
  const lightRatio = getContrastRatio(color, LIGHT_SWATCH_TEXT);
  return darkRatio >= lightRatio ? "#0b1220" : "#f8fafc";
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
  paletteId: BrandPaletteKey;
  source: BrandPaletteSeedSource;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
}): BrandSemanticTokens {
  const ratio = clamp(args.modulationPercent / 100, 0, 0.42);
  if (ratio <= 0) return args.tokens;
  const { tokens, presetCore } = args;
  const profile = PRESET_ATMOSPHERE_PROFILES[args.paletteId];
  const sourceFactor = SOURCE_INTERPRETATION_FACTOR[args.source];
  const harmonyFactor = HARMONY_SURFACE_FACTOR[args.harmony];
  const accentFactor = ACCENT_STYLE_FACTOR[args.accentStyle];
  const atmosphereBase = mixColor(
    presetCore.muted,
    presetCore.primary,
    profile.atmospherePrimaryMix
  );
  const surfaceRatio = clamp(
    ratio * profile.surfaceInfluence * sourceFactor * harmonyFactor,
    0,
    0.42
  );
  const atmosphereRatio = clamp(
    ratio * profile.atmosphereInfluence * sourceFactor * harmonyFactor,
    0,
    0.38
  );
  const borderRatio = clamp(ratio * profile.borderInfluence * sourceFactor, 0, 0.2);
  const ringRatio = clamp(
    ratio * profile.ringInfluence * sourceFactor * accentFactor,
    0,
    0.22
  );
  const linkHoverRatio = clamp(
    ratio * profile.linkInfluence * sourceFactor * accentFactor,
    0,
    0.2
  );
  const accentSoftTarget = profile.neutralizeAccent ? tokens.muted : atmosphereBase;
  const accentSoftRatio = clamp(
    ratio * profile.accentSoftInfluence * sourceFactor * accentFactor,
    0,
    0.22
  );
  const accentSoft = mixColor(tokens.accentSoft, accentSoftTarget, accentSoftRatio);
  return {
    ...tokens,
    background: mixColor(tokens.background, presetCore.background, surfaceRatio * 0.72),
    card: mixColor(tokens.card, presetCore.card, surfaceRatio * 0.62),
    muted: mixColor(tokens.muted, presetCore.muted, surfaceRatio * 0.86),
    surface2: mixColor(tokens.surface2, atmosphereBase, atmosphereRatio),
    surface3: mixColor(tokens.surface3, atmosphereBase, atmosphereRatio * 1.06),
    border: mixColor(tokens.border, presetCore.border, borderRatio),
    ring: mixColor(tokens.ring, presetCore.primary, ringRatio),
    accentSoft,
    badgeBg: accentSoft,
    linkHover: mixColor(tokens.linkHover, presetCore.primary, linkHoverRatio),
  };
}
function readActiveBusinessSlug() {
  if (typeof window === "undefined") return "";
  const fromLS = window.localStorage.getItem("bcc:activeBusinessSlug")?.trim() || "";
  if (fromLS) return fromLS;
  const fromEnv =
    typeof process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG === "string"
      ? process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG.trim()
      : "";
  return fromEnv;
}

function formatVaultDate(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function reconcileVaultItemsActiveState(
  items: BrandPresetVaultItem[],
  activeBrandPresetId?: string | null
) {
  const activeId = typeof activeBrandPresetId === "string" ? activeBrandPresetId.trim() : "";
  if (!activeId) return items;
  return items.map((item) => ({
    ...item,
    isActive: item.id === activeId,
  }));
}

function normalizeAssetSearchText(asset: AssetItem) {
  return [
    asset.label,
    asset.key,
    asset.variantKey,
    asset.tags.join(" "),
    asset.allowedIn.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function assetMatchesKind(asset: AssetItem, kind: SourceAssetKind) {
  const text = normalizeAssetSearchText(asset);
  if (kind === "logo") {
    return (
      text.includes("logo") ||
      text.includes("brand.logo.header") ||
      text.includes("brand.logo.footer")
    );
  }
  return text.includes("hero") || text.includes("home.hero.background");
}

function detectAssetContextHint(input: string) {
  const value = input.toLowerCase();
  if (value.includes("barber") || value.includes("barberia") || value.includes("peluquer")) {
    return "barber";
  }
  return "";
}

function rankSourceAsset(asset: AssetItem, kind: SourceAssetKind, contextHint: string) {
  let score = 0;
  if (assetMatchesKind(asset, kind)) score += 120;
  if (kind === "hero" && asset.variantKey === "optimized") score += 45;
  if (kind === "hero" && asset.variantKey === "original") score += 20;
  if (kind === "logo" && (asset.variantKey === "optimized" || asset.variantKey === "original")) {
    score += 25;
  }
  if (asset.pipelineStatus === "ready") score += 15;

  if (contextHint) {
    const text = normalizeAssetSearchText(asset);
    if (text.includes(contextHint)) score += 40;
  }

  const width = Number(asset.width || 0);
  const height = Number(asset.height || 0);
  score += Math.min(12, Math.floor((width * height) / 180000));
  return score;
}

function useBrandScoped(storageKey: string, channel: string, fallback: Brand, enabled: boolean) {
  return useSyncExternalStore(
    (cb) => (enabled ? subscribeBrand(cb, storageKey, channel, fallback) : () => {}),
    () => (enabled ? getBrand(storageKey, channel, fallback) : fallback),
    () => fallback
  );
}

function isSameBrand(a: Brand, b: Brand) {
  return (
    a.brandName === b.brandName &&
    a.palette === b.palette &&
    a.mode === b.mode
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
  const [resolvedSlug, setResolvedSlug] = useState("");
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
  const [sourceAssetKindFilter, setSourceAssetKindFilter] = useState<SourceAssetKind>("hero");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [extractedPalette, setExtractedPalette] = useState<ExtractedPaletteResult | null>(null);
  const [extractError, setExtractError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [savePresetNotice, setSavePresetNotice] = useState("");
  const [presetSummaryPaletteView, setPresetSummaryPaletteView] = useState<"bar" | "pie">("bar");
  const [presetVaultItems, setPresetVaultItems] = useState<BrandPresetVaultItem[]>([]);
  const [presetVaultMode, setPresetVaultMode] = useState<BrandPresetVaultMode>("system");
  const [presetVaultLoading, setPresetVaultLoading] = useState(false);
  const [presetVaultSaving, setPresetVaultSaving] = useState(false);
  const [presetVaultActivatingId, setPresetVaultActivatingId] = useState("");
  const [presetVaultDeletingId, setPresetVaultDeletingId] = useState("");
  const [presetVaultEditingId, setPresetVaultEditingId] = useState("");
  const [presetVaultEditingName, setPresetVaultEditingName] = useState("");
  const [presetVaultError, setPresetVaultError] = useState("");
  const [vaultCollapsed, setVaultCollapsed] = useState(false);
  const [nativeColorPickActive, setNativeColorPickActive] = useState(false);
  const [studioAppearanceConfig, setStudioAppearanceConfig] =
    useState<StudioAppearanceConfig>(STUDIO_APPEARANCE_DEFAULTS);
  const [studioAppearanceLoading, setStudioAppearanceLoading] = useState(false);
  const [studioAppearanceSaving, setStudioAppearanceSaving] = useState(false);
  const [studioAppearanceNotice, setStudioAppearanceNotice] = useState("");
  const [studioAppearanceError, setStudioAppearanceError] = useState("");
  const sourceAssetPickerRef = useRef<HTMLDetailsElement | null>(null);

  const isStudioAppearanceScope = scope === "studio";
  const scopeUsesBusinessSlug = scope === "panel" || scope === "web";
  const canUsePaletteEngine = scope === "system";
  const showLabPreview = scope === "system";
  const effectiveSlug = scopeUsesBusinessSlug ? (businessSlug?.trim() || resolvedSlug) : "";
  const vaultSlug = (businessSlug?.trim() || resolvedSlug).trim();
  const v1BusinessSlug = scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined;
  const runtimeScope: BrandScope = isStudioAppearanceScope ? "studio" : scope;
  const runtimeBusinessSlug = runtimeScope === "web" ? v1BusinessSlug : undefined;
  const skipWebWithoutSlug = scope === "web" && !effectiveSlug;
  const storageKey = getBrandStorageKey(scope, scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined);
  const channel = getBrandChannel(scope, scopeUsesBusinessSlug ? effectiveSlug || undefined : undefined);
  const runtimeChannel = getBrandChannel(runtimeScope, runtimeBusinessSlug);
  const fallback = getDefaultBrandForScope(scope);
  const current = useBrandScoped(storageKey, channel, fallback, !skipWebWithoutSlug);
  const [brand, setBrandLocal] = useState<Brand>(fallback);

  useEffect(() => {
    if (isStudioAppearanceScope) return;
    setBrandLocal((prev) => (isSameBrand(prev, current) ? prev : current));
  }, [current, isStudioAppearanceScope]);
  useEffect(() => {
    if ((!scopeUsesBusinessSlug && !canUsePaletteEngine) || (businessSlug && businessSlug.trim())) return;
    const sync = () => setResolvedSlug(readActiveBusinessSlug());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [scopeUsesBusinessSlug, canUsePaletteEngine, businessSlug]);
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
  const applyStudioAppearanceToLocalState = useCallback(
    (config: StudioAppearanceConfig) => {
      setStudioAppearanceConfig(config);
      setBrandLocal((prev) => ({
        ...prev,
        mode: config.mode,
        palette: config.atmosphere,
      }));
      setPreviewHarmony(config.harmony);
      setPreviewAccentStyle(config.accentStyle);
      setPreviewTypography(config.typography);
    },
    []
  );
  const loadStudioAppearanceConfig = useCallback(async () => {
    if (!isStudioAppearanceScope) return;
    setStudioAppearanceLoading(true);
    setStudioAppearanceError("");
    try {
      const response = await fetch("/api/panel/studio/appearance", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
        | StudioAppearanceResponse
        | null;
      if (!response.ok || !payload || !payload.ok) {
        throw new Error(payload && !payload.ok ? payload.error : "No se pudo cargar Apariencia Studio.");
      }
      applyStudioAppearanceToLocalState(payload.config);
    } catch (error: unknown) {
      setStudioAppearanceError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar Apariencia Studio."
      );
    } finally {
      setStudioAppearanceLoading(false);
    }
  }, [isStudioAppearanceScope, applyStudioAppearanceToLocalState]);
  const persistStudioAppearanceConfig = useCallback(
    async (nextConfig: StudioAppearanceConfig) => {
      if (!isStudioAppearanceScope) return;
      setStudioAppearanceSaving(true);
      setStudioAppearanceNotice("");
      setStudioAppearanceError("");
      try {
        const response = await fetch("/api/panel/studio/appearance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextConfig),
        });
        const payload = (await response.json().catch(() => null)) as
          | StudioAppearanceResponse
          | null;
        if (!response.ok || !payload || !payload.ok) {
          throw new Error(payload && !payload.ok ? payload.error : "No se pudo guardar Apariencia Studio.");
        }
        applyStudioAppearanceToLocalState(payload.config);
        setStudioAppearanceNotice("Apariencia Studio guardada.");
      } catch (error: unknown) {
        setStudioAppearanceError(
          error instanceof Error
            ? error.message
            : "No se pudo guardar Apariencia Studio."
        );
      } finally {
        setStudioAppearanceSaving(false);
      }
    },
    [isStudioAppearanceScope, applyStudioAppearanceToLocalState]
  );
  const updateStudioAppearanceConfig = useCallback(
    (patch: Partial<StudioAppearanceConfig>) => {
      if (!isStudioAppearanceScope) return;
      const nextConfig: StudioAppearanceConfig = {
        ...studioAppearanceConfig,
        ...patch,
      };
      applyStudioAppearanceToLocalState(nextConfig);
      void persistStudioAppearanceConfig(nextConfig);
    },
    [
      isStudioAppearanceScope,
      studioAppearanceConfig,
      applyStudioAppearanceToLocalState,
      persistStudioAppearanceConfig,
    ]
  );
  useEffect(() => {
    if (!isStudioAppearanceScope) return;
    void loadStudioAppearanceConfig();
  }, [isStudioAppearanceScope, loadStudioAppearanceConfig]);

  const selectedVisualAsset = useMemo(() => mediaAssets.find((item) => item._id === selectedVisualAssetId) ?? null, [mediaAssets, selectedVisualAssetId]);
  const assetContextHint = useMemo(
    () => detectAssetContextHint(`${brand.brandName} ${vaultSlug}`),
    [brand.brandName, vaultSlug]
  );
  const filteredSourceAssets = useMemo(() => {
    const imageAssets = mediaAssets.filter((item) => item.kind === "image");
    const ranked = [...imageAssets].sort(
      (a, b) =>
        rankSourceAsset(b, sourceAssetKindFilter, assetContextHint) -
          rankSourceAsset(a, sourceAssetKindFilter, assetContextHint) ||
        Number(new Date(b.updatedAt || b.createdAt || 0)) -
          Number(new Date(a.updatedAt || a.createdAt || 0))
    );
    const scoped = ranked.filter((item) => assetMatchesKind(item, sourceAssetKindFilter));
    return scoped.length > 0 ? scoped : ranked;
  }, [mediaAssets, sourceAssetKindFilter, assetContextHint]);
  const sourceImageUrl = useMemo(() => (paletteSeedSource === "manual" ? "" : selectedVisualAsset?.url || imageUrlInput.trim()), [paletteSeedSource, selectedVisualAsset, imageUrlInput]);
  useEffect(() => {
    if (paletteSeedSource === "hero" || paletteSeedSource === "logo") {
      setSourceAssetKindFilter(paletteSeedSource);
    }
  }, [paletteSeedSource]);
  useEffect(() => {
    if (paletteSeedSource === "manual" || imageUrlInput.trim()) return;
    if (filteredSourceAssets.length === 0) return;
    const selected = mediaAssets.find((item) => item._id === selectedVisualAssetId);
    if (!selected || !assetMatchesKind(selected, sourceAssetKindFilter)) {
      setSelectedVisualAssetId(filteredSourceAssets[0]._id);
    }
  }, [
    paletteSeedSource,
    imageUrlInput,
    filteredSourceAssets,
    mediaAssets,
    selectedVisualAssetId,
    sourceAssetKindFilter,
  ]);
  const paletteSeedInput = useMemo(() => ({ source: paletteSeedSource, primary: paletteSeedPrimary, accent: paletteSeedAccent, neutral: paletteSeedNeutral }), [paletteSeedSource, paletteSeedPrimary, paletteSeedAccent, paletteSeedNeutral]);
  const brandThemeStateV1 = useMemo(
    () =>
      buildBrandThemeStateV1FromEditorInput({
        scope: runtimeScope,
        businessSlug: runtimeBusinessSlug,
        brand,
        seed: {
          source: paletteSeedSource,
          primary: paletteSeedPrimary,
          accent: paletteSeedAccent,
          neutral: paletteSeedNeutral,
          sourceRef: {
            assetId: selectedVisualAssetId,
            imageUrl: sourceImageUrl,
          },
        },
        config: {
          harmony: previewHarmony,
          accentStyle: previewAccentStyle,
          typographyPreset: previewTypography,
          presetModulationPercent: PRESET_MODULATION_PERCENT,
        },
      }),
    [
      runtimeScope,
      runtimeBusinessSlug,
      brand,
      paletteSeedSource,
      paletteSeedPrimary,
      paletteSeedAccent,
      paletteSeedNeutral,
      selectedVisualAssetId,
      sourceImageUrl,
      previewHarmony,
      previewAccentStyle,
      previewTypography,
    ]
  );
  const normalizedPaletteSeed = useMemo(
    () => normalizeBrandPaletteSeed(paletteSeedInput),
    [paletteSeedInput]
  );
  const resolvedMode = resolveBrandThemeMode(brand.mode, { systemModeFallback: "light" });
  const preset = getBrandThemePalettePreset(brand.palette);
  const presetCore = resolvedMode === "dark" ? preset.dark : preset.light;
  const resolvedSeedWithMeta = useMemo(
    () =>
      resolveBrandThemeTokensFromPaletteSeedWithMeta({
        seed: paletteSeedInput,
        mode: brand.mode,
        config: { harmony: previewHarmony, accentStyle: previewAccentStyle, typographyPreset: previewTypography },
        options: { systemModeFallback: "light" },
      }),
    [paletteSeedInput, brand.mode, previewHarmony, previewAccentStyle, previewTypography]
  );
  const resolvedTokensFromSeed = resolvedSeedWithMeta?.tokens ?? null;
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
  const resolvedPaletteSeed =
    resolvedSeedWithMeta?.resolvedSeed ?? normalizedPaletteSeed;
  const isAccentAuto = getSeedChannelMode(paletteSeedAccent) === "auto";
  const isNeutralAuto = getSeedChannelMode(paletteSeedNeutral) === "auto";
  const accentDisplayValue = resolveSeedInputDisplayValue({
    manualValue: paletteSeedAccent,
    resolvedValue: resolvedPaletteSeed?.accent,
    fallbackValue: "#0f62fe",
  });
  const neutralDisplayValue = resolveSeedInputDisplayValue({
    manualValue: paletteSeedNeutral,
    resolvedValue: resolvedPaletteSeed?.neutral,
    fallbackValue: "#e2e8f0",
  });
  const primarySwatchTextColor = getSwatchTextColor(paletteSeedPrimary || "#2563eb");
  const accentSwatchTextColor = getSwatchTextColor(accentDisplayValue);
  const neutralSwatchTextColor = getSwatchTextColor(neutralDisplayValue);
  const effectiveTokens = modulateTokensWithPreset({
    tokens: resolvedTokens,
    presetCore,
    modulationPercent: PRESET_MODULATION_PERCENT,
    paletteId: brand.palette,
    source: paletteSeedSource,
    harmony: previewHarmony,
    accentStyle: previewAccentStyle,
  });
  const previewVariables = useMemo(() => {
    const variables = toBrandCssVariables(effectiveTokens);
    variables["--brand-typography-preset"] = effectiveTokens.typographyPreset;
    variables["--font-sans"] = TYPOGRAPHY_FONT_STACK[effectiveTokens.typographyPreset];
    return variables;
  }, [effectiveTokens]);
  const tokenResolutionSourceLabel = resolvedTokensFromSeed
    ? "palette-seed"
    : "brand-fallback";
  const accentResolutionLabel =
    resolvedSeedWithMeta?.accentSource === "explicit-blend"
      ? "manual + harmony blend"
      : "derived by harmony";
  const loadPresetVault = useCallback(
    async (slugOverride?: string) => {
      if (!canUsePaletteEngine) return;

      const slug = (slugOverride ?? vaultSlug).trim();
      if (!slug) {
        setPresetVaultItems([]);
        setPresetVaultError("");
        return;
      }

      setPresetVaultLoading(true);
      setPresetVaultError("");
      try {
        const response = await fetch(
          `/api/taller/brand-presets?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );
        const payload = (await response.json().catch(() => null)) as BrandPresetVaultResponse | null;
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "No se pudo cargar Preset Vault.");
        }
        const nextItems = Array.isArray(payload.items)
          ? reconcileVaultItemsActiveState(payload.items, payload.activeBrandPresetId)
          : [];
        setPresetVaultItems(nextItems);
        if (payload.mode === "light" || payload.mode === "dark" || payload.mode === "system") {
          setPresetVaultMode(payload.mode);
        }
      } catch (error: unknown) {
        setPresetVaultError(error instanceof Error ? error.message : "No se pudo cargar Preset Vault.");
      } finally {
        setPresetVaultLoading(false);
      }
    },
    [canUsePaletteEngine, vaultSlug]
  );

  useEffect(() => {
    if (!canUsePaletteEngine) return;
    void loadPresetVault(vaultSlug);
  }, [canUsePaletteEngine, vaultSlug, loadPresetVault]);

  useEffect(() => {
    if (skipWebWithoutSlug) return;
    const savedState = saveBrandThemeStateV1Shadow({
      scope: runtimeScope,
      businessSlug: runtimeBusinessSlug,
      state: brandThemeStateV1,
    });

    if (!savedState || typeof window === "undefined" || runtimeScope === "system") return;

    window.dispatchEvent(new Event(runtimeChannel));

    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(runtimeChannel);
      bc.postMessage({ type: "brand-theme:v1-shadow-update" });
      bc.close();
    }
  }, [
    skipWebWithoutSlug,
    runtimeScope,
    runtimeBusinessSlug,
    brandThemeStateV1,
    runtimeChannel,
  ]);

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
        paletteId: paletteOption.key,
        source: paletteSeedSource,
        harmony: previewHarmony,
        accentStyle: previewAccentStyle,
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
    previewHarmony,
    previewAccentStyle,
    previewTypography,
    paletteSeedSource,
    resolvedTokensFromSeed,
    resolvedTokens,
    effectiveTokens,
  ]);

  function update(next: Brand) {
    setBrandLocal(next);
    if (skipWebWithoutSlug) return;
    persistLegacyAndBrandThemeShadow({
      persistLegacy: () =>
        setBrand(next, storageKey, channel, fallback, {
          applyToDocument: scope === "panel" || scope === "studio",
        }),
      persistShadow: () =>
        saveBrandThemeStateV1Shadow({
          scope: runtimeScope,
          businessSlug: runtimeBusinessSlug,
          state: buildBrandThemeStateV1FromEditorInput({
            scope: runtimeScope,
            businessSlug: runtimeBusinessSlug,
            brand: next,
            seed: {
              source: paletteSeedSource,
              primary: paletteSeedPrimary,
              accent: paletteSeedAccent,
              neutral: paletteSeedNeutral,
              sourceRef: {
                assetId: selectedVisualAssetId,
                imageUrl: sourceImageUrl,
              },
            },
            config: {
              harmony: previewHarmony,
              accentStyle: previewAccentStyle,
              typographyPreset: previewTypography,
              presetModulationPercent: PRESET_MODULATION_PERCENT,
            },
          }),
        }),
    });
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
  async function savePresetStub() {
    if (!canUsePaletteEngine) {
      setSavePresetNotice("El guardado de presets esta disponible en Brand Lab.");
      return;
    }
    if (!vaultSlug) {
      setSavePresetNotice("Selecciona un negocio activo antes de guardar presets.");
      return;
    }

    const sourceMode: "manual" | "logo" | "hybrid" =
      paletteSeedSource === "manual"
        ? "manual"
        : paletteSeedSource === "logo"
          ? "logo"
          : "hybrid";
    const generatedName = "BCC Studio Brand Lab";
    const neutralToken = resolvedPaletteSeed?.neutral || neutralDisplayValue || "#94a3b8";

    setPresetVaultSaving(true);
    setPresetVaultError("");
    setSavePresetNotice("");
    try {
      const response = await fetch("/api/taller/brand-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: vaultSlug,
          name: generatedName,
          description: `Source ${sourceMode} - ${HARMONY_LABELS[previewHarmony]} - ${ACCENT_STYLE_LABELS[previewAccentStyle]}`,
          isActive: false,
          sourceMode,
          harmony: previewHarmony,
          accentStyle: previewAccentStyle,
          typography: previewTypography,
          tokens: {
            primary: effectiveTokens.primary,
            accent: effectiveTokens.accent,
            neutral: neutralToken,
            background: effectiveTokens.background,
            card: effectiveTokens.card,
            surface2: effectiveTokens.surface2,
            surface3: effectiveTokens.surface3,
            link: effectiveTokens.link,
            border: effectiveTokens.border,
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as BrandPresetVaultResponse | null;
      if (!response.ok || !payload?.ok || !payload.item) {
        throw new Error(payload?.error || "No se pudo guardar el preset.");
      }

      setSavePresetNotice(`Preset guardado: ${payload.item.name}`);
      if (Array.isArray(payload.items)) {
        setPresetVaultItems(
          reconcileVaultItemsActiveState(payload.items, payload.activeBrandPresetId)
        );
      } else {
        await loadPresetVault(vaultSlug);
      }
      if (payload.mode === "light" || payload.mode === "dark" || payload.mode === "system") {
        setPresetVaultMode(payload.mode);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el preset.";
      setPresetVaultError(message);
      setSavePresetNotice(message);
    } finally {
      setPresetVaultSaving(false);
    }
  }

  async function activatePresetFromVault(presetId: string) {
    if (!canUsePaletteEngine || !vaultSlug || !presetId) return;

    setPresetVaultActivatingId(presetId);
    setPresetVaultError("");
    setSavePresetNotice("");
    try {
      const response = await fetch("/api/taller/brand-presets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: vaultSlug,
          presetId,
        }),
      });
      const payload = (await response.json().catch(() => null)) as BrandPresetVaultResponse | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo activar el preset.");
      }
      if (Array.isArray(payload.items)) {
        setPresetVaultItems(
          reconcileVaultItemsActiveState(payload.items, payload.activeBrandPresetId)
        );
      } else {
        await loadPresetVault(vaultSlug);
      }
      if (payload.mode === "light" || payload.mode === "dark" || payload.mode === "system") {
        setPresetVaultMode(payload.mode);
      }
      const activeName = payload.item?.name || "Preset actualizado";
      setSavePresetNotice(`Preset activo: ${activeName}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No se pudo activar el preset.";
      setPresetVaultError(message);
      setSavePresetNotice(message);
    } finally {
      setPresetVaultActivatingId("");
    }
  }

  function beginRenamePresetFromVault(item: BrandPresetVaultItem) {
    setPresetVaultEditingId(item.id);
    setPresetVaultEditingName(item.name);
  }

  function cancelRenamePresetFromVault() {
    setPresetVaultEditingId("");
    setPresetVaultEditingName("");
  }

  async function savePresetNameFromVault(presetId: string) {
    if (!canUsePaletteEngine || !vaultSlug || !presetId) return;

    const nextName = presetVaultEditingName.trim();
    if (!nextName) {
      setPresetVaultError("El nombre del preset no puede estar vacio.");
      return;
    }

    setPresetVaultSaving(true);
    setPresetVaultError("");
    setSavePresetNotice("");
    try {
      const response = await fetch("/api/taller/brand-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: vaultSlug,
          id: presetId,
          name: nextName,
        }),
      });
      const payload = (await response.json().catch(() => null)) as BrandPresetVaultResponse | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo renombrar el preset.");
      }

      if (Array.isArray(payload.items)) {
        setPresetVaultItems(
          reconcileVaultItemsActiveState(payload.items, payload.activeBrandPresetId)
        );
      } else {
        await loadPresetVault(vaultSlug);
      }
      setSavePresetNotice(`Nombre actualizado: ${nextName}`);
      cancelRenamePresetFromVault();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo renombrar el preset.";
      setPresetVaultError(message);
      setSavePresetNotice(message);
    } finally {
      setPresetVaultSaving(false);
    }
  }

  async function deletePresetFromVault(item: BrandPresetVaultItem, forceIfActive = false) {
    if (!canUsePaletteEngine || !vaultSlug) return;
    if (typeof window === "undefined") return;

    if (!forceIfActive) {
      const confirmDelete = window.confirm(
        `Eliminar preset "${item.name}"? Esta accion no se puede deshacer.`
      );
      if (!confirmDelete) return;
    }

    setPresetVaultDeletingId(item.id);
    setPresetVaultError("");
    setSavePresetNotice("");
    try {
      const response = await fetch("/api/taller/brand-presets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: vaultSlug,
          presetId: item.id,
          forceIfActive,
        }),
      });
      const payload = (await response.json().catch(() => null)) as BrandPresetVaultResponse | null;

      if (
        !forceIfActive &&
        response.status === 409 &&
        payload &&
        !payload.ok &&
        payload.requiresForceDelete
      ) {
        const confirmActiveDelete = window.confirm(
          "Este preset está activo. ¿Deseas continuar?"
        );
        if (confirmActiveDelete) {
          await deletePresetFromVault(item, true);
        }
        return;
      }

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo eliminar el preset.");
      }

      if (Array.isArray(payload.items)) {
        setPresetVaultItems(
          reconcileVaultItemsActiveState(payload.items, payload.activeBrandPresetId)
        );
      } else {
        await loadPresetVault(vaultSlug);
      }
      if (payload.mode === "light" || payload.mode === "dark" || payload.mode === "system") {
        setPresetVaultMode(payload.mode);
      }

      const noticeParts = [`Preset eliminado: ${item.name}`];
      if (payload.wasActive) noticeParts.push("(era el activo)");
      if (payload.heroReferenceWarning) {
        noticeParts.push("Aviso: revisa Hero publicado/draft tras este cambio.");
      }
      setSavePresetNotice(noticeParts.join(" "));

      if (presetVaultEditingId === item.id) {
        cancelRenamePresetFromVault();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el preset.";
      setPresetVaultError(message);
      setSavePresetNotice(message);
    } finally {
      setPresetVaultDeletingId("");
    }
  }

  function applyVaultPresetToHero(vaultItem: BrandPresetVaultItem) {
    const heroInput = mapVaultPresetToHeroInput(vaultItem);
    console.log("[BrandLab] Hero prefill input", {
      presetId: vaultItem.id,
      presetName: vaultItem.name,
      heroInput,
    });
    setSavePresetNotice(`Prefill Hero generado desde: ${vaultItem.name}`);
  }
  function selectSourceAssetFromPicker(assetId: string) {
    setSelectedVisualAssetId(assetId);
    setImageUrlInput("");
    if (sourceAssetPickerRef.current) {
      sourceAssetPickerRef.current.open = false;
    }
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
  function handleNativeColorPickStart() {
    setNativeColorPickActive(true);
    if (sourceAssetPickerRef.current) {
      sourceAssetPickerRef.current.open = false;
    }
  }
  function handleNativeColorPickEnd() {
    setNativeColorPickActive(false);
  }

  if (skipWebWithoutSlug) {
    return (
      <section className="w-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">Apariencia web pública</h1>
        <p className="mt-2 text-sm text-muted-foreground">No hay negocio activo para scope web.</p>
      </section>
    );
  }

  const presetSummarySegments: Array<{ label: string; value: string }> = [
    { label: "Primary", value: effectiveTokens.primary },
    { label: "Accent", value: effectiveTokens.accent },
    { label: "Neutral", value: resolvedPaletteSeed?.neutral || neutralDisplayValue },
    { label: "Background", value: effectiveTokens.background },
    { label: "Card", value: effectiveTokens.card },
    { label: "Surface 2", value: effectiveTokens.surface2 },
    { label: "Surface 3", value: effectiveTokens.surface3 },
  ];
  const presetIdentityTokens: Array<{ label: string; value: string }> = [
    { label: "Background", value: effectiveTokens.background },
    { label: "Card", value: effectiveTokens.card },
    { label: "Surface 2", value: effectiveTokens.surface2 },
    { label: "Surface 3", value: effectiveTokens.surface3 },
    { label: "Link", value: effectiveTokens.link },
    { label: "Border", value: effectiveTokens.border },
  ];
  const presetSummaryStatusLabel = savePresetNotice ? "Saved" : "Draft";
  const presetSummarySlug = effectiveSlug || "system";
  const presetSummaryPieStops = presetSummarySegments
    .map((segment, index) => {
      const start = (index * 100) / presetSummarySegments.length;
      const end = ((index + 1) * 100) / presetSummarySegments.length;
      return `${segment.value} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    })
    .join(", ");
  const shouldShowPaletteProposalRow =
    canUsePaletteEngine && paletteSeedSource !== "manual";

  return (
    <section className="w-full max-w-none">
      <div className="rounded-2xl border border-border/35 p-4 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--background)_92%,var(--surface-2,var(--card)))] dark:[background:var(--background)] sm:p-6">
        <header>
          <h1 className="text-xl font-semibold">{scope === "system" ? "Brand Lab (Taller / Capa 1)" : "Apariencia"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {scope === "system"
              ? "Laboratorio visual para decisiones cromáticas con preview local aislada."
              : scope === "studio"
                ? "Apariencia Studio (no afecta a clientes)."
                : "Editor de apariencia por scope."}
          </p>
        </header>

        {showLabPreview ? (
          <section className="mt-4 rounded-xl border border-border/40 p-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] [background:var(--background)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Diagnóstico local</p>
                <p className="text-xs text-muted-foreground">ON/OFF por pestaña. Sin persistencia global.</p>
                <p className="text-[11px] text-muted-foreground">
                  El preview principal siempre usa output técnico final. ON añade capas auxiliares de diagnóstico.
                </p>
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

        <div className="mt-3 grid gap-3">
          <div
            className={
              showLabPreview
                ? "grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]"
                : "grid min-w-0 gap-3"
            }
          >
            <div className="grid min-w-0 gap-2.5">
              {showLabPreview && canUsePaletteEngine ? (
            <section className="flex h-full flex-col rounded-xl border border-border/40 p-3 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.4)] [background:var(--background)]">
              <h2 className="text-base font-semibold text-foreground">A. Fuente visual</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Estado: {paletteSeedSource === "manual" ? "Manual" : sourceImageUrl ? "Fuente activa" : "Sin fuente seleccionada"}.</p>
              <div className="mt-2 grid gap-1.5">
                <select value={paletteSeedSource} onChange={(e) => setPaletteSeedSource(e.target.value as BrandPaletteSeedSource)} className="h-9 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground shadow-[0_8px_16px_-16px_rgba(15,23,42,0.38)]">{Object.entries(PALETTE_SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <div className="grid grid-cols-1 gap-1.5">
                  {paletteSeedSource === "manual" ? (
                    <div className="grid h-9 place-items-center rounded-lg border border-border/55 bg-background px-3 text-xs text-muted-foreground">
                      Modo manual activo
                    </div>
                  ) : (
                    <details
                      ref={sourceAssetPickerRef}
                      className={[
                        "relative min-w-0",
                        mediaLoading ? "pointer-events-none opacity-60" : "",
                      ].join(" ")}
                    >
                      <summary className="flex h-9 min-w-0 cursor-pointer list-none items-center rounded-lg border border-border/55 bg-background px-2.5 text-sm text-foreground shadow-[0_8px_16px_-16px_rgba(15,23,42,0.38)] [&::-webkit-details-marker]:hidden">
                        {selectedVisualAsset ? (
                          <span className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                            <span className="h-6 w-9 overflow-hidden rounded border border-border/60 bg-muted/30">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={selectedVisualAsset.url} alt={selectedVisualAsset.label} className="h-full w-full object-cover" />
                            </span>
                            <span className="truncate text-sm">
                              {selectedVisualAsset.label} · {selectedVisualAsset.variantKey}
                            </span>
                          </span>
                        ) : (
                          <span className="truncate">
                            {mediaLoading ? "Cargando assets..." : "Seleccionar asset"}
                          </span>
                        )}
                      </summary>
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-y-auto rounded-lg border border-border/60 bg-background/98 p-1 shadow-[0_14px_28px_-20px_rgba(15,23,42,0.55)]">
                        {filteredSourceAssets.length === 0 ? (
                          <p className="px-2 py-2 text-xs text-muted-foreground">
                            No hay assets disponibles para este filtro.
                          </p>
                        ) : (
                          filteredSourceAssets.map((asset) => (
                            <button
                              key={asset._id}
                              type="button"
                              onClick={() => selectSourceAssetFromPicker(asset._id)}
                              className={[
                                "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-1.5 text-left transition",
                                selectedVisualAssetId === asset._id
                                  ? "bg-primary/[0.08]"
                                  : "hover:bg-muted/55",
                              ].join(" ")}
                            >
                              <span className="h-6 w-9 overflow-hidden rounded border border-border/60 bg-muted/30">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={asset.url} alt={asset.label} className="h-full w-full object-cover" />
                              </span>
                              <span className="min-w-0">
                                <p className="truncate text-xs font-medium text-foreground">{asset.label}</p>
                                <p className="truncate text-[10px] text-muted-foreground">{asset.variantKey}</p>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </details>
                  )}
                </div>
                <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} disabled={paletteSeedSource === "manual"} placeholder={paletteSeedSource === "manual" ? "Modo manual activo" : "https://..."} className="h-9 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_8px_16px_-16px_rgba(15,23,42,0.38)] disabled:opacity-60" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button type="button" onClick={runExtraction} disabled={paletteSeedSource === "manual" || !sourceImageUrl || extracting} className="h-9 rounded-lg border border-primary/40 bg-primary/90 px-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_18px_-14px_rgba(37,99,235,0.5)] transition hover:bg-primary disabled:opacity-60">{extracting ? "Extrayendo..." : "Extraer paleta"}</button>
                <button type="button" onClick={clearVisualSource} className="h-9 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-16px_rgba(15,23,42,0.4)] transition hover:bg-muted">Limpiar fuente</button>
              </div>
              {extractError ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{extractError}</p> : null}
              {mediaError ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{mediaError}</p> : null}
              {paletteSeedSource === "manual" ? (
                <div className="mt-2 min-w-0 rounded-lg border border-dashed border-border/55 p-2.5 [background:color-mix(in_oklab,var(--surface-3,var(--card))_88%,white)]">
                  <p className="text-xs font-semibold text-foreground">Selección manual de paleta</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    En modo manual trabajas directamente sobre primary, accent y neutral.
                  </p>
                  <div className="mt-2 grid gap-1.5">
                    <div className="rounded-md border border-primary/35 bg-primary/[0.08] p-1.5">
                      <div className="mb-0.5 flex flex-wrap items-center justify-between gap-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Primary</p>
                        <p className="text-[10px] text-muted-foreground">Color base del sistema</p>
                      </div>
                      <label className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-border/60 bg-background/85 p-1.5">
                        <input
                          type="color"
                          value={paletteSeedPrimary || "#2563eb"}
                          onPointerDown={handleNativeColorPickStart}
                          onFocus={handleNativeColorPickStart}
                          onBlur={handleNativeColorPickEnd}
                          onChange={(e) => {
                            setPaletteSeedPrimary(e.target.value);
                            handleNativeColorPickEnd();
                          }}
                          className="h-8 w-9 shrink-0 rounded-md border border-border/70 bg-background p-1"
                        />
                        <input value={paletteSeedPrimary} onChange={(e) => setPaletteSeedPrimary(e.target.value)} className="h-8 w-full min-w-0 rounded-md border border-border/70 bg-background px-2 font-mono text-xs text-foreground" />
                      </label>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Accent</p>
                      <label className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/55 bg-background/70 p-2">
                        <input
                          type="color"
                          value={accentDisplayValue}
                          onPointerDown={handleNativeColorPickStart}
                          onFocus={handleNativeColorPickStart}
                          onBlur={handleNativeColorPickEnd}
                          onChange={(e) => {
                            setPaletteSeedAccent(e.target.value);
                            handleNativeColorPickEnd();
                          }}
                          className="h-8 w-9 shrink-0 rounded-md border border-border/70 bg-background p-1"
                        />
                        <input
                          value={accentDisplayValue}
                          onChange={(e) => setPaletteSeedAccent(e.target.value)}
                          readOnly={isAccentAuto}
                          aria-readonly={isAccentAuto}
                          title={isAccentAuto ? "Valor derivado automáticamente" : undefined}
                          className={[
                            "h-8 w-full min-w-0 rounded-md border border-border/70 px-2 font-mono text-xs",
                            isAccentAuto
                              ? "bg-muted/45 text-muted-foreground"
                              : "bg-background text-foreground",
                          ].join(" ")}
                        />
                        <button type="button" onClick={() => setPaletteSeedAccent("")} className="h-8 shrink-0 whitespace-nowrap rounded-md border border-border/70 bg-background px-2 text-[11px] font-semibold text-foreground">Auto</button>
                      </label>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Neutral</p>
                      <label className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/55 bg-background/70 p-2">
                        <input
                          type="color"
                          value={neutralDisplayValue}
                          onPointerDown={handleNativeColorPickStart}
                          onFocus={handleNativeColorPickStart}
                          onBlur={handleNativeColorPickEnd}
                          onChange={(e) => {
                            setPaletteSeedNeutral(e.target.value);
                            handleNativeColorPickEnd();
                          }}
                          className="h-8 w-9 shrink-0 rounded-md border border-border/70 bg-background p-1"
                        />
                        <input
                          value={neutralDisplayValue}
                          onChange={(e) => setPaletteSeedNeutral(e.target.value)}
                          readOnly={isNeutralAuto}
                          aria-readonly={isNeutralAuto}
                          title={isNeutralAuto ? "Valor derivado automáticamente" : undefined}
                          className={[
                            "h-8 w-full min-w-0 rounded-md border border-border/70 px-2 font-mono text-xs",
                            isNeutralAuto
                              ? "bg-muted/45 text-muted-foreground"
                              : "bg-background text-foreground",
                          ].join(" ")}
                        />
                        <button type="button" onClick={() => setPaletteSeedNeutral("")} className="h-8 shrink-0 whitespace-nowrap rounded-md border border-border/70 bg-background px-2 text-[11px] font-semibold text-foreground">Auto</button>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 overflow-hidden rounded-lg border border-dashed border-border/55 p-1.5 [background:color-mix(in_oklab,var(--surface-3,var(--card))_88%,white)]">
                  {sourceImageUrl ? (
                    <div className="aspect-[16/10] w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sourceImageUrl}
                        alt="Fuente visual seleccionada"
                        className="h-full w-full rounded-md object-contain"
                      />
                    </div>
                  ) : (
                    <div className="grid aspect-[16/10] w-full place-items-center">
                      <p className="px-2 text-center text-xs text-muted-foreground">Sin imagen seleccionada.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
              ) : null}

              {canUsePaletteEngine && (!showLabPreview || shouldShowPaletteProposalRow) ? (
                <section className="rounded-xl border border-primary/30 p-2.5 shadow-[0_12px_20px_-20px_rgba(37,99,235,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_84%,var(--background))]">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                    <h2 className="text-base font-semibold text-foreground">B. Paleta propuesta</h2>
                    <span className="rounded-full border border-primary/30 bg-primary/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                      Bloque principal
                    </span>
                  </div>
                  <div className="grid min-w-0 gap-1.5 md:grid-cols-3">
                    <div className="min-w-0 rounded-lg border border-border/45 p-2 shadow-[0_8px_16px_-16px_rgba(15,23,42,0.35)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_86%,white)]">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          Primary
                        </span>
                      </div>
                      <div className="relative w-full overflow-hidden rounded-md border border-border/60" style={{ backgroundColor: paletteSeedPrimary || "#2563eb" }}>
                        <input
                          type="color"
                          value={paletteSeedPrimary || "#2563eb"}
                          onPointerDown={handleNativeColorPickStart}
                          onFocus={handleNativeColorPickStart}
                          onBlur={handleNativeColorPickEnd}
                          onChange={(e) => {
                            setPaletteSeedPrimary(e.target.value);
                            handleNativeColorPickEnd();
                          }}
                          className="absolute right-1 top-1 z-10 h-6 w-8 shrink-0 cursor-pointer rounded border border-black/25 bg-white/55 p-0.5"
                        />
                        <input value={paletteSeedPrimary} onChange={(e) => setPaletteSeedPrimary(e.target.value)} className="h-9 w-full border-0 bg-transparent px-2 pr-10 pt-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide placeholder:opacity-70 focus:outline-none focus:ring-0" style={{ color: primarySwatchTextColor }} />
                      </div>
                    </div>
                    <div className="min-w-0 rounded-lg border border-border/45 p-2 shadow-[0_8px_16px_-16px_rgba(15,23,42,0.35)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_86%,white)]">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          Accent
                        </span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setPaletteSeedAccent("")} className="h-6 shrink-0 whitespace-nowrap rounded-md border border-border/70 bg-background px-2 text-[10px] font-semibold text-foreground">Auto</button>
                        </div>
                      </div>
                      <div className="relative w-full overflow-hidden rounded-md border border-border/60" style={{ backgroundColor: accentDisplayValue }}>
                        <input
                          type="color"
                          value={accentDisplayValue}
                          onPointerDown={handleNativeColorPickStart}
                          onFocus={handleNativeColorPickStart}
                          onBlur={handleNativeColorPickEnd}
                          onChange={(e) => {
                            setPaletteSeedAccent(e.target.value);
                            handleNativeColorPickEnd();
                          }}
                          className="absolute right-1 top-1 z-10 h-6 w-8 shrink-0 cursor-pointer rounded border border-black/25 bg-white/55 p-0.5"
                        />
                        <input
                          value={accentDisplayValue}
                          onChange={(e) => setPaletteSeedAccent(e.target.value)}
                          readOnly={isAccentAuto}
                          aria-readonly={isAccentAuto}
                          title={isAccentAuto ? "Valor derivado automáticamente" : undefined}
                          className={[
                            "h-9 w-full border-0 bg-transparent px-2 pr-10 pt-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-0",
                            isAccentAuto ? "cursor-default opacity-90" : "",
                          ].join(" ")}
                          style={{ color: accentSwatchTextColor }}
                        />
                      </div>
                    </div>
                    <div className="min-w-0 rounded-lg border border-border/45 p-2 shadow-[0_8px_16px_-16px_rgba(15,23,42,0.35)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_86%,white)]">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          Neutral
                        </span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setPaletteSeedNeutral("")} className="h-6 shrink-0 whitespace-nowrap rounded-md border border-border/70 bg-background px-2 text-[10px] font-semibold text-foreground">Auto</button>
                        </div>
                      </div>
                      <div className="relative w-full overflow-hidden rounded-md border border-border/60" style={{ backgroundColor: neutralDisplayValue }}>
                        <input
                          type="color"
                          value={neutralDisplayValue}
                          onPointerDown={handleNativeColorPickStart}
                          onFocus={handleNativeColorPickStart}
                          onBlur={handleNativeColorPickEnd}
                          onChange={(e) => {
                            setPaletteSeedNeutral(e.target.value);
                            handleNativeColorPickEnd();
                          }}
                          className="absolute right-1 top-1 z-10 h-6 w-8 shrink-0 cursor-pointer rounded border border-black/25 bg-white/55 p-0.5"
                        />
                        <input
                          value={neutralDisplayValue}
                          onChange={(e) => setPaletteSeedNeutral(e.target.value)}
                          readOnly={isNeutralAuto}
                          aria-readonly={isNeutralAuto}
                          title={isNeutralAuto ? "Valor derivado automáticamente" : undefined}
                          className={[
                            "h-9 w-full border-0 bg-transparent px-2 pr-10 pt-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-0",
                            isNeutralAuto ? "cursor-default opacity-90" : "",
                          ].join(" ")}
                          style={{ color: neutralSwatchTextColor }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              <section
                className={[
                  "rounded-xl border border-border/42 p-2.5 shadow-[0_10px_20px_-20px_rgba(15,23,42,0.35)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_68%,var(--background))] dark:border-border/45 dark:[background:color-mix(in_oklab,var(--background)_89%,var(--surface-2,var(--card)))] transition-opacity duration-150",
                  nativeColorPickActive ? "pointer-events-none opacity-0" : "opacity-100",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-1.5">
                  <h2 className="text-base font-semibold text-foreground">C. Composición y contexto</h2>
                  <p className="text-[10px] text-muted-foreground sm:text-right">
                    Contexto: <span className="font-medium text-foreground/80">{brand.brandName || "Sin nombre"}</span>
                  </p>
                </div>
                <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                  <label className="grid min-w-0 gap-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Mode</span>
                    <select
                      value={isStudioAppearanceScope ? studioAppearanceConfig.mode : brand.mode}
                      onChange={(e) => {
                        const mode = e.target.value as BrandMode;
                        if (isStudioAppearanceScope) {
                          updateStudioAppearanceConfig({ mode });
                          return;
                        }
                        update({ ...brand, mode });
                      }}
                      className="h-8 w-full min-w-0 rounded-md border border-border/40 px-2 text-[11px] text-foreground shadow-[0_8px_12px_-16px_rgba(15,23,42,0.3)] [background:color-mix(in_oklab,var(--background)_88%,var(--surface-3,var(--card)))] dark:border-border/45 dark:[background:color-mix(in_oklab,var(--background)_84%,var(--surface-2,var(--card)))]"
                    >
                      {MODES.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {isStudioAppearanceScope ? "Atmosphere" : "Preset palette"}
                    </span>
                    <select
                      value={
                        isStudioAppearanceScope
                          ? studioAppearanceConfig.atmosphere
                          : brand.palette
                      }
                      onChange={(e) => {
                        const atmosphere = e.target.value as BrandPaletteKey;
                        if (isStudioAppearanceScope) {
                          updateStudioAppearanceConfig({ atmosphere });
                          return;
                        }
                        update({ ...brand, palette: atmosphere });
                      }}
                      className="h-8 w-full min-w-0 rounded-md border border-border/40 px-2 text-[11px] text-foreground shadow-[0_8px_12px_-16px_rgba(15,23,42,0.3)] [background:color-mix(in_oklab,var(--background)_88%,var(--surface-3,var(--card)))] dark:border-border/45 dark:[background:color-mix(in_oklab,var(--background)_84%,var(--surface-2,var(--card)))]"
                    >
                      {BRAND_PALETTES.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.key === "bcc" ? "System" : item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Harmony</span>
                    <select
                      value={
                        isStudioAppearanceScope
                          ? studioAppearanceConfig.harmony
                          : previewHarmony
                      }
                      onChange={(e) => {
                        const harmony = e.target.value as BrandHarmonyStrategy;
                        if (isStudioAppearanceScope) {
                          updateStudioAppearanceConfig({ harmony });
                          return;
                        }
                        setPreviewHarmony(harmony);
                      }}
                      className="h-8 w-full min-w-0 rounded-md border border-border/40 px-2 text-[11px] text-foreground shadow-[0_8px_12px_-16px_rgba(15,23,42,0.3)] [background:color-mix(in_oklab,var(--background)_88%,var(--surface-3,var(--card)))] dark:border-border/45 dark:[background:color-mix(in_oklab,var(--background)_84%,var(--surface-2,var(--card)))]"
                    >
                      {BRAND_THEME_HARMONY_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {HARMONY_LABELS[item]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Accent style</span>
                    <select
                      value={
                        isStudioAppearanceScope
                          ? studioAppearanceConfig.accentStyle
                          : previewAccentStyle
                      }
                      onChange={(e) => {
                        const accentStyle = e.target.value as BrandAccentStyle;
                        if (isStudioAppearanceScope) {
                          updateStudioAppearanceConfig({ accentStyle });
                          return;
                        }
                        setPreviewAccentStyle(accentStyle);
                      }}
                      className="h-8 w-full min-w-0 rounded-md border border-border/40 px-2 text-[11px] text-foreground shadow-[0_8px_12px_-16px_rgba(15,23,42,0.3)] [background:color-mix(in_oklab,var(--background)_88%,var(--surface-3,var(--card)))] dark:border-border/45 dark:[background:color-mix(in_oklab,var(--background)_84%,var(--surface-2,var(--card)))]"
                    >
                      {BRAND_THEME_ACCENT_STYLE_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {ACCENT_STYLE_LABELS[item]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Typography</span>
                    <select
                      value={
                        isStudioAppearanceScope
                          ? studioAppearanceConfig.typography
                          : previewTypography
                      }
                      onChange={(e) => {
                        const typography = e.target.value as BrandTypographyPreset;
                        if (isStudioAppearanceScope) {
                          updateStudioAppearanceConfig({ typography });
                          return;
                        }
                        setPreviewTypography(typography);
                      }}
                      className="h-8 w-full min-w-0 rounded-md border border-border/40 px-2 text-[11px] text-foreground shadow-[0_8px_12px_-16px_rgba(15,23,42,0.3)] [background:color-mix(in_oklab,var(--background)_88%,var(--surface-3,var(--card)))] dark:border-border/45 dark:[background:color-mix(in_oklab,var(--background)_84%,var(--surface-2,var(--card)))]"
                    >
                      {BRAND_THEME_TYPOGRAPHY_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {TYPOGRAPHY_LABELS[item]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {isStudioAppearanceScope ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Apariencia Studio (no afecta a clientes).
                    {studioAppearanceLoading ? " Cargando..." : ""}
                    {studioAppearanceSaving ? " Guardando..." : ""}
                    {studioAppearanceNotice ? ` ${studioAppearanceNotice}` : ""}
                    {studioAppearanceError ? ` ${studioAppearanceError}` : ""}
                  </p>
                ) : null}
              </section>
            </div>

            {showLabPreview ? (
              <div className="min-w-0 xl:col-start-2">
                <BrandThemePreviewSurface previewEnabled={previewEnabled} harmony={previewHarmony} accentStyle={previewAccentStyle} typographyPreset={previewTypography} showCompositionPanel={canUsePaletteEngine} modeLabel={resolvedMode} paletteLabel={preset.label} presetRoleLabel="La seed manda identidad. Preset modula superficies y atmósfera." presetModulationPercent={PRESET_MODULATION_PERCENT} previewVariables={previewVariables} resolvedTokens={effectiveTokens} />
              </div>
            ) : null}
          </div>

        </div>

        {canUsePaletteEngine ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.45fr)_minmax(240px,0.95fr)]">
            <section className="rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
              <h3 className="text-sm font-semibold text-foreground">Input base (seed resuelta)</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Source: {PALETTE_SOURCE_LABELS[paletteSeedSource]} · Accent: {accentResolutionLabel}.
              </p>
              <div className="mt-2 grid gap-2">
                {resolvedPaletteSeed ? (
                  [{ label: "Primary", value: resolvedPaletteSeed.primary }, { label: "Accent", value: resolvedPaletteSeed.accent }, { label: "Neutral", value: resolvedPaletteSeed.neutral }].map((item) => (
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
              <h3 className="text-sm font-semibold text-foreground">Output técnico final (tokens)</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Cadena: Input base {"->"} Transformación {"->"} Output técnico {"->"} Preview diagnóstica.
              </p>
              <section className="mt-2 rounded-md border border-border/55 bg-background/75 p-2 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground">Preset summary</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {preset.label} - {brand.brandName || "Sin nombre"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                      {presetSummaryStatusLabel}
                    </span>
                    <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Mode: {resolvedMode}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Slug: <span className="font-medium text-foreground/85">{presetSummarySlug}</span>
                </p>
                <div className="mt-2 inline-flex rounded-md border border-border/60 bg-background/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPresetSummaryPaletteView("bar")}
                    aria-pressed={presetSummaryPaletteView === "bar"}
                    className={[
                      "h-7 rounded px-2 text-[11px] font-semibold transition",
                      presetSummaryPaletteView === "bar"
                        ? "bg-primary/90 text-primary-foreground shadow-[0_8px_16px_-14px_rgba(37,99,235,0.55)]"
                        : "text-muted-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    Barra
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetSummaryPaletteView("pie")}
                    aria-pressed={presetSummaryPaletteView === "pie"}
                    className={[
                      "h-7 rounded px-2 text-[11px] font-semibold transition",
                      presetSummaryPaletteView === "pie"
                        ? "bg-primary/90 text-primary-foreground shadow-[0_8px_16px_-14px_rgba(37,99,235,0.55)]"
                        : "text-muted-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    Pastel
                  </button>
                </div>
                {presetSummaryPaletteView === "bar" ? (
                  <div className="mt-2 grid min-w-0 grid-cols-7 overflow-hidden rounded-md border border-border/55 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
                    {presetSummarySegments.map((segment) => (
                      <span
                        key={segment.label}
                        title={`${segment.label}: ${segment.value}`}
                        className="h-5 min-w-0 border-r border-border/35 last:border-r-0"
                        style={{ backgroundColor: segment.value }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                    <div
                      className="h-24 w-24 rounded-full border border-border/60 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.55)]"
                      style={{ backgroundImage: `conic-gradient(${presetSummaryPieStops})` }}
                    />
                    <div className="grid min-w-0 grid-cols-2 gap-1">
                      {presetSummarySegments.map((segment) => (
                        <div
                          key={`${segment.label}-legend`}
                          className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-1 rounded border border-border/50 bg-background/80 px-1.5 py-1"
                        >
                          <span
                            className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full border border-border/60"
                            style={{ backgroundColor: segment.value }}
                          />
                          <p title={`${segment.label}: ${segment.value}`} className="truncate text-[10px] text-muted-foreground">
                            {segment.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-foreground">
                    Harmony: <span className="font-semibold">{HARMONY_LABELS[previewHarmony]}</span>
                  </span>
                  <span className="rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-foreground">
                    Accent style: <span className="font-semibold">{ACCENT_STYLE_LABELS[previewAccentStyle]}</span>
                  </span>
                  <span className="rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-foreground">
                    Typography: <span className="font-semibold">{TYPOGRAPHY_LABELS[previewTypography]}</span>
                  </span>
                </div>
                <div className="mt-2 grid min-w-0 gap-1 sm:grid-cols-2">
                  {presetIdentityTokens.map((token) => (
                    <div
                      key={token.label}
                      className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-border/55 bg-background/80 px-2 py-1.5"
                    >
                      <span
                        className="inline-flex h-3.5 w-3.5 shrink-0 rounded border border-border/60"
                        style={{ backgroundColor: token.value }}
                      />
                      <p className="text-[11px] font-semibold text-foreground">{token.label}</p>
                      <p
                        title={token.value}
                        className="truncate text-right font-mono text-[11px] text-muted-foreground"
                      >
                        {token.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <div className="mt-2 rounded-md border border-border/45 bg-background/65 p-2 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.35)]">
                <p className="text-[11px] font-semibold text-foreground">Transformación activa</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Mode: {resolvedMode} · Preset: {preset.label} · Harmony: {HARMONY_LABELS[previewHarmony]} ·
                  Accent style: {ACCENT_STYLE_LABELS[previewAccentStyle]} · Preset modulation:{" "}
                  {PRESET_MODULATION_PERCENT}%.
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Resolución tokens: {tokenResolutionSourceLabel}. Diagnóstico local:{" "}
                  {previewEnabled ? "ON (capas auxiliares visibles)" : "OFF (solo salida final)"}.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]">
              <h3 className="text-sm font-semibold text-foreground">D. Acciones laboratorio</h3>
              <div className="mt-3 grid min-w-0 gap-2">
                <button
                  type="button"
                  onClick={savePresetStub}
                  disabled={presetVaultSaving || !canUsePaletteEngine}
                  className="h-10 w-full min-w-0 rounded-lg border border-primary/45 bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_16px_-14px_rgba(37,99,235,0.55)] transition hover:-translate-y-px hover:opacity-95"
                >
                  {presetVaultSaving ? "Guardando..." : "Guardar preset"}
                </button>
                <button type="button" onClick={resetPreviewState} className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)] transition hover:-translate-y-px hover:bg-muted">Reset preview</button>
                <button type="button" onClick={resetLab} className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)] transition hover:-translate-y-px hover:bg-muted">Reset general</button>
                <button type="button" onClick={() => update(fallback)} className="h-10 w-full min-w-0 rounded-lg border border-border/55 bg-background px-3 text-sm font-semibold text-foreground shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)] transition hover:-translate-y-px hover:bg-muted">Reset scope</button>
              </div>
              {savePresetNotice ? (
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{savePresetNotice}</p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Ajusta paleta, valida contexto visual y guarda preset.
                </p>
              )}
              <details className="mt-3 rounded-md border border-border/55 bg-background/70 p-2 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                <summary className="cursor-pointer text-xs font-semibold text-foreground">F. Detalles secundarios</summary>
                <p className="mt-2 text-xs text-muted-foreground">Preset activo: {preset.label}. Modulación aplicada: {PRESET_MODULATION_PERCENT}%.</p>
                {extractedPalette ? <p className="mt-1 text-xs text-muted-foreground">Extracción: {extractedPalette.imageWidth}x{extractedPalette.imageHeight} · {extractedPalette.sampledPixels} px.</p> : null}
              </details>
            </section>

            <section className="rounded-xl border border-border/55 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)] xl:col-span-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">E. Preset Vault</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Catalogo minimo de presets guardados para activar y reutilizar.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setVaultCollapsed((value) => !value)}
                    className="h-7 rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground"
                  >
                    {vaultCollapsed ? "Expandir" : "Colapsar"}
                  </button>
                  {vaultSlug ? (
                    <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {vaultSlug}
                    </span>
                  ) : null}
                  <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Mode: {presetVaultMode}
                  </span>
                  <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {presetVaultItems.length} presets
                  </span>
                  {presetVaultLoading ? (
                    <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Loading...
                    </span>
                  ) : null}
                </div>
              </div>

              {presetVaultError ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{presetVaultError}</p>
              ) : null}

              {!vaultSlug ? (
                <p className="mt-3 rounded-md border border-dashed border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                  No hay business slug activo. Activa un negocio para ver su biblioteca.
                </p>
              ) : presetVaultItems.length === 0 ? (
                <p className="mt-3 rounded-md border border-dashed border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                  No hay presets guardados todavia para este negocio.
                </p>
              ) : vaultCollapsed ? (
                <p className="mt-3 rounded-md border border-dashed border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                  Libreria colapsada. Expande para ver y aplicar presets.
                </p>
              ) : (
                <div className="mt-3 grid min-w-0 gap-2">
                  {presetVaultItems.map((item) => {
                    const paletteSegments = [
                      item.tokens.primary,
                      item.tokens.accent,
                      item.tokens.neutral,
                      item.tokens.background,
                      item.tokens.card,
                      item.tokens.surface2,
                      item.tokens.surface3,
                    ];
                    const isActivating = presetVaultActivatingId === item.id;
                    const isDeleting = presetVaultDeletingId === item.id;
                    const isEditing = presetVaultEditingId === item.id;
                    const updatedLabel = formatVaultDate(item.updatedAt);
                    return (
                      <article
                        key={item.id}
                        className={[
                          "grid min-w-0 gap-2 rounded-md border px-3 py-2.5 [background:color-mix(in_oklab,var(--background)_92%,var(--surface-3,var(--card)))]",
                          "lg:grid-cols-[minmax(180px,1fr)_minmax(280px,1.2fr)_minmax(220px,1fr)_auto_auto] lg:items-center",
                          item.isActive ? "border-primary/45" : "border-border/55",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                          {isEditing ? (
                            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
                              <input
                                value={presetVaultEditingName}
                                onChange={(event) => setPresetVaultEditingName(event.target.value)}
                                className="h-7 min-w-[140px] flex-1 rounded-md border border-border/60 bg-background px-2 text-xs text-foreground outline-none"
                                placeholder="Nombre del preset"
                              />
                              <button
                                type="button"
                                onClick={() => savePresetNameFromVault(item.id)}
                                disabled={presetVaultSaving || isDeleting}
                                className="h-7 rounded-md border border-border/60 bg-background px-2 text-[10px] font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                              >
                                {presetVaultSaving ? "Saving..." : "Guardar"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelRenamePresetFromVault}
                                disabled={presetVaultSaving || isDeleting}
                                className="h-7 rounded-md border border-border/60 bg-background px-2 text-[10px] font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : null}
                          <p className="truncate text-[11px] text-muted-foreground">
                            {item.businessSlug}
                            {updatedLabel ? ` · ${updatedLabel}` : ""}
                          </p>
                          <span
                            className={[
                              "mt-1 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              item.isActive
                                ? "border-primary/45 bg-primary/10 text-primary"
                                : "border-border/60 bg-background text-muted-foreground",
                            ].join(" ")}
                          >
                            {item.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>

                        <div className="flex min-w-0 flex-wrap gap-1">
                          <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                            Source: {item.sourceMode}
                          </span>
                          <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                            Harmony: {HARMONY_LABELS[item.harmony]}
                          </span>
                          <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                            Accent: {ACCENT_STYLE_LABELS[item.accentStyle]}
                          </span>
                          <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                            Type: {TYPOGRAPHY_LABELS[item.typography ?? "modern"]}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="grid min-w-0 grid-cols-7 overflow-hidden rounded border border-border/55">
                            {paletteSegments.map((value, index) => (
                              <span
                                key={`${item.id}-${index}`}
                                className="h-3 min-w-0 border-r border-border/35 last:border-r-0"
                                style={{ backgroundColor: value }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="grid min-w-0 gap-1">
                          <button
                            type="button"
                            onClick={() => applyVaultPresetToHero(item)}
                            disabled={isDeleting}
                            className="h-8 min-w-0 rounded-md border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                          >
                            Aplicar a Hero
                          </button>
                          <button
                            type="button"
                            onClick={() => beginRenamePresetFromVault(item)}
                            disabled={isDeleting || presetVaultSaving}
                            className="h-8 min-w-0 rounded-md border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                          >
                            Editar nombre
                          </button>
                        </div>
                        <div className="grid min-w-0 gap-1">
                          <button
                            type="button"
                            disabled={
                              item.isActive ||
                              Boolean(presetVaultActivatingId) ||
                              Boolean(presetVaultDeletingId)
                            }
                            onClick={() => activatePresetFromVault(item.id)}
                            className="h-8 min-w-0 rounded-md border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                          >
                            {item.isActive ? "Activo" : isActivating ? "Activando..." : "Activar preset"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePresetFromVault(item)}
                            disabled={Boolean(presetVaultDeletingId) || Boolean(presetVaultActivatingId)}
                            className="h-8 min-w-0 rounded-md border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                          >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
