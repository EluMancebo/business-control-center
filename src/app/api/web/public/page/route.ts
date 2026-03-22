// src/app/api/web/public/page/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { PublishedPage } from "@/models/PublishedPage";
import type { HeroData } from "@/lib/web/hero/types";

type PublishedPageLean = {
  businessSlug: string;
  pageKey: string;
  latestVersion: number;
  versions: Array<{
    version: number;
    createdAt?: Date;
    hero: {
      variantKey: string;
      data: HeroData;
    };
  }>;
};

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim().toLowerCase();
  const pageKey = String(searchParams.get("pageKey") || "home").trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }

  const doc = await PublishedPage.findOne({
    businessSlug: slug,
    pageKey,
  }).lean<PublishedPageLean | null>();

  if (!doc) {
    return NextResponse.json({ ok: false, error: "PublishedPage no encontrada" }, { status: 404 });
  }

  const latest =
    doc.versions.find((v) => v.version === doc.latestVersion) ??
    doc.versions[doc.versions.length - 1];

  if (!latest) {
    return NextResponse.json({ ok: false, error: "No hay versiones publicadas" }, { status: 404 });
  }

  return NextResponse.json(
    {
      ok: true,
      page: {
        businessSlug: doc.businessSlug,
        pageKey: doc.pageKey,
        latestVersion: doc.latestVersion,
        version: latest.version,
        hero: latest.hero,
      },
    },
    { status: 200 }
  );
}    
