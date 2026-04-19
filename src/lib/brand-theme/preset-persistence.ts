import type { BrandMode } from "@/lib/brand/types";
import { dbConnect } from "@/lib/db";
import { BusinessBrandConfig } from "@/models/BusinessBrandConfig";
import { BrandPreset } from "@/models/BrandPreset";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
} from "./presets";
import {
  DEFAULT_BRAND_THEME_CONFIG,
  resolveBrandPresetToSemanticTokens,
} from "./resolver";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandSemanticTokens,
  BrandTypographyPreset,
  ResolveBrandThemeOptions,
} from "./types";
import { normalizeBusinessSlug } from "./authorized/model";

export type BrandPresetSourceMode = "manual" | "logo" | "hybrid";

export type BrandPresetTokens = {
  primary: string;
  accent: string;
  neutral: string;
  background: string;
  card: string;
  surface2: string;
  surface3: string;
  link: string;
  border: string;
};

export type BrandPresetRecord = {
  id: string;
  businessSlug: string;
  name: string;
  description?: string;
  isActive: boolean;
  sourceMode: BrandPresetSourceMode;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typography?: BrandTypographyPreset;
  tokens: BrandPresetTokens;
  createdAt: string;
  updatedAt: string;
};

export type BusinessBrandConfigRecord = {
  businessSlug: string;
  activeBrandPresetId: string;
  mode: Extract<BrandMode, "system" | "light" | "dark">;
};

export type ResolvedActiveBrandPresetRecord = {
  preset: BrandPresetRecord;
  mode: BusinessBrandConfigRecord["mode"];
  semanticTokens: BrandSemanticTokens;
};

export type SaveBrandPresetInput = {
  id?: string;
  businessSlug: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  sourceMode?: BrandPresetSourceMode;
  harmony?: BrandHarmonyStrategy | "split";
  accentStyle?: BrandAccentStyle;
  typography?: BrandTypographyPreset;
  tokens?: Partial<BrandPresetTokens>;
  mode?: BrandMode;
};

const BRAND_PRESET_SOURCE_MODE_OPTIONS: BrandPresetSourceMode[] = [
  "manual",
  "logo",
  "hybrid",
];
const BRAND_MODE_OPTIONS: BusinessBrandConfigRecord["mode"][] = [
  "system",
  "light",
  "dark",
];
const BRAND_PRESET_TOKEN_KEYS: Array<keyof BrandPresetTokens> = [
  "primary",
  "accent",
  "neutral",
  "background",
  "card",
  "surface2",
  "surface3",
  "link",
  "border",
];

type BrandPresetLean = {
  _id: unknown;
  businessSlug: string;
  name: string;
  description?: string;
  isActive: boolean;
  sourceMode: BrandPresetSourceMode;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typography?: BrandTypographyPreset;
  tokens: BrandPresetTokens;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function asNonEmptyString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  return value.length > 0 ? value : null;
}

function asOptionalString(input: unknown): string | undefined {
  return asNonEmptyString(input) ?? undefined;
}

function asSourceMode(input: unknown): BrandPresetSourceMode | null {
  if (typeof input !== "string") return null;
  return BRAND_PRESET_SOURCE_MODE_OPTIONS.includes(input as BrandPresetSourceMode)
    ? (input as BrandPresetSourceMode)
    : null;
}

function asHarmony(input: unknown): BrandHarmonyStrategy | null {
  if (input === "split") return "split-complementary";
  if (typeof input !== "string") return null;
  return BRAND_THEME_HARMONY_OPTIONS.includes(input as BrandHarmonyStrategy)
    ? (input as BrandHarmonyStrategy)
    : null;
}

function asAccentStyle(input: unknown): BrandAccentStyle | null {
  if (typeof input !== "string") return null;
  return BRAND_THEME_ACCENT_STYLE_OPTIONS.includes(input as BrandAccentStyle)
    ? (input as BrandAccentStyle)
    : null;
}

function asTypography(input: unknown): BrandTypographyPreset | null {
  if (typeof input !== "string") return null;
  return BRAND_THEME_TYPOGRAPHY_OPTIONS.includes(input as BrandTypographyPreset)
    ? (input as BrandTypographyPreset)
    : null;
}

function asMode(input: unknown): BusinessBrandConfigRecord["mode"] | null {
  if (typeof input !== "string") return null;
  return BRAND_MODE_OPTIONS.includes(input as BusinessBrandConfigRecord["mode"])
    ? (input as BusinessBrandConfigRecord["mode"])
    : null;
}

