import type { BrandMode } from "@/lib/brand/types";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
} from "../presets";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandTypographyPreset,
} from "../types";
import type { BrandThemeStateV1 } from "../state/v1";
import { listAuthorizedThemePresets } from "./presets";
import {
  BUSINESS_THEME_POLICY_SCHEMA_VERSION,
  LAYER2_THEME_ADJUSTABLE_FIELDS,
  LAYER2_THEME_SCOPES,
  LAYER2_THEME_SELECTION_SCHEMA_VERSION,
  type AuthorizedThemePreset,
  type BusinessThemePolicy,
  type Layer2ThemeAdjustableField,
  type Layer2ThemeOverrides,
  type Layer2ThemeScope,
  type Layer2ThemeSelection,
  type Layer2ThemeSelectionStage,
  type Layer2ThemeSnapshot,
} from "./types";

const BRAND_MODES: BrandMode[] = ["light", "dark", "system"];

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

function asNonEmptyString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  return value.length > 0 ? value : null;
}

function asOptionalString(input: unknown): string | undefined {
  return asNonEmptyString(input) ?? undefined;
}

export function normalizeLayer2ThemeScope(input: unknown): Layer2ThemeScope | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  return LAYER2_THEME_SCOPES.includes(value as Layer2ThemeScope)
    ? (value as Layer2ThemeScope)
    : null;
}

export function normalizeBusinessSlug(input: unknown): string | null {
  const raw = asNonEmptyString(input);
  if (!raw) return null;

  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return normalized || null;
}

function asBrandMode(input: unknown): BrandMode | null {
  if (typeof input !== "string") return null;
  return BRAND_MODES.includes(input as BrandMode) ? (input as BrandMode) : null;
}

function asHarmony(input: unknown): BrandHarmonyStrategy | null {
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

function asTypographyPreset(input: unknown): BrandTypographyPreset | null {
  if (typeof input !== "string") return null;
  return BRAND_THEME_TYPOGRAPHY_OPTIONS.includes(input as BrandTypographyPreset)
    ? (input as BrandTypographyPreset)
    : null;
}

function asAdjustableField(input: unknown): Layer2ThemeAdjustableField | null {
  if (typeof input !== "string") return null;
  return LAYER2_THEME_ADJUSTABLE_FIELDS.includes(input as Layer2ThemeAdjustableField)
    ? (input as Layer2ThemeAdjustableField)
    : null;
}

function uniqueStringList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const deduped = new Set<string>();

  for (const value of values) {
    const item = asNonEmptyString(value);
    if (item) deduped.add(item);
  }

  return Array.from(deduped);
}

