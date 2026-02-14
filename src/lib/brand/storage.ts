import type { Brand } from "./types";

const STORAGE_KEY = "bcc.brand.v0";

export const DEFAULT_BRAND: Brand = {
  brandName: "Business Control Center",
  palette: "bcc",
  mode: "system",
};

export function loadBrandFromStorage(): Brand {
  if (typeof window === "undefined") return DEFAULT_BRAND;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRAND;

    const parsed = JSON.parse(raw) as Partial<Brand>;
    return {
      brandName: typeof parsed.brandName === "string" ? parsed.brandName : DEFAULT_BRAND.brandName,
      palette: (parsed.palette ?? DEFAULT_BRAND.palette) as Brand["palette"],
      mode: (parsed.mode ?? DEFAULT_BRAND.mode) as Brand["mode"],
    };
  } catch {
    return DEFAULT_BRAND;
  }
}

export function saveBrandToStorage(brand: Brand): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(brand));
  } catch {
    // Si falla, no rompemos UX
  }
}
