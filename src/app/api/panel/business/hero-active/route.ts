//src/app/api/panel/business/hero-active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { HeroPreset } from "@/models/HeroPreset";
import { requireSession } from "@/lib/auth/serverSession";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

async function getActivePresetByKey(variantKey: string) {
  return HeroPreset.findOne({
    key: String(variantKey || "").trim().toLowerCase(),
    status: "active",
  }).lean<{ key: string; label: string } | null>();
}

export async function PUT(req: NextRequest) {
  await dbConnect();

  let session: { role?: string; businessId?: string };
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(raw)) {
    return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  const slugRaw = getString(raw, "slug").trim().toLowerCase();
  const variantKeyRaw = getString(raw, "variantKey").trim().toLowerCase();

  if (!slugRaw) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }

  const preset = await getActivePresetByKey(variantKeyRaw);
  if (!preset) {
    return NextResponse.json({ ok: false, error: "variantKey inválido" }, { status: 400 });
  }

  const business = await Business.findOne({ slug: slugRaw }).lean<{
    _id: unknown;
    name?: string;
    slug: string;
    activeHeroVariantKey?: string;
  } | null>();

  if (!business) {
    return NextResponse.json({ ok: false, error: "Business no encontrado" }, { status: 404 });
  }

  const isAdmin = session.role === "admin";
  const sessionBusinessId = String(session.businessId || "");
  const targetBusinessId = String(business._id);

  if (!isAdmin && sessionBusinessId !== targetBusinessId) {
    const debug =
      process.env.NODE_ENV !== "production"
        ? { role: session.role, sessionBusinessId, targetBusinessId, slug: slugRaw }
        : undefined;

    return NextResponse.json({ ok: false, error: "Forbidden", debug }, { status: 403 });
  }

  const updated = await Business.findOneAndUpdate(
    { slug: slugRaw },
    { $set: { activeHeroVariantKey: variantKeyRaw } },
    { new: true }
  ).lean<{
    name?: string;
    slug: string;
    activeHeroVariantKey?: string;
  } | null>();

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Business no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    business: {
      name: updated.name,
      slug: updated.slug,
      activeHeroVariantKey: updated.activeHeroVariantKey || "default",
    },
  });
} 