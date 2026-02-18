 // src/app/api/web/hero/publish/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { HeroConfig } from "@/models/HeroConfig";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

export async function POST() {
  await dbConnect();

  const draft = await HeroConfig.findOne({
    status: "draft",
    variantKey: "default",
  }).lean();

  const toPublish = draft?.data ?? DEFAULT_HERO;

  await HeroConfig.findOneAndUpdate(
    { status: "published", variantKey: "default" },
    { $set: { status: "published", variantKey: "default", data: toPublish } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true });
}
   