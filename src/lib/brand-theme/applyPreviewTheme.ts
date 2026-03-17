import type { Brand } from "@/lib/brand/types";
import { resolveBrandThemeTokensFromBrand } from "./resolver";
import { toBrandCssVariables } from "./tokens";
import type {
  BrandTypographyPreset,
  BuildBrandThemeConfigOptions,
  ResolveBrandThemeOptions,
} from "./types";

export type ApplyBrandThemePreviewInput = {
  brand: Brand;
  config: BuildBrandThemeConfigOptions;
  options?: ResolveBrandThemeOptions;
  target?: HTMLElement;
};

const TYPOGRAPHY_FONT_STACK: Record<BrandTypographyPreset, string> = {
  editorial: "Georgia, Cambria, 'Times New Roman', Times, serif",
  modern:
    "var(--font-geist-sans), system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  classic: "'Trebuchet MS', 'Segoe UI', Tahoma, Arial, sans-serif",
  geometric:
    "'Avenir Next', Avenir, 'Century Gothic', Montserrat, var(--font-geist-sans), sans-serif",
};

function applyCssVariables(
  target: HTMLElement,
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

export function applyBrandThemePreviewToDocument(input: ApplyBrandThemePreviewInput): () => void {
  if (typeof document === "undefined") return () => {};

  const target = input.target ?? document.documentElement;

  const tokens = resolveBrandThemeTokensFromBrand({
    brand: input.brand,
    config: input.config,
    options: input.options,
  });

  const cssVariables = toBrandCssVariables(tokens);
  cssVariables["--brand-typography-preset"] = tokens.typographyPreset;
  cssVariables["--font-sans"] = TYPOGRAPHY_FONT_STACK[tokens.typographyPreset];

  return applyCssVariables(target, cssVariables);
}
