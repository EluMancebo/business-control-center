import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { HeroConfig } from "@/models/HeroConfig";
import { DEFAULT_HERO } from "@/lib/web/hero/types";
import { Business } from "@/models/Business";

function normalizeSlug(value: string | null) {
  return decodeURIComponent(String(value || "")).trim().toLowerCase();
}

function normalizeVariantKey(value: string | null) {
  const v = String(value || "").trim();
  return v.length ? v : "default";
}

async function resolveTenant(slug: string) {
  if (!slug) return null;
  const business = await Business.findOne({ slug }).lean();
  if (!business) return null;
  return { businessId: business._id, businessSlug: business.slug };
}

export async function POST(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const slug = normalizeSlug(url.searchParams.get("slug"));
  const variantKey = normalizeVariantKey(url.searchParams.get("variantKey"));

  const tenant = await resolveTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { ok: false, reason: "BUSINESS_NOT_FOUND_OR_MISSING_SLUG" },
      { status: 400 }
    );
  }

  const draft = await HeroConfig.findOne({
    businessId: tenant.businessId,
    businessSlug: tenant.businessSlug,
    status: "draft",
    variantKey,
  }).lean();

  const toPublish = draft?.data ?? DEFAULT_HERO;

  await HeroConfig.findOneAndUpdate(
    {
      businessId: tenant.businessId,
      businessSlug: tenant.businessSlug,
      status: "published",
      variantKey,
    },
    {
      $set: {
        businessId: tenant.businessId,
        businessSlug: tenant.businessSlug,
        status: "published",
        variantKey,
        data: toPublish,
      },
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true, variantKey });
}
 