import type { Brand } from "@/lib/brand/types";
import type { BrandThemePipelineResult } from "../pipeline";

type RuntimeStyleTarget = {
  getPropertyValue(name: string): string;
  setProperty(name: string, value: string): void;
  removeProperty(name: string): void;
};

export type BrandThemeRuntimeTarget = {
  style: RuntimeStyleTarget;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
};

export type BrandThemeRuntimeLegacySnapshot = Pick<Brand, "palette" | "mode">;

export type BrandThemeRuntimePayload = {
  cssVariables: Record<string, string>;
  legacy: BrandThemeRuntimeLegacySnapshot;
};

export type ApplyBrandThemeRuntimeInput = BrandThemeRuntimePayload & {
  target?: BrandThemeRuntimeTarget | null;
};

export type RemoveBrandThemeRuntimeInput = {
  cssVariableNames: string[];
  clearLegacyDataAttrs?: boolean;
  target?: BrandThemeRuntimeTarget | null;
};

const LEGACY_DATA_ATTR_PALETTE = "data-brand-palette";
const LEGACY_DATA_ATTR_MODE = "data-brand-mode";

function resolveRuntimeTarget(target?: BrandThemeRuntimeTarget | null): BrandThemeRuntimeTarget | null {
  if (target) return target;
  if (typeof document === "undefined") return null;
  return document.documentElement as unknown as BrandThemeRuntimeTarget;
}

function applyCssVariables(
  target: BrandThemeRuntimeTarget,
  variables: Record<string, string>
): () => void {
  const previousValues = new Map<string, string>();

  for (const [name, value] of Object.entries(variables)) {
    previousValues.set(name, target.style.getPropertyValue(name));
    target.style.setProperty(name, value);
  }

  return () => {
    for (const [name, previousValue] of previousValues.entries()) {
      if (!previousValue) {
        target.style.removeProperty(name);
      } else {
        target.style.setProperty(name, previousValue);
      }
    }
  };
}

function syncLegacyDataAttributes(
  target: BrandThemeRuntimeTarget,
  legacy: BrandThemeRuntimeLegacySnapshot
): () => void {
  const previousPalette = target.getAttribute(LEGACY_DATA_ATTR_PALETTE);
  const previousMode = target.getAttribute(LEGACY_DATA_ATTR_MODE);

  target.setAttribute(LEGACY_DATA_ATTR_PALETTE, legacy.palette);
  target.setAttribute(LEGACY_DATA_ATTR_MODE, legacy.mode);

  return () => {
    if (previousPalette === null) {
      target.removeAttribute(LEGACY_DATA_ATTR_PALETTE);
    } else {
      target.setAttribute(LEGACY_DATA_ATTR_PALETTE, previousPalette);
    }

    if (previousMode === null) {
      target.removeAttribute(LEGACY_DATA_ATTR_MODE);
    } else {
      target.setAttribute(LEGACY_DATA_ATTR_MODE, previousMode);
    }
  };
}

export function toBrandThemeRuntimePayloadFromPipeline(
  result: Pick<BrandThemePipelineResult, "cssVariables" | "brand">
): BrandThemeRuntimePayload {
  return {
    cssVariables: { ...result.cssVariables },
    legacy: {
      palette: result.brand.palette,
      mode: result.brand.mode,
    },
  };
}

export function applyBrandThemeRuntime(
  input: ApplyBrandThemeRuntimeInput
): () => void {
  const target = resolveRuntimeTarget(input.target);
  if (!target) return () => {};

  const resetCssVariables = applyCssVariables(target, input.cssVariables);
  const resetLegacyDataAttrs = syncLegacyDataAttributes(target, input.legacy);

  return () => {
    resetCssVariables();
    resetLegacyDataAttrs();
  };
}

export function applyBrandThemeRuntimeFromPipelineResult(input: {
  result: Pick<BrandThemePipelineResult, "cssVariables" | "brand">;
  target?: BrandThemeRuntimeTarget | null;
}): () => void {
  const payload = toBrandThemeRuntimePayloadFromPipeline(input.result);
  return applyBrandThemeRuntime({ ...payload, target: input.target });
}

export function removeBrandThemeRuntime(input: RemoveBrandThemeRuntimeInput): void {
  const target = resolveRuntimeTarget(input.target);
  if (!target) return;

  for (const name of input.cssVariableNames) {
    target.style.removeProperty(name);
  }

  if (input.clearLegacyDataAttrs) {
    target.removeAttribute(LEGACY_DATA_ATTR_PALETTE);
    target.removeAttribute(LEGACY_DATA_ATTR_MODE);
  }
}

