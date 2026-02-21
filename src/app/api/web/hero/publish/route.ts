import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { HeroConfig } from "@/models/HeroConfig";
import type { HeroData } from "@/lib/web/hero/types";

const ALLOWED_VARIANTS = ["default", "presetA", "presetB", "presetC"] as const;
type VariantKey = (typeof ALLOWED_VARIANTS)[number];

function isVariantKey(value: string): value is VariantKey {
  return (ALLOWED_VARIANTS as readonly string[]).includes(value);
}

export async function POST(req: Request) {
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

  const draft = await HeroConfig.findOne({
    businessId: b._id,
    businessSlug: slug,
    status: "draft",
    variantKey: variantRaw,
  }).lean();

  if (!draft) {
    return NextResponse.json({ ok: false, error: "No hay draft para publicar" }, { status: 404 });
  }

  const published = await HeroConfig.findOneAndUpdate(
    { businessId: b._id, businessSlug: slug, status: "published", variantKey: variantRaw },
    { $set: { data: draft.data as HeroData } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({
    ok: true,
    status: published?.status ?? "published",
    data: (published?.data ?? draft.data) as HeroData,
  });
}  