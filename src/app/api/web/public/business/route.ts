import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";

function normalizeSlug(value: string | null) {
  return decodeURIComponent(String(value || "")).trim().toLowerCase();
}

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const slug = normalizeSlug(url.searchParams.get("slug"));

  if (!slug) {
    return NextResponse.json({ ok: false, reason: "MISSING_SLUG" }, { status: 400 });
  }

  const business = await Business.findOne({ slug })
    .select({ name: 1, slug: 1, activeHeroVariantKey: 1 })
    .lean();

  if (!business) {
    return NextResponse.json({ ok: false, reason: "BUSINESS_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    business: {
      name: business.name,
      slug: business.slug,
      activeHeroVariantKey: business.activeHeroVariantKey || "default",
    },
  });
}
  