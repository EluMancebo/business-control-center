import type {
  AssetItem,
  AssetKind,
  AssetListQuery,
  AssetScope,
  MediaAllowedComponent,
  MediaAssetRole,
  MediaFormatKind,
  MediaOrientation,
  AssetPipelineStage,
  AssetPipelineStatus,
  MediaPreferredUsage,
  ProcessedAssetResult,
  MediaReviewStatus,
  AssetStatus,
  AssetVariantKey,
} from "./types";

type MediaListResponse = {
  ok: boolean;
  items?: unknown[];
  error?: string;
};

type MediaItemResponse = {
  ok: boolean;
  item?: unknown;
  error?: string;
};

type MediaVariantRequestResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
  error?: string;
  svgAnalysis?: ProcessedAssetResult["svgAnalysis"];
  svgAnimation?: ProcessedAssetResult["svgAnimation"];
};

export type MediaVariantRequestResult = {
  ok: boolean;
  message: string;
  reason?: string;
  svgAnalysis?: ProcessedAssetResult["svgAnalysis"];
  svgAnimation?: ProcessedAssetResult["svgAnimation"];
};

const ASSET_VARIANT_KEYS: AssetVariantKey[] = [
  "original",
  "thumbnail",
  "optimized",
  "vectorized-svg",
  "animated-svg",
];
const ASSET_PIPELINE_STATUSES: AssetPipelineStatus[] = [
  "queued",
  "processing",
  "ready",
  "failed",
  "skipped",
];
const ASSET_PIPELINE_STAGES: AssetPipelineStage[] = [
  "ingest",
  "analyze",
  "derive",
  "vectorize",
  "done",
];
const MEDIA_FORMAT_KINDS: MediaFormatKind[] = ["image", "svg", "video", "pdf"];
const MEDIA_ASSET_ROLES: MediaAssetRole[] = [
  "logo",
  "icon",
  "photo",
  "illustration",
  "texture",
  "document",
  "video",
];
const MEDIA_PREFERRED_USAGES: MediaPreferredUsage[] = [
  "hero-background",
  "hero-logo",
  "navbar-logo",
  "footer-mark",
  "banner-background",
  "popup-media",
  "gallery-item",
  "social-asset",
  "card-media",
  "document-embed",
];
const MEDIA_ALLOWED_COMPONENTS: MediaAllowedComponent[] = [
  "hero",
  "banner",
  "header",
  "footer",
  "popup",
  "card",
  "gallery",
  "social",
  "document",
];
const MEDIA_REVIEW_STATUSES: MediaReviewStatus[] = [
  "draft",
  "reviewed",
  "approved",
  "rejected",
  "deprecated",
];
const MEDIA_ORIENTATIONS: MediaOrientation[] = ["landscape", "portrait", "square", "unknown"];
const LEGACY_ALLOWED_IN_TO_CANONICAL: Record<
  string,
  { component: MediaAllowedComponent; usage: MediaPreferredUsage }
> = {
  "hero.background": { component: "hero", usage: "hero-background" },
  "home.hero.background": { component: "hero", usage: "hero-background" },
  "hero.logo": { component: "hero", usage: "hero-logo" },
  "hero.media": { component: "hero", usage: "hero-background" },
  "navbar.logo": { component: "header", usage: "navbar-logo" },
  "brand.logo.header": { component: "header", usage: "navbar-logo" },
  "footer.logo": { component: "footer", usage: "footer-mark" },
  "footer.background": { component: "footer", usage: "footer-mark" },
  "brand.logo.footer": { component: "footer", usage: "footer-mark" },
  "banner.media": { component: "banner", usage: "banner-background" },
  "popup.media": { component: "popup", usage: "popup-media" },
  "popup.campaign.cover": { component: "popup", usage: "popup-media" },
  "home.gallery.item": { component: "gallery", usage: "gallery-item" },
  "catalog.product.gallery": { component: "gallery", usage: "gallery-item" },
  "social.media": { component: "social", usage: "social-asset" },
  "card.media": { component: "card", usage: "card-media" },
  "home.services.card": { component: "card", usage: "card-media" },
  "catalog.product.cover": { component: "card", usage: "card-media" },
  "news.item.cover": { component: "card", usage: "card-media" },
  "pdf.media": { component: "document", usage: "document-embed" },
};

