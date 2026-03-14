import type {
  HeroData,
  HeroPresetCreateInput,
  HeroPresetDetailResponse,
  HeroPresetItem,
  HeroPresetListQuery,
  HeroPresetListResponse,
  HeroPresetStatus,
  HeroPresetUpdateInput,
  ParseResult,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

function getOptionalString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function parseTagsRequired(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function parseTagsOptional(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function parseHeroDataForCreate(value: unknown): ParseResult<HeroData> {
  if (!isRecord(value)) return { ok: false, error: "Missing data" };

  const badge = getString(value, "badge").trim();
  const title = getString(value, "title").trim();
  const description = getString(value, "description").trim();
  const primaryCtaLabel = getString(value, "primaryCtaLabel").trim();
  const primaryCtaHref = getString(value, "primaryCtaHref").trim();
  const secondaryCtaLabel = getString(value, "secondaryCtaLabel").trim();
  const secondaryCtaHref = getString(value, "secondaryCtaHref").trim();

  const required = [
    ["badge", badge],
    ["title", title],
    ["description", description],
    ["primaryCtaLabel", primaryCtaLabel],
    ["primaryCtaHref", primaryCtaHref],
    ["secondaryCtaLabel", secondaryCtaLabel],
    ["secondaryCtaHref", secondaryCtaHref],
  ] as const;

  for (const [field, val] of required) {
    if (!val) return { ok: false, error: `Missing data.${field}` };
  }

  return {
    ok: true,
    data: {
      badge,
      title,
      description,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      backgroundImageUrl: getOptionalString(value, "backgroundImageUrl")?.trim() ?? "",
      logoUrl: getOptionalString(value, "logoUrl")?.trim() ?? "",
      logoSvg: getOptionalString(value, "logoSvg")?.trim() ?? "",
    },
  };
}

function parseHeroDataForUpdate(value: unknown): HeroData | null {
  if (!isRecord(value)) return null;
  return {
    badge: getString(value, "badge"),
    title: getString(value, "title"),
    description: getString(value, "description"),
    primaryCtaLabel: getString(value, "primaryCtaLabel"),
    primaryCtaHref: getString(value, "primaryCtaHref"),
    secondaryCtaLabel: getString(value, "secondaryCtaLabel"),
    secondaryCtaHref: getString(value, "secondaryCtaHref"),
    backgroundImageUrl: getString(value, "backgroundImageUrl"),
    logoUrl: getString(value, "logoUrl"),
    logoSvg: getString(value, "logoSvg"),
  };
}

export function normalizeHeroPresetKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function tagsArrayToText(tags?: string[]) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export function tagsTextToArray(tagsText: string) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function buildHeroPresetListQuery(statusParam: string, tag: string): HeroPresetListQuery {
  const status: HeroPresetStatus = statusParam === "archived" ? "archived" : "active";
  if (tag) return { status, tag };
  return { status };
}

export function parseCreateHeroPresetBody(raw: unknown): ParseResult<HeroPresetCreateInput> {
  if (!isRecord(raw)) return { ok: false, error: "Invalid body" };

  const key = normalizeHeroPresetKey(getString(raw, "key"));
  const label = getString(raw, "label").trim();
  const description = getString(raw, "description").trim();
  const tags = parseTagsRequired(raw["tags"]);

  if (!key) return { ok: false, error: "Missing key" };
  if (!label) return { ok: false, error: "Missing label" };

  const parsedData = parseHeroDataForCreate(raw["data"]);
  if (!parsedData.ok) return parsedData;

  return {
    ok: true,
    data: {
      key,
      label,
      description,
      tags,
      status: "active",
      data: parsedData.data,
    },
  };
}

export function parseUpdateHeroPresetBody(raw: unknown): ParseResult<HeroPresetUpdateInput> {
  if (!isRecord(raw)) return { ok: false, error: "Invalid body" };

  const update: HeroPresetUpdateInput = {};

  if (typeof raw["label"] === "string") update.label = raw["label"].trim();
  if (typeof raw["description"] === "string") update.description = raw["description"].trim();

  const tags = parseTagsOptional(raw["tags"]);
  if (tags) update.tags = tags;

  const status = raw["status"];
  if (status === "active" || status === "archived") update.status = status;

  const data = parseHeroDataForUpdate(raw["data"]);
  if (data) update.data = data;

  return { ok: true, data: update };
}

export function mapHeroPresetCreateError(err: unknown): { status: number; error: string } {
  const message = err instanceof Error ? err.message : "Create failed";
  const normalized = message.toLowerCase();
  if (normalized.includes("duplicate") || normalized.includes("e11000")) {
    return { status: 409, error: "Key already exists" };
  }
  return { status: 500, error: message };
}

export async function fetchHeroPresetsClient(status: HeroPresetStatus = "active") {
  const res = await fetch(`/api/taller/presets/hero?status=${status}`, {
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as HeroPresetListResponse | null;

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "No se pudieron cargar los presets");
  }

  return json.items ?? [];
}

export async function fetchHeroPresetByIdClient(id: string) {
  const res = await fetch(`/api/taller/presets/hero/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as HeroPresetDetailResponse | null;

  if (!res.ok || !json?.ok || !json.item) {
    throw new Error(json?.error || "No se pudo cargar el preset");
  }

  return json.item;
}

export async function createHeroPresetClient(payload: {
  key: string;
  label: string;
  description: string;
  tags: string[];
  data: HeroData;
}) {
  const res = await fetch("/api/taller/presets/hero", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as HeroPresetDetailResponse | null;

  if (!res.ok || !json?.ok || !json.item) {
    throw new Error(json?.error || "No se pudo crear el preset");
  }

  return json.item;
}

export async function updateHeroPresetClient(
  id: string,
  payload: {
    label: string;
    description: string;
    tags: string[];
    status: HeroPresetStatus;
    data: HeroData;
  }
) {
  const res = await fetch(`/api/taller/presets/hero/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as HeroPresetDetailResponse | null;

  if (!res.ok || !json?.ok || !json.item) {
    throw new Error(json?.error || "No se pudo actualizar el preset");
  }

  return json.item;
}

export async function archiveHeroPresetClient(id: string): Promise<HeroPresetItem | null> {
  const res = await fetch(`/api/taller/presets/hero/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  const json = (await res.json().catch(() => null)) as HeroPresetDetailResponse | null;

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "No se pudo archivar el preset");
  }

  return json.item ?? null;
}
