// src/app/api/web/hero/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { HeroConfig } from "@/models/HeroConfig";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "published") as
    | "draft"
    | "published";

  const doc = await HeroConfig.findOne({
    status,
    variantKey: "default",
  }).lean();

  return NextResponse.json({
    status,
    data: doc?.data ?? DEFAULT_HERO,
  });
}

export async function PUT(req: Request) {
  await dbConnect();

  const body = await req.json();

  // body debe ser HeroData (mismo shape que DEFAULT_HERO)
  const next = {
    badge: String(body.badge ?? DEFAULT_HERO.badge),
    title: String(body.title ?? DEFAULT_HERO.title),
    description: String(body.description ?? DEFAULT_HERO.description),
    primaryCtaLabel: String(body.primaryCtaLabel ?? DEFAULT_HERO.primaryCtaLabel),
    primaryCtaHref: String(body.primaryCtaHref ?? DEFAULT_HERO.primaryCtaHref),
    secondaryCtaLabel: String(body.secondaryCtaLabel ?? DEFAULT_HERO.secondaryCtaLabel),
    secondaryCtaHref: String(body.secondaryCtaHref ?? DEFAULT_HERO.secondaryCtaHref),
    logoUrl: String(body.logoUrl ?? ""),
  };

  const doc = await HeroConfig.findOneAndUpdate(
    { status: "draft", variantKey: "default" },
    { $set: { status: "draft", variantKey: "default", data: next } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true, draft: doc?.data ?? next });
}
