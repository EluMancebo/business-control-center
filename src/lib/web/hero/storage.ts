import type { HeroData } from "./types";
import { DEFAULT_HERO } from "./types";

export const HERO_STORAGE_KEY = "bcc:hero.v0";

function safeStr(v: unknown, fallback: string) {
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}

export function loadHeroFromStorage(): HeroData {
  if (typeof window === "undefined") return DEFAULT_HERO;

  try {
    const raw = window.localStorage.getItem(HERO_STORAGE_KEY);
    if (!raw) return DEFAULT_HERO;

    const parsed = JSON.parse(raw) as Partial<HeroData>;

    return {
      badge: safeStr(parsed.badge, DEFAULT_HERO.badge),
      title: safeStr(parsed.title, DEFAULT_HERO.title),
      description: safeStr(parsed.description, DEFAULT_HERO.description),
      primaryCtaLabel: safeStr(parsed.primaryCtaLabel, DEFAULT_HERO.primaryCtaLabel),
      primaryCtaHref: safeStr(parsed.primaryCtaHref, DEFAULT_HERO.primaryCtaHref),
      secondaryCtaLabel: safeStr(parsed.secondaryCtaLabel, DEFAULT_HERO.secondaryCtaLabel),
      secondaryCtaHref: safeStr(parsed.secondaryCtaHref, DEFAULT_HERO.secondaryCtaHref),
    };
  } catch {
    return DEFAULT_HERO;
  }
}

export function saveHeroToStorage(next: HeroData): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // no rompemos UX
  }
}
