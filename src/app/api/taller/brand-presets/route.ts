import { NextRequest, NextResponse } from "next/server";
import type { BrandMode } from "@/lib/brand/types";
import { requireRole } from "@/lib/auth/serverSession";
import { BusinessBrandConfig } from "@/models/BusinessBrandConfig";
import {
  listBrandPresetVaultItems,
  saveBrandPreset,
  setActiveBrandPreset,
} from "@/lib/brand-theme/preset-persistence";
import { normalizeBusinessSlug } from "@/lib/brand-theme/authorized/model";
import {
  toBrandPresetVaultItem,
  type BrandPresetVaultMode,
  type BrandPresetVaultSnapshot,
} from "@/lib/brand-theme/vault-contract";

export const dynamic = "force-dynamic";

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function asString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function asOptionalString(input: unknown): string | undefined {
  const value = asString(input);
  return value.length > 0 ? value : undefined;
}

function toIdString(input: unknown): string {
  if (typeof input === "string") return input;
  if (isRecord(input) && typeof input.toString === "function") return input.toString();
  return "";
}

function parseMode(input: unknown): BrandMode | undefined {
  if (typeof input !== "string") return undefined;
  if (input === "system" || input === "light" || input === "dark") return input;
  return undefined;
}

async function requireAdminAuth() {
  try {
    await requireRole("admin");
    return true;
  } catch {
    return false;
  }
}

function asVaultMode(input: unknown): BrandPresetVaultMode {
  return input === "light" || input === "dark" || input === "system" ? input : "system";
}

async function getVaultPayload(slug: string): Promise<BrandPresetVaultSnapshot> {
  const [items, config] = await Promise.all([
    listBrandPresetVaultItems(slug),
    BusinessBrandConfig.findOne({ businessSlug: slug }).lean(),
  ]);
  return {
    items,
    mode: asVaultMode(config?.mode),
    activeBrandPresetId: toIdString(config?.activeBrandPresetId) || null,
  };
}

export async function GET(req: NextRequest) {
  const ok = await requireAdminAuth();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slugRaw = asString(new URL(req.url).searchParams.get("slug"));
  const slug = normalizeBusinessSlug(slugRaw);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const payload = await getVaultPayload(slug);
  return NextResponse.json({ ok: true, ...payload });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdminAuth();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(raw)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const slug = normalizeBusinessSlug(asString(raw.slug));
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const saved = await saveBrandPreset({
    id: asOptionalString(raw.id),
    businessSlug: slug,
    name: asOptionalString(raw.name),
    description: asOptionalString(raw.description),
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : undefined,
    sourceMode:
      raw.sourceMode === "manual" || raw.sourceMode === "logo" || raw.sourceMode === "hybrid"
        ? raw.sourceMode
        : undefined,
    harmony: asOptionalString(raw.harmony) as
      | "analogous"
      | "complementary"
      | "split"
      | "triadic"
      | "tetradic"
      | undefined,
    accentStyle: asOptionalString(raw.accentStyle) as
      | "minimal"
      | "balanced"
      | "expressive"
      | undefined,
    typography: asOptionalString(raw.typography) as
      | "editorial"
      | "modern"
      | "classic"
      | "geometric"
      | undefined,
    tokens: isRecord(raw.tokens) ? (raw.tokens as Record<string, string>) : undefined,
    mode: parseMode(raw.mode),
  });

  if (!saved) {
    return NextResponse.json({ ok: false, error: "Unable to save preset" }, { status: 400 });
  }

  const payload = await getVaultPayload(slug);
  return NextResponse.json({ ok: true, item: toBrandPresetVaultItem(saved), ...payload });
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdminAuth();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(raw)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const slug = normalizeBusinessSlug(asString(raw.slug));
  const presetId = asString(raw.presetId);
  if (!slug || !presetId) {
    return NextResponse.json({ ok: false, error: "Missing slug or presetId" }, { status: 400 });
  }

  const updated = await setActiveBrandPreset(slug, presetId, parseMode(raw.mode));
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Preset not found" }, { status: 404 });
  }

  const payload = await getVaultPayload(slug);
  return NextResponse.json({ ok: true, item: toBrandPresetVaultItem(updated), ...payload });
}
