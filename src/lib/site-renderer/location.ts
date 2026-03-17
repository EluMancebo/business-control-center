import type {
  LocationSectionPayload,
  RenderableLocationSection,
  RenderableUnsupportedSection,
  RendererInputSection,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized || undefined;
}

function normalizeVariant(variant: string | undefined): string {
  if (!variant) return "default";
  const normalized = variant.trim().toLowerCase();
  return normalized || "default";
}

export function parseLocationSectionPayload(payload: unknown): LocationSectionPayload | null {
  if (!isRecord(payload)) return null;

  const parsed: LocationSectionPayload = {
    address: getOptionalString(payload, "address"),
    phone: getOptionalString(payload, "phone"),
    email: getOptionalString(payload, "email"),
    mapsUrl: getOptionalString(payload, "mapsUrl"),
  };

  if (!parsed.address && !parsed.phone && !parsed.email && !parsed.mapsUrl) {
    return null;
  }

  return parsed;
}

export function renderLocationSection(
  section: RendererInputSection
): RenderableLocationSection | RenderableUnsupportedSection {
  const payload = parseLocationSectionPayload(section.payload);
  const variant = normalizeVariant(section.variant);

  if (!payload) {
    return {
      type: "unsupported",
      sectionId: "location",
      variant,
      reason: "invalid_payload",
    };
  }

  return {
    type: "location",
    sectionId: "location",
    variant,
    payload,
  };
}
