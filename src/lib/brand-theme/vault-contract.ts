import type { BrandMode } from "@/lib/brand/types";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandTypographyPreset,
} from "./types";

export type BrandPresetVaultMode = Extract<BrandMode, "system" | "light" | "dark">;
export type BrandPresetVaultSourceMode = "manual" | "logo" | "hybrid";

export type BrandPresetVaultTokens = {
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

export type BrandPresetVaultItem = {
  id: string;
  businessSlug: string;
  name: string;
  description?: string;
  isActive: boolean;
  sourceMode: BrandPresetVaultSourceMode;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typography?: BrandTypographyPreset;
  tokens: BrandPresetVaultTokens;
  createdAt: string;
  updatedAt: string;
};

export type BrandPresetVaultSnapshot = {
  items: BrandPresetVaultItem[];
  mode: BrandPresetVaultMode;
  activeBrandPresetId: string | null;
};

export type BrandPresetVaultResponse =
  | ({
      ok: true;
      error?: string;
      item?: BrandPresetVaultItem;
      deletedPresetId?: string;
      wasActive?: boolean;
      heroReferenceWarning?: boolean;
    } & BrandPresetVaultSnapshot)
  | {
      ok: false;
      error: string;
      requiresForceDelete?: boolean;
    };

export function toBrandPresetVaultItem(
  input: BrandPresetVaultItem
): BrandPresetVaultItem {
  return {
    id: input.id,
    businessSlug: input.businessSlug,
    name: input.name,
    description: input.description,
    isActive: Boolean(input.isActive),
    sourceMode: input.sourceMode,
    harmony: input.harmony,
    accentStyle: input.accentStyle,
    typography: input.typography,
    tokens: { ...input.tokens },
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}
