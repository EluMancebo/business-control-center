import type { BrandScope } from "@/lib/brand/storage";

export const BRAND_THEME_SEMANTIC_RUNTIME_DEFAULT_ENABLED = false;

const BRAND_THEME_SEMANTIC_RUNTIME_SCOPE_OVERRIDES: Partial<
  Record<BrandScope, boolean>
> = {
  studio: true,
  panel: true,
  web: true,
};

const LOCAL_STORAGE_GLOBAL_KEY = "bcc:flag:brand-theme-runtime-v1";
const LOCAL_STORAGE_SCOPES_KEY = "bcc:flag:brand-theme-runtime-v1:scopes";
const ENV_GLOBAL_KEY = "NEXT_PUBLIC_BCC_BRAND_THEME_RUNTIME_V1";
const ENV_SCOPES_KEY = "NEXT_PUBLIC_BCC_BRAND_THEME_RUNTIME_V1_SCOPES";

function parseBooleanFlag(input: string | null | undefined): boolean | undefined {
  if (!input) return undefined;

  const value = input.trim().toLowerCase();
  if (!value) return undefined;
  if (["1", "true", "on", "yes"].includes(value)) return true;
  if (["0", "false", "off", "no"].includes(value)) return false;
  return undefined;
}

function parseScopeList(input: string | null | undefined): Set<BrandScope> {
  if (!input) return new Set<BrandScope>();

  const scopes = new Set<BrandScope>();
  const values = input
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  for (const value of values) {
    if (value === "system" || value === "studio" || value === "panel" || value === "web") {
      scopes.add(value);
    }
  }

  return scopes;
}

function readLocalStorageValue(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function isBrandThemeSemanticRuntimeEnabled(scope: BrandScope): boolean {
  const inCodeScopeOverride = BRAND_THEME_SEMANTIC_RUNTIME_SCOPE_OVERRIDES[scope];
  if (typeof inCodeScopeOverride === "boolean") return inCodeScopeOverride;

  const localStorageScopes = parseScopeList(readLocalStorageValue(LOCAL_STORAGE_SCOPES_KEY));
  if (localStorageScopes.has(scope)) return true;

  const envScopes = parseScopeList(process.env[ENV_SCOPES_KEY] ?? null);
  if (envScopes.has(scope)) return true;

  const localStorageGlobal = parseBooleanFlag(readLocalStorageValue(LOCAL_STORAGE_GLOBAL_KEY));
  if (typeof localStorageGlobal === "boolean") return localStorageGlobal;

  const envGlobal = parseBooleanFlag(process.env[ENV_GLOBAL_KEY] ?? null);
  if (typeof envGlobal === "boolean") return envGlobal;

  return BRAND_THEME_SEMANTIC_RUNTIME_DEFAULT_ENABLED;
}
