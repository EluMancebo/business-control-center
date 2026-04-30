import type { BrandScope } from "@/lib/brand/storage";

function isSystemBrandLabPath(pathname: string): boolean {
  return pathname === "/panel/taller/brand" || pathname.startsWith("/panel/taller/brand/");
}

function isStudioPath(pathname: string): boolean {
  return pathname === "/panel/taller" || pathname.startsWith("/panel/taller/");
}

function isStudioAppearanceSettingsPath(pathname: string): boolean {
  return (
    pathname === "/panel/settings/appearance" ||
    pathname.startsWith("/panel/settings/appearance/")
  );
}

export function resolvePanelBrandHydratorScope(input: {
  isAdmin: boolean;
  pathname: string;
  systemSemanticRuntimeEnabled: boolean;
}): BrandScope {
  if (
    input.isAdmin &&
    input.systemSemanticRuntimeEnabled &&
    isSystemBrandLabPath(input.pathname)
  ) {
    return "system";
  }

  if (isStudioPath(input.pathname) || isStudioAppearanceSettingsPath(input.pathname)) {
    return "studio";
  }

  return "panel";
}
