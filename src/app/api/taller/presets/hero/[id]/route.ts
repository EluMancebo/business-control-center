import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { HeroPreset } from "@/models/HeroPreset";
import { getSessionFromToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function getToken(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  return req.cookies.get(cookieName)?.value || null;
}

async function getSession(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  return await Promise.resolve(getSessionFromToken(token));
}

async function requireAdmin(req: NextRequest) {
  const session = await getSession(req);
  const ok = session?.role === "admin";
  return { ok, session };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

function parseTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function parseHeroData(value: unknown) {
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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { id } = await ctx.params;
  const item = await HeroPreset.findById(id).lean();

  if (!item) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await ctx.params;

    const raw = (await req.json()) as unknown;
    if (!isRecord(raw)) {
      return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};

    if (typeof raw["label"] === "string") update["label"] = raw["label"].trim();
    if (typeof raw["description"] === "string") update["description"] = raw["description"].trim();

    const tags = parseTags(raw["tags"]);
    if (tags) update["tags"] = tags;

    const status = raw["status"];
    if (status === "active" || status === "archived") update["status"] = status;

    const data = parseHeroData(raw["data"]);
    if (data) update["data"] = data;

    const saved = await HeroPreset.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!saved) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, item: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { id } = await ctx.params;
  const saved = await HeroPreset.findByIdAndUpdate(id, { status: "archived" }, { new: true }).lean();

  if (!saved) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, item: saved });
}    