function uniqueAdjustableFields(values: unknown): Layer2ThemeAdjustableField[] {
  if (!Array.isArray(values)) return [];
  const deduped = new Set<Layer2ThemeAdjustableField>();

  for (const value of values) {
    const item = asAdjustableField(value);
    if (item) deduped.add(item);
  }

  return Array.from(deduped);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizePercent(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return clamp(Math.round(value), 0, 100);
}

function normalizeSnapshot(input: unknown): Layer2ThemeSnapshot | null {
  if (!isRecord(input)) return null;
  const presetId = asNonEmptyString(input.presetId);
  if (!presetId) return null;

  return {
    presetId,
    overrides: normalizeLayer2ThemeOverrides(input.overrides),
    heroPresetKey: asOptionalString(input.heroPresetKey),
  };
}

export function normalizeLayer2ThemeOverrides(input: unknown): Layer2ThemeOverrides | undefined {
  if (!isRecord(input)) return undefined;
  const overrides: Layer2ThemeOverrides = {};

  const mode = asBrandMode(input.mode);
  if (mode) overrides.mode = mode;

  const harmony = asHarmony(input.harmony);
  if (harmony) overrides.harmony = harmony;

  const accentStyle = asAccentStyle(input.accentStyle);
  if (accentStyle) overrides.accentStyle = accentStyle;

  const typographyPreset = asTypographyPreset(input.typographyPreset);
  if (typographyPreset) overrides.typographyPreset = typographyPreset;

  if (typeof input.presetModulationPercent === "number") {
    overrides.presetModulationPercent = normalizePercent(input.presetModulationPercent, 26);
  }

  return Object.keys(overrides).length > 0 ? overrides : undefined;
}

export function createDefaultBusinessThemePolicy(input: {
  businessSlug: string;
  scope: Layer2ThemeScope;
  presets?: AuthorizedThemePreset[];
}): BusinessThemePolicy {
  const slug = normalizeBusinessSlug(input.businessSlug) ?? "business";
  const catalog =
    input.presets?.filter((preset) => preset.scope === input.scope && preset.status === "active") ??
    listAuthorizedThemePresets(input.scope).filter((preset) => preset.status === "active");
  const allowedPresetIds = catalog.map((preset) => preset.id);

  return {
    schemaVersion: BUSINESS_THEME_POLICY_SCHEMA_VERSION,
    businessSlug: slug,
    scope: input.scope,
    allowedPresetIds,
    defaultPresetId: allowedPresetIds[0],
    adjustableFields: ["harmony", "accentStyle", "typographyPreset", "presetModulationPercent"],
  };
}

export function normalizeBusinessThemePolicy(
  input: unknown,
  options?: {
    fallbackBusinessSlug?: string;
    fallbackScope?: Layer2ThemeScope;
    presets?: AuthorizedThemePreset[];
  }
): BusinessThemePolicy | null {
  if (!isRecord(input)) return null;
  if (input.schemaVersion !== BUSINESS_THEME_POLICY_SCHEMA_VERSION) return null;

  const scope =
    normalizeLayer2ThemeScope(input.scope) ??
    normalizeLayer2ThemeScope(options?.fallbackScope);
  if (!scope) return null;

  const businessSlug =
    normalizeBusinessSlug(input.businessSlug) ??
    normalizeBusinessSlug(options?.fallbackBusinessSlug);
  if (!businessSlug) return null;

  const catalog =
    options?.presets?.filter((preset) => preset.scope === scope) ??
    listAuthorizedThemePresets(scope);
  const catalogIds = new Set(catalog.map((preset) => preset.id));
  const allowedPresetIds = uniqueStringList(input.allowedPresetIds).filter((id) =>
    catalogIds.has(id)
  );

  const defaultPresetIdRaw = asOptionalString(input.defaultPresetId);
  const defaultPresetId =
    defaultPresetIdRaw && allowedPresetIds.includes(defaultPresetIdRaw)
      ? defaultPresetIdRaw
      : allowedPresetIds[0];

  const adjustableFields = uniqueAdjustableFields(input.adjustableFields);
  const heroPolicy = isRecord(input.heroPolicy)
    ? {
        allowedPresetKeys: uniqueStringList(input.heroPolicy.allowedPresetKeys),
        defaultPresetKey: asOptionalString(input.heroPolicy.defaultPresetKey),
      }
    : undefined;

  return {
    schemaVersion: BUSINESS_THEME_POLICY_SCHEMA_VERSION,
    businessSlug,
    scope,
    allowedPresetIds,
    defaultPresetId,
    adjustableFields,
    heroPolicy,
    updatedAt: asOptionalString(input.updatedAt),
    updatedBy: asOptionalString(input.updatedBy),
  };
}

export function normalizeLayer2ThemeSelection(
  input: unknown,
  options?: {
    fallbackBusinessSlug?: string;
    fallbackScope?: Layer2ThemeScope;
  }
): Layer2ThemeSelection | null {
  if (!isRecord(input)) return null;
  if (input.schemaVersion !== LAYER2_THEME_SELECTION_SCHEMA_VERSION) return null;

  const scope =
    normalizeLayer2ThemeScope(input.scope) ??
    normalizeLayer2ThemeScope(options?.fallbackScope);
  if (!scope) return null;

  const businessSlug =
    normalizeBusinessSlug(input.businessSlug) ??
    normalizeBusinessSlug(options?.fallbackBusinessSlug);
  if (!businessSlug) return null;

  const draft = normalizeSnapshot(input.draft);
  if (!draft) return null;

  const published = normalizeSnapshot(input.published) ?? undefined;

  return {
    schemaVersion: LAYER2_THEME_SELECTION_SCHEMA_VERSION,
    businessSlug,
    scope,
    draft,
    published,
    updatedAt: asOptionalString(input.updatedAt),
    updatedBy: asOptionalString(input.updatedBy),
  };
}

export function resolveSelectionSnapshot(
  selection: Layer2ThemeSelection,
  stage: Layer2ThemeSelectionStage
): Layer2ThemeSnapshot {
  if (stage === "published" && selection.published) return selection.published;
  return selection.draft;
}

export function resolveAuthorizedPresetForBusiness(input: {
  scope: Layer2ThemeScope;
  policy: BusinessThemePolicy;
  selection: Layer2ThemeSelection;
  stage?: Layer2ThemeSelectionStage;
  presets?: AuthorizedThemePreset[];
}): AuthorizedThemePreset | null {
  const catalog =
    input.presets?.filter((preset) => preset.scope === input.scope) ??
    listAuthorizedThemePresets(input.scope);
  const activeCatalog = catalog.filter((preset) => preset.status === "active");
  if (activeCatalog.length === 0) return null;

  const allowedIdSet = new Set(input.policy.allowedPresetIds);
  const allowedCatalog = activeCatalog.filter((preset) => allowedIdSet.has(preset.id));
  const stage = input.stage ?? "draft";
  const snapshot = resolveSelectionSnapshot(input.selection, stage);

  const selectionMatch = allowedCatalog.find((preset) => preset.id === snapshot.presetId);
  if (selectionMatch) return selectionMatch;

  const policyDefault = input.policy.defaultPresetId
    ? allowedCatalog.find((preset) => preset.id === input.policy.defaultPresetId)
    : null;
  if (policyDefault) return policyDefault;

  return allowedCatalog[0] ?? activeCatalog[0] ?? null;
}

export function sanitizeLayer2Overrides(input: {
  preset: AuthorizedThemePreset;
  policy: BusinessThemePolicy;
  overrides?: Layer2ThemeOverrides;
}): Layer2ThemeOverrides {
  const overrides = input.overrides ?? {};
  const allowed = new Set(input.policy.adjustableFields);
  const sanitized: Layer2ThemeOverrides = {};

  if (allowed.has("mode") && overrides.mode) {
    sanitized.mode = overrides.mode;
  }
  if (allowed.has("harmony") && overrides.harmony) {
    sanitized.harmony = overrides.harmony;
  }
  if (allowed.has("accentStyle") && overrides.accentStyle) {
    sanitized.accentStyle = overrides.accentStyle;
  }
  if (allowed.has("typographyPreset") && overrides.typographyPreset) {
    sanitized.typographyPreset = overrides.typographyPreset;
  }
  if (
    allowed.has("presetModulationPercent") &&
    typeof overrides.presetModulationPercent === "number"
  ) {
    const min = input.preset.limits?.minModulationPercent ?? 0;
    const max = input.preset.limits?.maxModulationPercent ?? 100;
    sanitized.presetModulationPercent = clamp(
      normalizePercent(overrides.presetModulationPercent, input.preset.themeBase.presetModulationPercent),
      min,
      max
    );
  }

  return sanitized;
}

export function applyLayer2SelectionToBrandThemeStateV1(input: {
  baseState: BrandThemeStateV1;
  policy: BusinessThemePolicy;
  selection: Layer2ThemeSelection;
  stage?: Layer2ThemeSelectionStage;
  presets?: AuthorizedThemePreset[];
}): BrandThemeStateV1 {
  const preset = resolveAuthorizedPresetForBusiness({
    scope: input.policy.scope,
    policy: input.policy,
    selection: input.selection,
    stage: input.stage,
    presets: input.presets,
  });
  if (!preset) return input.baseState;

  const snapshot = resolveSelectionSnapshot(input.selection, input.stage ?? "draft");
  const overrides = sanitizeLayer2Overrides({
    preset,
    policy: input.policy,
    overrides: snapshot.overrides,
  });

  return {
    ...input.baseState,
    legacy: {
      ...input.baseState.legacy,
      palette: preset.legacyBase.palette,
      mode: overrides.mode ?? preset.legacyBase.mode,
    },
    config: {
      ...input.baseState.config,
      harmony: overrides.harmony ?? preset.themeBase.harmony,
      accentStyle: overrides.accentStyle ?? preset.themeBase.accentStyle,
      typographyPreset: overrides.typographyPreset ?? preset.themeBase.typographyPreset,
      presetModulationPercent:
        overrides.presetModulationPercent ?? preset.themeBase.presetModulationPercent,
    },
  };
}

export function publishLayer2Selection(
  selection: Layer2ThemeSelection,
  updatedBy?: string
): Layer2ThemeSelection {
  return {
    ...selection,
    published: { ...selection.draft },
    updatedAt: new Date().toISOString(),
    updatedBy: asOptionalString(updatedBy),
  };
}
