
// src/app/api/web/hero/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { HeroConfig } from "@/models/HeroConfig";
import { HeroPreset } from "@/models/HeroPreset";
import { PublishedPage } from "@/models/PublishedPage";
import { getSessionFromToken } from "@/lib/auth/session";
import type { HeroData } from "@/lib/web/hero/types";

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

type PublishedPageLean = {
  _id: unknown;
  latestVersion?: number;
  versions?: Array<{
    version: number;
    createdAt?: Date;
    hero: {
      variantKey: string;
      data: HeroData;
    };
  }>;
};

async function getActivePresetByKey(variantKey: string) {
  return HeroPreset.findOne({
    key: String(variantKey || "").trim().toLowerCase(),
    status: "active",
  }).lean<{ key: string } | null>();
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim().toLowerCase();
  const variantRaw = String(searchParams.get("variantKey") || "").trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }

  const preset = await getActivePresetByKey(variantRaw);
  if (!preset) {
    return NextResponse.json({ ok: false, error: "variantKey inválido" }, { status: 400 });
  }

  const b = await Business.findOne({ slug }).lean<{ _id: unknown; slug: string } | null>();
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
  }).lean<{ data: HeroData } | null>();

  if (!draft) {
    return NextResponse.json({ ok: false, error: "No hay draft para publicar" }, { status: 404 });
  }

  const existing = await PublishedPage.findOne({
    businessId: b._id,
    businessSlug: slug,
    pageKey: "home",
  }).lean<PublishedPageLean | null>();

  const nextVersion = Number(existing?.latestVersion || 0) + 1;

  const updated = await PublishedPage.findOneAndUpdate(
    {
      businessId: b._id,
      businessSlug: slug,
      pageKey: "home",
    },
    {
      $setOnInsert: {
        businessId: b._id,
        businessSlug: slug,
        pageKey: "home",
      },
      $set: {
        latestVersion: nextVersion,
      },
      $push: {
        versions: {
          version: nextVersion,
          createdAt: new Date(),
          hero: {
            variantKey: variantRaw,
            data: draft.data,
          },
        },
      },
    },
    { upsert: true, new: true }
  ).lean<PublishedPageLean | null>();

  const publishedVersion =
    updated?.versions?.find((v) => v.version === nextVersion) ??
    updated?.versions?.[updated.versions.length - 1];

  return NextResponse.json(
    {
      ok: true,
      pageKey: "home",
      latestVersion: updated?.latestVersion ?? nextVersion,
      published: publishedVersion
        ? {
            version: publishedVersion.version,
            hero: publishedVersion.hero,
          }
        : {
            version: nextVersion,
            hero: {
              variantKey: variantRaw,
              data: draft.data,
            },
          },
    },
    { status: 200 }
  );
}
