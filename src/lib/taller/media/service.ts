import type { AssetItem, AssetKind, AssetListQuery, AssetStatus } from "./types";

type MediaListResponse = {
  ok: boolean;
  items?: AssetItem[];
  error?: string;
};

type MediaItemResponse = {
  ok: boolean;
  item?: AssetItem;
  error?: string;
};

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

export function buildSystemMediaListQuery(statusParam: string, tag: string): AssetListQuery {
  const query: AssetListQuery = {
    businessId: null,
    scope: "system",
    status: parseMediaStatus(statusParam),
  };
  if (tag) query.tags = tag;
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

  return json.items ?? [];
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

  return json.item;
}
