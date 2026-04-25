// src/lib/brand/apply.ts
import type { Brand } from "./types";
import type { BrandScope } from "./storage";

const SCOPE_PRIORITY: Record<BrandScope, number> = {
  web: 3,
  panel: 2,
  studio: 1,
  system: 0,
};

const activeScopes = new Set<BrandScope>();

export function registerBrandScope(scope: BrandScope): void {
  activeScopes.add(scope);
}

export function unregisterBrandScope(scope: BrandScope): void {
  activeScopes.delete(scope);
}

function highestPriorityScope(): BrandScope | null {
  let best: BrandScope | null = null;
  let bestPriority = -1;
  for (const s of activeScopes) {
    if (SCOPE_PRIORITY[s] > bestPriority) {
      bestPriority = SCOPE_PRIORITY[s];
      best = s;
    }
  }
  return best;
}

// scope es opcional para mantener compatibilidad con BrandScopeOverride (sin scope = aplica siempre)
export function applyBrandToDocument(brand: Brand, scope?: BrandScope): void {
  if (typeof document === "undefined") return;
  if (scope !== undefined && highestPriorityScope() !== scope) return;

  const el = document.documentElement;
  el.dataset.brandPalette = brand.palette;
  el.dataset.brandMode = brand.mode;
}