function toIdString(input: unknown): string {
  if (typeof input === "string") return input;
  if (isRecord(input) && typeof input.toString === "function") return input.toString();
  return "";
}

function toIsoString(input: unknown): string {
  if (input instanceof Date) return input.toISOString();
  if (typeof input === "string" && input.trim().length > 0) {
    const maybeDate = new Date(input);
    if (!Number.isNaN(maybeDate.getTime())) return maybeDate.toISOString();
  }
  return new Date().toISOString();
}

function toBrandPresetRecord(doc: BrandPresetLean | null | undefined): BrandPresetRecord | null {
  if (!doc) return null;
  return {
    id: toIdString(doc._id),
    businessSlug: doc.businessSlug,
    name: doc.name,
    description: asOptionalString(doc.description),
    isActive: Boolean(doc.isActive),
    sourceMode: asSourceMode(doc.sourceMode) ?? "manual",
    harmony: asHarmony(doc.harmony) ?? DEFAULT_BRAND_THEME_CONFIG.harmony,
    accentStyle: asAccentStyle(doc.accentStyle) ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    typography: asTypography(doc.typography) ?? DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
    tokens: doc.tokens,
    createdAt: toIsoString(doc.createdAt),
    updatedAt: toIsoString(doc.updatedAt),
  };
}

function resolveTokens(
  input: SaveBrandPresetInput["tokens"],
  fallback?: BrandPresetTokens
): BrandPresetTokens | null {
  const tokens: Partial<BrandPresetTokens> = {};
  for (const key of BRAND_PRESET_TOKEN_KEYS) {
    const value = asOptionalString(input?.[key]) ?? asOptionalString(fallback?.[key]);
    if (!value) return null;
    tokens[key] = value;
  }
  return tokens as BrandPresetTokens;
}

