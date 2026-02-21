import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }

  const b = await Business.findOne({ slug }).lean();
  if (!b) {
    return NextResponse.json({ ok: false, error: "Business no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    business: {
      name: b.name,
      slug: b.slug,
      activeHeroVariantKey: b.activeHeroVariantKey || "default",
    },
  });
}  