function toNumber(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return value;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toVariantKey(value: unknown): AssetVariantKey {
  const normalized = String(value ?? "").trim();
  if (ASSET_VARIANT_KEYS.includes(normalized as AssetVariantKey)) {
    return normalized as AssetVariantKey;
  }
  return "original";
}

function toPipelineStatus(value: unknown): AssetPipelineStatus {
  const normalized = String(value ?? "").trim();
  if (ASSET_PIPELINE_STATUSES.includes(normalized as AssetPipelineStatus)) {
    return normalized as AssetPipelineStatus;
  }
  return "ready";
}

function toPipelineStage(value: unknown): AssetPipelineStage {
  const normalized = String(value ?? "").trim();
  if (ASSET_PIPELINE_STAGES.includes(normalized as AssetPipelineStage)) {
    return normalized as AssetPipelineStage;
  }
  return "done";
}

function toOptionalDateString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return undefined;
}

function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return allowed.includes(value as T);
}

function normalizeFormatKindFromMime(mime: string): MediaFormatKind {
  const normalizedMime = String(mime || "").trim().toLowerCase();
  if (normalizedMime.includes("pdf")) return "pdf";
  if (normalizedMime.includes("svg")) return "svg";
  if (normalizedMime.startsWith("video/")) return "video";
  return "image";
}

function toNullableBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return undefined;
}

function toCanonicalAllowedComponents(value: unknown): MediaAllowedComponent[] | undefined {
  const rawList = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value
          .split(/[,\s]+/g)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  if (rawList.length === 0) return undefined;
  const normalized = rawList
    .map((item) => String(item || "").trim().toLowerCase())
    .filter((item): item is MediaAllowedComponent => isOneOf(item, MEDIA_ALLOWED_COMPONENTS));
  return Array.from(new Set(normalized));
}

function toCanonicalPreferredUsage(value: unknown): MediaPreferredUsage | null | undefined {
  if (value === null) return null;
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return undefined;
  if (isOneOf(normalized, MEDIA_PREFERRED_USAGES)) return normalized;
  return undefined;
}

function toCanonicalReviewStatus(value: unknown): MediaReviewStatus | undefined {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return undefined;
  if (isOneOf(normalized, MEDIA_REVIEW_STATUSES)) return normalized;
  return undefined;
}

function toCanonicalAssetRole(value: unknown): MediaAssetRole | undefined {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return undefined;
  if (isOneOf(normalized, MEDIA_ASSET_ROLES)) return normalized;
  return undefined;
}

function toCanonicalOrientation(value: unknown): MediaOrientation | undefined {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return undefined;
  if (isOneOf(normalized, MEDIA_ORIENTATIONS)) return normalized;
  return undefined;
}

function toCanonicalFormatKind(value: unknown): MediaFormatKind | undefined {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return undefined;
  if (isOneOf(normalized, MEDIA_FORMAT_KINDS)) return normalized;
  return undefined;
}

function extractCanonicalFromAllowedIn(
  allowedIn: string[]
): { allowedComponents: MediaAllowedComponent[]; preferredUsage: MediaPreferredUsage | null } {
  const components = new Set<MediaAllowedComponent>();
  let preferredUsage: MediaPreferredUsage | null = null;

  allowedIn.forEach((raw) => {
    const normalized = String(raw || "").trim().toLowerCase();
    if (!normalized) return;
    const mapped = LEGACY_ALLOWED_IN_TO_CANONICAL[normalized];
    if (!mapped) return;
    components.add(mapped.component);
    if (!preferredUsage) preferredUsage = mapped.usage;
  });

  return {
    allowedComponents: Array.from(components),
    preferredUsage,
  };
}

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function toAspectRatio(width: number, height: number): string | null {
  if (width <= 0 || height <= 0) return null;
  const gcd = greatestCommonDivisor(width, height);
  return `${Math.max(1, Math.round(width / gcd))}:${Math.max(1, Math.round(height / gcd))}`;
}

