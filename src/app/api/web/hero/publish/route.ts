import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { HeroConfig } from "@/models/HeroConfig";
import { getSessionFromToken } from "@/lib/auth/session";
import type { HeroData } from "@/lib/web/hero/types";

const ALLOWED_VARIANTS = ["default", "presetA", "presetB", "presetC"] as const;
type VariantKey = (typeof ALLOWED_VARIANTS)[number];

function isVariantKey(value: string): value is VariantKey {
  return (ALLOWED_VARIANTS as readonly string[]).includes(value);
}

function getToken(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  return req.cookies.get(cookieName)?.value || null;
}

async function getSession(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  return await Promise.resolve(getSessionFromToken(token));
}

async function requirePublishAccess(req: NextRequest, businessId: string) {
  const session = await getSession(req);
  if (!session) return { ok: false as const, status: 401 };

  const isAdmin = session.role === "admin";
  const sessionBusinessId = String(session.businessId || "");

  if (!isAdmin && sessionBusinessId !== businessId) {
    return { ok: false as const, status: 403 };
  }

  return { ok: true as const };
}

export async function POST(req: NextRequest) {
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

  const access = await requirePublishAccess(req, String(b._id));
  if (!access.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: access.status });
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