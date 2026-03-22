export type SeedChannelMode = "manual" | "auto";

function normalizeHexColor(value: string): string | null {
  const candidate = value.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(candidate)) return null;
  return candidate;
}

export function getSeedChannelMode(input: string): SeedChannelMode {
  return input.trim().length > 0 ? "manual" : "auto";
}

export function resolveSeedInputDisplayValue(args: {
  manualValue: string;
  resolvedValue?: string | null;
  fallbackValue: string;
}): string {
  if (getSeedChannelMode(args.manualValue) === "manual") return args.manualValue;

  const resolved = normalizeHexColor(args.resolvedValue ?? "");
  if (resolved) return resolved;

  const fallback = normalizeHexColor(args.fallbackValue);
  return fallback ?? args.fallbackValue;
}