function inferOrientation(width: number, height: number): MediaOrientation {
  if (width <= 0 || height <= 0) return "unknown";
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

function readReviewStatusFromTags(tags: string[]): MediaReviewStatus | undefined {
  const match = tags
    .map((tag) => String(tag || "").trim().toLowerCase())
    .find((tag) => tag.startsWith("review:"));
  if (!match) return undefined;
  return toCanonicalReviewStatus(match.slice("review:".length).trim());
}

function readPreferredUsageFromTags(tags: string[]): MediaPreferredUsage | undefined {
  const match = tags
    .map((tag) => String(tag || "").trim().toLowerCase())
    .find((tag) => tag.startsWith("usage:"));
  if (!match) return undefined;
  const value = match.slice("usage:".length).trim();
  return isOneOf(value, MEDIA_PREFERRED_USAGES) ? value : undefined;
}

function inferAssetRole(args: {
  explicitRole?: MediaAssetRole;
  formatKind: MediaFormatKind;
  tags: string[];
  label: string;
  allowedIn: string[];
}): MediaAssetRole {
  if (args.explicitRole) return args.explicitRole;
  if (args.formatKind === "pdf") return "document";
  if (args.formatKind === "video") return "video";

  const lowerTags = args.tags.map((tag) => String(tag || "").trim().toLowerCase());
  const text = `${args.label} ${args.allowedIn.join(" ")} ${lowerTags.join(" ")}`.toLowerCase();

  const hasVisualLogo = lowerTags.includes("visual:logo");
  const hasVisualIcon = lowerTags.includes("visual:icon");
  const hasVisualTexture = lowerTags.includes("visual:texture");
  const hasVisualIllustration = lowerTags.includes("visual:illustration");
  const hasVisualPhoto = lowerTags.includes("visual:photo");

  if (hasVisualLogo || text.includes("logo")) return "logo";
  if (hasVisualIcon || text.includes("icon")) return "icon";
  if (hasVisualTexture || text.includes("texture")) return "texture";
  if (hasVisualIllustration || args.formatKind === "svg") return "illustration";
  if (hasVisualPhoto) return "photo";

  return "photo";
}

export type CanonicalMediaMetadataInput = {
  formatKind?: unknown;
  assetRole?: unknown;
  preferredUsage?: unknown;
  allowedComponents?: unknown;
  reviewStatus?: unknown;
  orientation?: unknown;
  aspectRatio?: unknown;
  brandCritical?: unknown;
  vectorizable?: unknown;
  animable?: unknown;
};

export type CanonicalMediaMetadata = {
  formatKind?: MediaFormatKind;
  assetRole?: MediaAssetRole;
  preferredUsage?: MediaPreferredUsage | null;
  allowedComponents?: MediaAllowedComponent[];
  reviewStatus?: MediaReviewStatus;
  orientation?: MediaOrientation;
  aspectRatio?: string | null;
  brandCritical?: boolean;
  vectorizable?: boolean;
  animable?: boolean;
};

export function parseCanonicalMediaMetadata(input: CanonicalMediaMetadataInput): CanonicalMediaMetadata {
  const next: CanonicalMediaMetadata = {};

  const formatKind = toCanonicalFormatKind(input.formatKind);
  const assetRole = toCanonicalAssetRole(input.assetRole);
  const preferredUsage = toCanonicalPreferredUsage(input.preferredUsage);
  const allowedComponents = toCanonicalAllowedComponents(input.allowedComponents);
  const reviewStatus = toCanonicalReviewStatus(input.reviewStatus);
  const orientation = toCanonicalOrientation(input.orientation);
  const aspectRatioRaw = String(input.aspectRatio || "").trim();
  const brandCritical = toNullableBoolean(input.brandCritical);
  const vectorizable = toNullableBoolean(input.vectorizable);
  const animable = toNullableBoolean(input.animable);

  if (formatKind) next.formatKind = formatKind;
  if (assetRole) next.assetRole = assetRole;
  if (preferredUsage !== undefined) next.preferredUsage = preferredUsage;
  if (allowedComponents) next.allowedComponents = allowedComponents;
  if (reviewStatus) next.reviewStatus = reviewStatus;
  if (orientation) next.orientation = orientation;
  if (aspectRatioRaw) next.aspectRatio = aspectRatioRaw;
  if (brandCritical !== undefined) next.brandCritical = brandCritical;
  if (vectorizable !== undefined) next.vectorizable = vectorizable;
  if (animable !== undefined) next.animable = animable;

  return next;
}

export function normalizeAssetItem(value: unknown): AssetItem {
  const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const kind =
    item.kind === "svg" || item.kind === "video" || item.kind === "image" || item.kind === "pdf"
      ? item.kind
      : "image";
  const tags = toStringArray(item.tags);
  const allowedIn = toStringArray(item.allowedIn);
  const width = toNumber(item.width);
  const height = toNumber(item.height);
  const status: AssetStatus = item.status === "archived" ? "archived" : "active";
  const canonicalInput = parseCanonicalMediaMetadata({
    formatKind: item.formatKind,
    assetRole: item.assetRole,
    preferredUsage: item.preferredUsage,
    allowedComponents: item.allowedComponents,
    reviewStatus: item.reviewStatus,
    orientation: item.orientation,
    aspectRatio: item.aspectRatio,
    brandCritical: item.brandCritical,
    vectorizable: item.vectorizable,
    animable: item.animable,
  });
  const inferredFormatKind = canonicalInput.formatKind ?? kind ?? normalizeFormatKindFromMime(toStringValue(item.mime));
  const allowedInCanonical = extractCanonicalFromAllowedIn(allowedIn);
  const preferredUsage =
    canonicalInput.preferredUsage ??
    readPreferredUsageFromTags(tags) ??
    allowedInCanonical.preferredUsage;
  const assetRole = inferAssetRole({
    explicitRole: canonicalInput.assetRole,
    formatKind: inferredFormatKind,
    tags,
    label: toStringValue(item.label),
    allowedIn,
  });
  const reviewStatus =
    canonicalInput.reviewStatus ??
    readReviewStatusFromTags(tags) ??
    (status === "archived" ? "deprecated" : "draft");
  const orientation = canonicalInput.orientation ?? inferOrientation(width, height);
  const aspectRatio = canonicalInput.aspectRatio ?? toAspectRatio(width, height);
  const brandCritical =
    canonicalInput.brandCritical ??
    (assetRole === "logo" ||
      preferredUsage === "hero-logo" ||
      preferredUsage === "navbar-logo" ||
      preferredUsage === "footer-mark");
  const vectorizable =
    canonicalInput.vectorizable ??
    (inferredFormatKind === "svg" || assetRole === "logo" || assetRole === "icon");
  const animable = canonicalInput.animable ?? inferredFormatKind === "video";
  const sourceAssetId = toNullableString(item.sourceAssetId);
  const variantKey = toVariantKey(item.variantKey);
  const isDerivative = Boolean(sourceAssetId) || variantKey !== "original";
  const allowedComponents =
    canonicalInput.allowedComponents && canonicalInput.allowedComponents.length > 0
      ? canonicalInput.allowedComponents
      : allowedInCanonical.allowedComponents;

  return {
    _id: toStringValue(item._id),
    businessId: toNullableString(item.businessId),
    scope: item.scope === "tenant" ? "tenant" : "system",
    kind,
    formatKind: inferredFormatKind,
    assetRole,
    preferredUsage: preferredUsage ?? null,
    allowedComponents,
    reviewStatus,
    orientation,
    aspectRatio,
    brandCritical,
    vectorizable,
    animable,
    isDerivative,
    bucket: toStringValue(item.bucket, "vercel-blob"),
    key: toStringValue(item.key),
    url: toStringValue(item.url),
    label: toStringValue(item.label),
    tags,
    allowedIn,
    mime: toStringValue(item.mime),
    bytes: toNumber(item.bytes),
    width,
    height,
    sourceAssetId,
    variantKey,
    pipelineStatus: toPipelineStatus(item.pipelineStatus),
    pipelineStage: toPipelineStage(item.pipelineStage),
    pipelineError: toStringValue(item.pipelineError, ""),
    status,
    createdAt: toOptionalDateString(item.createdAt),
    updatedAt: toOptionalDateString(item.updatedAt),
  };
}

export function splitMediaListValue(value: unknown): string[] {
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function parseMediaStatus(statusParam: string): AssetStatus | undefined {
  const normalized = String(statusParam || "").trim().toLowerCase();
  if (!normalized || normalized === "all") return undefined;
  if (normalized === "archived") return "archived";
  return "active";
}

export function parseMediaScopeParam(scopeParam: string): AssetScope | undefined {
  const normalized = String(scopeParam || "").trim().toLowerCase();
  if (!normalized || normalized === "all") return undefined;
  if (normalized === "tenant") return "tenant";
  if (normalized === "system") return "system";
  return undefined;
}

export type MediaListCanonicalFilterInput = {
  search?: string;
  scope?: string;
  status?: string;
  assetRole?: string;
  formatKind?: string;
  allowedComponent?: string;
  reviewStatus?: string;
  preferredUsage?: string;
  orientation?: string;
};

export function applyMediaListCanonicalFilters(
  items: AssetItem[],
  input: MediaListCanonicalFilterInput
): AssetItem[] {
  const search = String(input.search || "").trim().toLowerCase();
  const scope = parseMediaScopeParam(input.scope || "");
  const status = parseMediaStatus(input.status || "");
  const assetRole = toCanonicalAssetRole(input.assetRole);
  const formatKind = toCanonicalFormatKind(input.formatKind);
  const allowedComponent = toCanonicalAllowedComponents(input.allowedComponent)?.[0];
  const reviewStatus = toCanonicalReviewStatus(input.reviewStatus);
  const preferredUsage = toCanonicalPreferredUsage(input.preferredUsage);
  const orientation = toCanonicalOrientation(input.orientation);

  return items.filter((item) => {
    if (search) {
      const haystack =
        `${item.label} ${item.tags.join(" ")} ${item.allowedIn.join(" ")} ${item.assetRole} ${item.formatKind} ${item.preferredUsage ?? ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (scope && item.scope !== scope) return false;
    if (status && item.status !== status) return false;
    if (assetRole && item.assetRole !== assetRole) return false;
    if (formatKind && item.formatKind !== formatKind) return false;
    if (allowedComponent && !item.allowedComponents.includes(allowedComponent)) return false;
    if (reviewStatus && item.reviewStatus !== reviewStatus) return false;
    if (preferredUsage !== undefined && preferredUsage !== null && item.preferredUsage !== preferredUsage)
      return false;
    if (orientation && item.orientation !== orientation) return false;
    return true;
  });
}

export function parseAssetPipelineStatusParam(
  value: string
): AssetPipelineStatus | undefined {
  const normalized = String(value || "").trim();
  if (!normalized) return undefined;
  if (ASSET_PIPELINE_STATUSES.includes(normalized as AssetPipelineStatus)) {
    return normalized as AssetPipelineStatus;
  }
  return undefined;
}

export function parseAssetVariantKeyParam(value: string): AssetVariantKey | undefined {
  const normalized = String(value || "").trim();
  if (!normalized) return undefined;
  if (ASSET_VARIANT_KEYS.includes(normalized as AssetVariantKey)) {
    return normalized as AssetVariantKey;
  }
  return undefined;
}

export function buildSystemMediaListQuery(input: {
  statusParam: string;
  tag?: string;
  allowedIn?: string;
  pipelineStatus?: string;
  variantKey?: string;
}): AssetListQuery {
  const tag = String(input.tag || "").trim();
  const allowedIn = String(input.allowedIn || "").trim();
  const pipelineStatus = parseAssetPipelineStatusParam(input.pipelineStatus || "");
  const variantKey = parseAssetVariantKeyParam(input.variantKey || "");

  const query: AssetListQuery = {
    businessId: null,
    scope: "system",
  };
  const status = parseMediaStatus(input.statusParam);
  if (status) query.status = status;
  if (tag) query.tags = tag;
  if (allowedIn) query.allowedIn = allowedIn;
  if (pipelineStatus) query.pipelineStatus = pipelineStatus;
  if (variantKey) query.variantKey = variantKey;
  return query;
}

export function resolveAssetKindFromMime(mime: string): AssetKind {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("svg")) return "svg";
  if (mime.startsWith("video/")) return "video";
  return "image";
}

export function buildSystemAssetStorageKey(label: string, fileName: string, nowMs: number) {
  const ext = (fileName.split(".").pop() || "bin").toLowerCase();
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 60) || "asset";
  return `system/${nowMs}-${safeLabel}.${ext}`;
}

export function formatBytes(bytes: number) {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export async function fetchSystemMediaClient(tagFilter: string): Promise<AssetItem[]> {
  return fetchSystemMediaClientByQuery({ tag: tagFilter });
}

export async function fetchSystemMediaClientByQuery(input: {
  search?: string;
  tag?: string;
  formatKind?: MediaFormatKind;
  assetRole?: MediaAssetRole;
  allowedComponent?: MediaAllowedComponent;
  reviewStatus?: MediaReviewStatus;
  preferredUsage?: MediaPreferredUsage;
  orientation?: MediaOrientation;
  scope?: AssetScope | "all";
  allowedIn?: string;
  pipelineStatus?: AssetPipelineStatus;
  variantKey?: AssetVariantKey;
  status?: AssetStatus | "all";
}): Promise<AssetItem[]> {
  const qs = new URLSearchParams();
  qs.set("scope", input.scope ?? "system");
  qs.set("status", input.status ?? "active");
  if (String(input.search || "").trim()) qs.set("search", String(input.search).trim());
  if (String(input.tag || "").trim()) qs.set("tag", String(input.tag).trim());
  if (input.formatKind) qs.set("formatKind", input.formatKind);
  if (input.assetRole) qs.set("assetRole", input.assetRole);
  if (input.allowedComponent) qs.set("allowedComponent", input.allowedComponent);
  if (input.reviewStatus) qs.set("reviewStatus", input.reviewStatus);
  if (input.preferredUsage) qs.set("preferredUsage", input.preferredUsage);
  if (input.orientation) qs.set("orientation", input.orientation);
  if (String(input.allowedIn || "").trim()) qs.set("allowedIn", String(input.allowedIn).trim());
  if (input.pipelineStatus) qs.set("pipelineStatus", input.pipelineStatus);
  if (input.variantKey) qs.set("variantKey", input.variantKey);

  const res = await fetch(`/api/taller/media?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as MediaListResponse | null;
  if (!res.ok || !json?.ok) throw new Error(json?.error || "Error loading assets");

  return (json.items ?? []).map((item) => normalizeAssetItem(item));
}

export async function uploadSystemMediaClient(args: {
  file: File;
  label: string;
  tags: string;
  allowedIn: string;
}): Promise<AssetItem> {
  const form = new FormData();
  form.set("file", args.file);
  if (args.label.trim()) form.set("label", args.label.trim());
  if (args.tags.trim()) form.set("tag", args.tags.trim());
  if (args.allowedIn.trim()) form.set("allowedIn", args.allowedIn.trim());

  const res = await fetch("/api/taller/media", {
    method: "POST",
    body: form,
  });

  const json = (await res.json().catch(() => null)) as MediaItemResponse | null;
  if (!res.ok || !json?.ok || !json.item) throw new Error(json?.error || "Upload failed");

  return normalizeAssetItem(json.item);
}

export async function updateSystemMediaMetadataClient(args: {
  id: string;
  label: string;
  tags: string;
  allowedIn: string;
}): Promise<AssetItem> {
  const id = args.id.trim();
  if (!id) throw new Error("Missing asset id");

  const label = args.label.trim();
  if (!label) throw new Error("El label es obligatorio.");

  const res = await fetch(`/api/taller/media?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label,
      tags: args.tags,
      allowedIn: args.allowedIn,
    }),
  });

  const json = (await res.json().catch(() => null)) as MediaItemResponse | null;
  if (!res.ok || !json?.ok || !json.item) throw new Error(json?.error || "Update failed");

  return normalizeAssetItem(json.item);
}

export async function deleteSystemMediaClient(id: string): Promise<void> {
  const cleanId = id.trim();
  if (!cleanId) throw new Error("Missing asset id");

  const res = await fetch(`/api/taller/media?id=${encodeURIComponent(cleanId)}`, {
    method: "DELETE",
  });

  const json = (await res.json().catch(() => null)) as MediaItemResponse | null;
  if (!res.ok || !json?.ok) throw new Error(json?.error || "Delete failed");
}

export async function requestSystemAssetVariantClient(args: {
  sourceAssetId: string;
  variantKey: Exclude<AssetVariantKey, "original">;
}): Promise<MediaVariantRequestResult> {
  const sourceAssetId = args.sourceAssetId.trim();
  if (!sourceAssetId) throw new Error("Missing source asset id");

  const res = await fetch("/api/taller/media/variants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceAssetId,
      variantKey: args.variantKey,
    }),
  });

  const json = (await res.json().catch(() => null)) as MediaVariantRequestResponse | null;
  if (res.status === 422) {
    return {
      ok: false,
      reason: toStringValue(json?.reason, ""),
      message: toStringValue(
        json?.message || json?.error,
        "No se pudo generar la variante solicitada."
      ),
      svgAnalysis: json?.svgAnalysis,
      svgAnimation: json?.svgAnimation,
    };
  }

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "No se pudo solicitar la variante");
  }

  return {
    ok: true,
    message: toStringValue(json.message, "Variante generada correctamente."),
    reason: json.reason,
    svgAnalysis: json.svgAnalysis,
    svgAnimation: json.svgAnimation,
  };
}
