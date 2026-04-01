import type {
  AssetItem,
  AssetKind,
  AssetListQuery,
  AssetPipelineStage,
  AssetPipelineStatus,
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

const ASSET_VARIANT_KEYS: AssetVariantKey[] = [
  "original",
  "thumbnail",
  "optimized",
  "vectorized-svg",
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

export function normalizeAssetItem(value: unknown): AssetItem {
  const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

  return {
    _id: toStringValue(item._id),
    businessId: toNullableString(item.businessId),
    scope: item.scope === "tenant" ? "tenant" : "system",
    kind:
      item.kind === "svg" || item.kind === "video" || item.kind === "image"
        ? item.kind
        : "image",
    bucket: toStringValue(item.bucket, "vercel-blob"),
    key: toStringValue(item.key),
    url: toStringValue(item.url),
    label: toStringValue(item.label),
    tags: toStringArray(item.tags),
    allowedIn: toStringArray(item.allowedIn),
    mime: toStringValue(item.mime),
    bytes: toNumber(item.bytes),
    width: toNumber(item.width),
    height: toNumber(item.height),
    sourceAssetId: toNullableString(item.sourceAssetId),
    variantKey: toVariantKey(item.variantKey),
    pipelineStatus: toPipelineStatus(item.pipelineStatus),
    pipelineStage: toPipelineStage(item.pipelineStage),
    pipelineError: toStringValue(item.pipelineError, ""),
    status: item.status === "archived" ? "archived" : "active",
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

export function parseMediaStatus(statusParam: string): AssetStatus {
  return statusParam === "archived" ? "archived" : "active";
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
    status: parseMediaStatus(input.statusParam),
  };
  if (tag) query.tags = tag;
  if (allowedIn) query.allowedIn = allowedIn;
  if (pipelineStatus) query.pipelineStatus = pipelineStatus;
  if (variantKey) query.variantKey = variantKey;
  return query;
}

export function resolveAssetKindFromMime(mime: string): AssetKind {
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
  const qs = new URLSearchParams();
  qs.set("scope", "system");
  qs.set("status", "active");
  if (tagFilter.trim()) qs.set("tag", tagFilter.trim());

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
