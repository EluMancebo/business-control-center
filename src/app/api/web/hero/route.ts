import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { HeroConfig } from "@/models/HeroConfig";
import type { HeroData } from "@/lib/web/hero/types";

const ALLOWED_STATUS = ["draft", "published"] as const;
type HeroStatus = (typeof ALLOWED_STATUS)[number];

const ALLOWED_VARIANTS = ["default", "presetA", "presetB", "presetC"] as const;
type VariantKey = (typeof ALLOWED_VARIANTS)[number];

function isHeroStatus(value: string): value is HeroStatus {
  return (ALLOWED_STATUS as readonly string[]).includes(value);
}

function isVariantKey(value: string): value is VariantKey {
  return (ALLOWED_VARIANTS as readonly string[]).includes(value);
}

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const statusRaw = String(searchParams.get("status") || "").trim();
  const slug = String(searchParams.get("slug") || "").trim().toLowerCase();
  const variantRaw = String(searchParams.get("variantKey") || "").trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }
  if (!isHeroStatus(statusRaw)) {
    return NextResponse.json({ ok: false, error: "status inválido" }, { status: 400 });
  }
  if (!isVariantKey(variantRaw)) {
    return NextResponse.json({ ok: false, error: "variantKey inválido" }, { status: 400 });
  }

  const b = await Business.findOne({ slug }).lean();
  if (!b) {
    return NextResponse.json({ ok: false, error: "Business no encontrado" }, { status: 404 });
  }

  const doc = await HeroConfig.findOne({
    businessId: b._id,
    businessSlug: slug,
    status: statusRaw,
    variantKey: variantRaw,
  }).lean();

  if (!doc) {
    return NextResponse.json({ ok: false, error: "Hero no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: doc.status, data: doc.data as HeroData });
}

export async function PUT(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim().toLowerCase();
  const variantRaw = String(searchParams.get("variantKey") || "").trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }
  if (!isVariantKey(variantRaw)) {
    return NextResponse.json({ ok: false, error: "variantKey inválido" }, { status: 400 });
  }

  const b = await Business.findOne({ slug }).lean();
  if (!b) {
    return NextResponse.json({ ok: false, error: "Business no encontrado" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as HeroData | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  const doc = await HeroConfig.findOneAndUpdate(
    { businessId: b._id, businessSlug: slug, status: "draft", variantKey: variantRaw },
    { $set: { data: body } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true, status: doc?.status ?? "draft", data: (doc?.data ?? body) as HeroData });
}  