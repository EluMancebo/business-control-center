import type { BrandScope } from "@/lib/brand/storage";

function isSystemBrandLabPath(pathname: string): boolean {
  return pathname === "/panel/taller/brand" || pathname.startsWith("/panel/taller/brand/");
}

export function resolvePanelBrandHydratorScope(input: {
  isAdmin: boolean;
  pathname: string;
  systemSemanticRuntimeEnabled: boolean;
}): BrandScope {
  if (!input.isAdmin) return "panel";
  if (input.systemSemanticRuntimeEnabled && isSystemBrandLabPath(input.pathname)) {
    return "system";
  }

  return "studio";
}

