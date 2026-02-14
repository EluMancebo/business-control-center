import type { Brand } from "./types";

export function applyBrandToDocument(brand: Brand): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.brandPalette = brand.palette;
  root.dataset.brandMode = brand.mode;
}
