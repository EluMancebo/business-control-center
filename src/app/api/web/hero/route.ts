//src/app/api/web/hero/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { HeroConfig } from "@/models/HeroConfig";
import { getSessionFromToken } from "@/lib/auth/session";
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

function getToken(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  return req.cookies.get(cookieName)?.value || null;
}

async function getSession(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  return await Promise.resolve(getSessionFromToken(token));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function getString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

function parseHeroData(value: unknown): HeroData | null {
  if (!isRecord(value)) return null;

  const badge = getString(value, "badge").trim();
  const title = getString(value, "title").trim();
  const description = getString(value, "description").trim();

  const primaryCtaLabel = getString(value, "primaryCtaLabel").trim();
  const primaryCtaHref = getString(value, "primaryCtaHref").trim();
  const secondaryCtaLabel = getString(value, "secondaryCtaLabel").trim();
  const secondaryCtaHref = getString(value, "secondaryCtaHref").trim();

  if (
    !badge ||
    !title ||
    !description ||
    !primaryCtaLabel ||
    !primaryCtaHref ||
    !secondaryCtaLabel ||
    !secondaryCtaHref
  ) {
    return null;
  }

  return {
    badge,
    title,
    description,
    primaryCtaLabel,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    backgroundImageUrl: getString(value, "backgroundImageUrl").trim(),
    logoUrl: getString(value, "logoUrl").trim(),
    logoSvg: getString(value, "logoSvg"),
  };
}

async function requireDraftAccess(req: NextRequest, businessId: string) {
  const session = await getSession(req);
  if (!session) return { ok: false as const, status: 401 };

  const isAdmin = session.role === "admin";
  const sessionBusinessId = String(session.businessId || "");

  if (!isAdmin && sessionBusinessId !== businessId) {
    return { ok: false as const, status: 403 };
  }

  return { ok: true as const };
}

function fallbackHeroTemplate(): HeroData {
  return {
    badge: "Nuevo preset",
    title: "Título. Destacado",
    description: "Descripción del hero (editable).",
    primaryCtaLabel: "Pedir cita",
    primaryCtaHref: "#",
    secondaryCtaLabel: "Servicios",
    secondaryCtaHref: "#",
    backgroundImageUrl: "",
    logoUrl: "",
    logoSvg: "",
  };
}

export async function GET(req: NextRequest) {
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

  // ✅ Published es público (web pública)
  if (statusRaw === "published") {
    const doc = await HeroConfig.findOne({
      businessId: b._id,
      businessSlug: slug,
      status: "published",
      variantKey: variantRaw,
    }).lean();

    if (!doc) {
      return NextResponse.json({ ok: false, error: "Hero no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, status: doc.status, data: doc.data as HeroData });
  }

  // ✅ Draft: requiere sesión + multi-tenant
  const access = await requireDraftAccess(req, String(b._id));
  if (!access.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: access.status });
  }

  let doc = await HeroConfig.findOne({
    businessId: b._id,
    businessSlug: slug,
    status: "draft",
    variantKey: variantRaw,
  }).lean();

  // ✅ BOOTSTRAP: si no existe draft del preset, lo creamos clonando default (o template)
  if (!doc) {
    const fromDraftDefault = await HeroConfig.findOne({
      businessId: b._id,
      businessSlug: slug,
      status: "draft",
      variantKey: "default",
    }).lean();

    const fromPublishedDefault = await HeroConfig.findOne({
      businessId: b._id,
      businessSlug: slug,
      status: "published",
      variantKey: "default",
    }).lean();

    const seedData =
      (fromDraftDefault?.data as HeroData | undefined) ??
      (fromPublishedDefault?.data as HeroData | undefined) ??
      fallbackHeroTemplate();

    const created = await HeroConfig.create({
      businessId: b._id,
      businessSlug: slug,
      status: "draft",
      variantKey: variantRaw,
      data: seedData,
    });

    doc = created.toObject();
  }

  return NextResponse.json({ ok: true, status: "draft", data: doc.data as HeroData });
}

export async function PUT(req: NextRequest) {
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

  const access = await requireDraftAccess(req, String(b._id));
  if (!access.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: access.status });
  }

  const raw = (await req.json().catch(() => null)) as unknown;
  const body = parseHeroData(raw);
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