async function upsertBusinessBrandConfig(input: {
  businessSlug: string;
  activeBrandPresetId: string;
  mode?: BrandMode;
}): Promise<void> {
  const existing = await BusinessBrandConfig.findOne({ businessSlug: input.businessSlug }).lean();
  const mode = asMode(input.mode) ?? asMode(existing?.mode) ?? "system";
  await BusinessBrandConfig.findOneAndUpdate(
    { businessSlug: input.businessSlug },
    {
      $set: {
        businessSlug: input.businessSlug,
        activeBrandPresetId: input.activeBrandPresetId,
        mode,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function setActiveBrandPreset(
  businessSlug: string,
  presetId: string,
  mode?: BrandMode
): Promise<BrandPresetRecord | null> {
  await dbConnect();

  const slug = normalizeBusinessSlug(businessSlug);
  if (!slug) return null;

  const target = (await BrandPreset.findOne({
    _id: presetId,
    businessSlug: slug,
  }).lean()) as BrandPresetLean | null;
  if (!target) return null;

  await BrandPreset.updateMany(
    { businessSlug: slug, _id: { $ne: target._id }, isActive: true },
    { $set: { isActive: false } }
  );
  await BrandPreset.updateOne({ _id: target._id }, { $set: { isActive: true } });

  await upsertBusinessBrandConfig({
    businessSlug: slug,
    activeBrandPresetId: toIdString(target._id),
    mode,
  });

  const updated = (await BrandPreset.findById(target._id).lean()) as BrandPresetLean | null;
  return toBrandPresetRecord(updated);
}

export async function getActiveBrandPreset(
  businessSlug: string
): Promise<BrandPresetRecord | null> {
  await dbConnect();

  const slug = normalizeBusinessSlug(businessSlug);
  if (!slug) return null;

  const config = await BusinessBrandConfig.findOne({ businessSlug: slug }).lean();
  const configPresetId = toIdString(config?.activeBrandPresetId);

  if (configPresetId) {
    const byConfig = (await BrandPreset.findOne({
      _id: configPresetId,
      businessSlug: slug,
    }).lean()) as BrandPresetLean | null;
    if (byConfig) {
      if (!byConfig.isActive) {
        await BrandPreset.updateMany(
          { businessSlug: slug, _id: { $ne: byConfig._id }, isActive: true },
          { $set: { isActive: false } }
        );
        await BrandPreset.updateOne({ _id: byConfig._id }, { $set: { isActive: true } });
        const refreshed = (await BrandPreset.findById(byConfig._id).lean()) as BrandPresetLean | null;
        return toBrandPresetRecord(refreshed);
      }
      return toBrandPresetRecord(byConfig);
    }
  }

  const byFlag = (await BrandPreset.findOne({ businessSlug: slug, isActive: true })
    .sort({ updatedAt: -1 })
    .lean()) as BrandPresetLean | null;
  if (!byFlag) return null;

  await upsertBusinessBrandConfig({
    businessSlug: slug,
    activeBrandPresetId: toIdString(byFlag._id),
    mode: config?.mode as BrandMode | undefined,
  });

  return toBrandPresetRecord(byFlag);
}

export async function saveBrandPreset(
  input: SaveBrandPresetInput
): Promise<BrandPresetRecord | null> {
  await dbConnect();

  const slug = normalizeBusinessSlug(input.businessSlug);
  if (!slug) return null;

  const presetId = asOptionalString(input.id);
  const existing = presetId
    ? ((await BrandPreset.findOne({
        _id: presetId,
        businessSlug: slug,
      }).lean()) as BrandPresetLean | null)
    : null;

  if (presetId && !existing) return null;

  const name = asOptionalString(input.name) ?? asOptionalString(existing?.name);
  if (!name) return null;

  const tokens = resolveTokens(input.tokens, existing?.tokens);
  if (!tokens) return null;

  const description = asOptionalString(input.description) ?? asOptionalString(existing?.description) ?? "";
  const sourceMode = asSourceMode(input.sourceMode) ?? asSourceMode(existing?.sourceMode) ?? "manual";
  const harmony = asHarmony(input.harmony) ?? asHarmony(existing?.harmony) ?? DEFAULT_BRAND_THEME_CONFIG.harmony;
  const accentStyle =
    asAccentStyle(input.accentStyle) ??
    asAccentStyle(existing?.accentStyle) ??
    DEFAULT_BRAND_THEME_CONFIG.accentStyle;
  const typography =
    asTypography(input.typography) ??
    asTypography(existing?.typography) ??
    DEFAULT_BRAND_THEME_CONFIG.typographyPreset;
  const hasActivationOverride = typeof input.isActive === "boolean";
  const nextIsActive = hasActivationOverride ? input.isActive : Boolean(existing?.isActive);

  const payload = {
    businessSlug: slug,
    name,
    description,
    sourceMode,
    harmony,
    accentStyle,
    typography,
    tokens,
    isActive: nextIsActive,
  };

  const persisted = existing
    ? ((await BrandPreset.findByIdAndUpdate(existing._id, payload, { new: true }).lean()) as
        | BrandPresetLean
        | null)
    : ((await BrandPreset.create(payload)) as { _id: unknown });

  const persistedId =
    existing && persisted && isRecord(persisted) ? toIdString((persisted as BrandPresetLean)._id) : toIdString(persisted?._id);
  if (!persistedId) return null;

  if (nextIsActive) {
    return setActiveBrandPreset(slug, persistedId, input.mode);
  }

  if (hasActivationOverride && existing?.isActive) {
    await BusinessBrandConfig.updateOne(
      { businessSlug: slug, activeBrandPresetId: existing._id },
      { $set: { activeBrandPresetId: null } }
    );
  }

  const refreshed = (await BrandPreset.findById(persistedId).lean()) as BrandPresetLean | null;
  return toBrandPresetRecord(refreshed);
}

export async function getResolvedActiveBrandPreset(
  businessSlug: string,
  options?: {
    mode?: BrandMode;
    runtime?: ResolveBrandThemeOptions;
  }
): Promise<ResolvedActiveBrandPresetRecord | null> {
  const preset = await getActiveBrandPreset(businessSlug);
  if (!preset) return null;

  const slug = normalizeBusinessSlug(businessSlug);
  if (!slug) return null;

  const modeFromInput = asMode(options?.mode);
  const modeFromConfig = !modeFromInput
    ? asMode((await BusinessBrandConfig.findOne({ businessSlug: slug }).lean())?.mode)
    : null;
  const mode = modeFromInput ?? modeFromConfig ?? "system";

  const semanticTokens = resolveBrandPresetToSemanticTokens(
    {
      sourceMode: preset.sourceMode,
      harmony: preset.harmony,
      accentStyle: preset.accentStyle,
      typography: preset.typography,
      tokens: preset.tokens,
    },
    {
      mode,
      runtime: options?.runtime,
    }
  );
  if (!semanticTokens) return null;

  return {
    preset,
    mode,
    semanticTokens,
  };
}
