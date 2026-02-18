import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { HeroConfig } from "@/models/HeroConfig";
import { DEFAULT_HERO } from "@/lib/web/hero/types";
import { Business } from "@/models/Business";

type HeroStatus = "draft" | "published";

function normalizeSlug(value: string | null) {
  return decodeURIComponent(String(value || "")).trim().toLowerCase();
}

function normalizeStatus(value: string | null): HeroStatus {
  return value === "draft" ? "draft" : "published";
}

function normalizeVariantKey(value: string | null) {
  const v = String(value || "").trim();
  return v.length ? v : "default";
}

async function resolveTenant(slug: string) {
  if (!slug) return null;
  const business = await Business.findOne({ slug }).lean();
  if (!business) return null;
  return {
    businessId: business._id,
    businessSlug: business.slug,
    businessName: business.name,
  };
}

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const status = normalizeStatus(url.searchParams.get("status"));
  const slug = normalizeSlug(url.searchParams.get("slug"));
  const variantKey = normalizeVariantKey(url.searchParams.get("variantKey"));

  const tenant = await resolveTenant(slug);

  if (!tenant) {
    return NextResponse.json(
      {
        ok: false,
        reason: "BUSINESS_NOT_FOUND_OR_MISSING_SLUG",
        status,
        variantKey,
        data: DEFAULT_HERO,
      },
      { status: 200 }
    );
  }

  const doc = await HeroConfig.findOne({
    businessId: tenant.businessId,
    businessSlug: tenant.businessSlug,
    status,
    variantKey,
  }).lean();

  return NextResponse.json({
    ok: true,
    status,
    variantKey,
    business: { slug: tenant.businessSlug, name: tenant.businessName },
    data: doc?.data ?? DEFAULT_HERO,
  });
}

export async function PUT(req: Request) {
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

  const body = await req.json();

  const next = {
    badge: String(body.badge ?? DEFAULT_HERO.badge),
    title: String(body.title ?? DEFAULT_HERO.title),
    description: String(body.description ?? DEFAULT_HERO.description),

    primaryCtaLabel: String(body.primaryCtaLabel ?? DEFAULT_HERO.primaryCtaLabel),
    primaryCtaHref: String(body.primaryCtaHref ?? DEFAULT_HERO.primaryCtaHref),
    secondaryCtaLabel: String(body.secondaryCtaLabel ?? DEFAULT_HERO.secondaryCtaLabel),
    secondaryCtaHref: String(body.secondaryCtaHref ?? DEFAULT_HERO.secondaryCtaHref),

    logoUrl: String(body.logoUrl ?? DEFAULT_HERO.logoUrl ?? ""),
    backgroundImageUrl: String(body.backgroundImageUrl ?? ""),
    logoSvg: String(body.logoSvg ?? ""),
  };

  const doc = await HeroConfig.findOneAndUpdate(
    {
      businessId: tenant.businessId,
      businessSlug: tenant.businessSlug,
      status: "draft",
      variantKey,
    },
    {
      $set: {
        businessId: tenant.businessId,
        businessSlug: tenant.businessSlug,
        status: "draft",
        variantKey,
        data: next,
      },
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true, variantKey, draft: doc?.data ?? next });
}


