export type PublicBannerPayload = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImageUrl?: string;
  visualVariant?: string;
};

const DEFAULT_PUBLIC_BANNER_PAYLOAD: PublicBannerPayload = {
  title: "Promocion destacada",
  description: "Activa una comunicacion clara y directa para esta campana.",
  ctaLabel: "Ver mas",
  ctaHref: "#",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asOptionalString(value: unknown): string | undefined {
  return asNonEmptyString(value) ?? undefined;
}

function readStringFromRecord(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = asNonEmptyString(record[key]);
    if (value) return value;
  }

  return null;
}

function readNestedPrimaryCta(record: Record<string, unknown>): { label?: string; href?: string } {
  const primaryCta = record.primaryCta;
  if (!isRecord(primaryCta)) return {};

  return {
    label: asOptionalString(primaryCta.label),
    href: asOptionalString(primaryCta.href),
  };
}

function readNestedMediaUrl(record: Record<string, unknown>): string | undefined {
  const media = record.media;
  if (!isRecord(media)) return undefined;
  return asOptionalString(media.url);
}

export function mapBannerToPublicPayload(input: unknown): PublicBannerPayload {
  if (!isRecord(input)) {
    return { ...DEFAULT_PUBLIC_BANNER_PAYLOAD };
  }

  const nestedPrimaryCta = readNestedPrimaryCta(input);

  return {
    title: readStringFromRecord(input, ["title", "headline"]) ?? DEFAULT_PUBLIC_BANNER_PAYLOAD.title,
    description:
      readStringFromRecord(input, ["description", "subheadline"]) ??
      DEFAULT_PUBLIC_BANNER_PAYLOAD.description,
    ctaLabel:
      readStringFromRecord(input, ["ctaLabel", "primaryCtaLabel"]) ??
      nestedPrimaryCta.label ??
      DEFAULT_PUBLIC_BANNER_PAYLOAD.ctaLabel,
    ctaHref:
      readStringFromRecord(input, ["ctaHref", "primaryCtaHref"]) ??
      nestedPrimaryCta.href ??
      DEFAULT_PUBLIC_BANNER_PAYLOAD.ctaHref,
    backgroundImageUrl:
      readStringFromRecord(input, ["backgroundImageUrl"]) ?? readNestedMediaUrl(input),
    visualVariant: readStringFromRecord(input, ["visualVariant", "overlay"]) ?? undefined,
  };
}
