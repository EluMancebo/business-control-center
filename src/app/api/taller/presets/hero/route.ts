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

function normalizeKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

function getOptionalString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 20);
}

type HeroDataInput = {
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
};

function parseHeroData(value: unknown): { ok: true; data: HeroDataInput } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: "Missing data" };

  const badge = getString(value, "badge").trim();
  const title = getString(value, "title").trim();
  const description = getString(value, "description").trim();

  const primaryCtaLabel = getString(value, "primaryCtaLabel").trim();
  const primaryCtaHref = getString(value, "primaryCtaHref").trim();
  const secondaryCtaLabel = getString(value, "secondaryCtaLabel").trim();
  const secondaryCtaHref = getString(value, "secondaryCtaHref").trim();

  const required = [
    ["badge", badge],
    ["title", title],
    ["description", description],
    ["primaryCtaLabel", primaryCtaLabel],
    ["primaryCtaHref", primaryCtaHref],
    ["secondaryCtaLabel", secondaryCtaLabel],
    ["secondaryCtaHref", secondaryCtaHref],
  ] as const;

  for (const [field, val] of required) {
    if (!val) return { ok: false, error: `Missing data.${field}` };
  }

  const backgroundImageUrl = getOptionalString(value, "backgroundImageUrl")?.trim() ?? "";
  const logoUrl = getOptionalString(value, "logoUrl")?.trim() ?? "";
  const logoSvg = getOptionalString(value, "logoSvg")?.trim() ?? "";

  return {
    ok: true,
    data: {
      badge,
      title,
      description,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      backgroundImageUrl,
      logoUrl,
      logoSvg,
    },
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const statusParam = (searchParams.get("status") || "active").trim();
  const tag = (searchParams.get("tag") || "").trim();

  const status = statusParam === "archived" ? "archived" : "active";

  const query: { status: "active" | "archived"; tags?: string } = { status };
  if (tag) query.tags = tag;

  const items = await HeroPreset.find(query).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const raw = (await req.json()) as unknown;
    if (!isRecord(raw)) {
      return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
    }

    const key = normalizeKey(getString(raw, "key"));
    const label = getString(raw, "label").trim();
    const description = getString(raw, "description").trim();
    const tags = parseTags(raw["tags"]);

    if (!key) return NextResponse.json({ ok: false, error: "Missing key" }, { status: 400 });
    if (!label) return NextResponse.json({ ok: false, error: "Missing label" }, { status: 400 });

    const parsedData = parseHeroData(raw["data"]);
    if (!parsedData.ok) {
      return NextResponse.json({ ok: false, error: parsedData.error }, { status: 400 });
    }

    const created = await HeroPreset.create({
      key,
      label,
      description,
      tags,
      status: "active",
      data: parsedData.data,
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Create failed";
    if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("e11000")) {
      return NextResponse.json({ ok: false, error: "Key already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}    