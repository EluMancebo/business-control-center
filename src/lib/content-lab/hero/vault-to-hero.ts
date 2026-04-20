import type { BrandPresetVaultItem } from "@/lib/brand-theme/vault-contract";
import type { HeroDraftInput } from "./types";

export function mapVaultPresetToHeroInput(
  vaultItem: BrandPresetVaultItem
): HeroDraftInput {
  return {
    palette: { ...vaultItem.tokens },
    harmony: vaultItem.harmony,
    accentStyle: vaultItem.accentStyle,
    typography: vaultItem.typography,
  };
}
