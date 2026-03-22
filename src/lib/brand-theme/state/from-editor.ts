import type { BrandScope } from "@/lib/brand/storage";
import type { Brand } from "@/lib/brand/types";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandPaletteSeedSource,
  BrandTypographyPreset,
} from "../types";
import {
  BRAND_THEME_STATE_V1_SCHEMA_VERSION,
  createBrandThemeSeedColorAuto,
  createBrandThemeSeedColorManual,
  type BrandThemeStateV1,
} from "./v1";
import { saveBrandThemeStateV1 } from "./storage.v1";

type EditorSeedInput = {
  source: BrandPaletteSeedSource;
  primary: string;
  accent: string;
  neutral: string;
  sourceRef?: {
    assetId?: string;
    imageUrl?: string;
  };
};

type EditorConfigInput = {
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
  presetModulationPercent: number;
};

export type BuildBrandThemeStateV1FromEditorInput = {
  scope: BrandScope;
  businessSlug?: string;
  brand: Brand;
  seed: EditorSeedInput;
  config: EditorConfigInput;
};

function asOptionalString(input: string | undefined): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim();
  return value.length > 0 ? value : undefined;
}

function toSeedColor(value: string) {
  const manual = createBrandThemeSeedColorManual(value);
  return manual ?? createBrandThemeSeedColorAuto();
}

function toSourceRef(input: EditorSeedInput["sourceRef"], source: BrandPaletteSeedSource) {
  if (source === "manual") return undefined;

  const assetId = asOptionalString(input?.assetId);
  const imageUrl = asOptionalString(input?.imageUrl);
  if (!assetId && !imageUrl) return undefined;

  return { assetId, imageUrl };
}

export function buildBrandThemeStateV1FromEditorInput(
  input: BuildBrandThemeStateV1FromEditorInput
): BrandThemeStateV1 {
  const businessSlug = asOptionalString(input.businessSlug);

  return {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: input.scope,
    businessSlug,
    legacy: {
      brandName: input.brand.brandName,
      palette: input.brand.palette,
      mode: input.brand.mode,
    },
    seed: {
      source: input.seed.source,
      primary: input.seed.primary,
      accent: toSeedColor(input.seed.accent),
      neutral: toSeedColor(input.seed.neutral),
      sourceRef: toSourceRef(input.seed.sourceRef, input.seed.source),
    },
    config: {
      harmony: input.config.harmony,
      accentStyle: input.config.accentStyle,
      typographyPreset: input.config.typographyPreset,
      presetModulationPercent: input.config.presetModulationPercent,
    },
  };
}

type SaveBrandThemeStateV1Like = (
  scope: BrandScope,
  input: unknown,
  businessSlug?: string
) => BrandThemeStateV1 | null;

export function saveBrandThemeStateV1Shadow(input: {
  scope: BrandScope;
  businessSlug?: string;
  state: BrandThemeStateV1;
  save?: SaveBrandThemeStateV1Like;
}): BrandThemeStateV1 | null {
  const saveImpl = input.save ?? saveBrandThemeStateV1;

  try {
    return saveImpl(input.scope, input.state, input.businessSlug);
  } catch {
    return null;
  }
}

export function shadowWriteBrandThemeStateV1FromEditorInput(
  input: BuildBrandThemeStateV1FromEditorInput,
  save?: SaveBrandThemeStateV1Like
): BrandThemeStateV1 | null {
  const state = buildBrandThemeStateV1FromEditorInput(input);
  return saveBrandThemeStateV1Shadow({
    scope: input.scope,
    businessSlug: input.businessSlug,
    state,
    save,
  });
}

export function persistLegacyAndBrandThemeShadow(args: {
  persistLegacy: () => void;
  persistShadow: () => BrandThemeStateV1 | null;
}): BrandThemeStateV1 | null {
  args.persistLegacy();

  try {
    return args.persistShadow();
  } catch {
    return null;
  }
}

