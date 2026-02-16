// src/lib/brand/apply.ts
import type { Brand } from "./types";

export function applyBrandToDocument(brand: Brand) {
  if (typeof document === "undefined") return;

  const el = document.documentElement;

  el.dataset.brandPalette = brand.palette;
  el.dataset.brandMode = brand.mode;
}

