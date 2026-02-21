import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { requireSession } from "@/lib/auth/serverSession";

const ALLOWED = ["default", "presetA", "presetB", "presetC"] as const;
type VariantKey = (typeof ALLOWED)[number];

function isVariantKey(v: string): v is VariantKey {
  return (ALLOWED as readonly string[]).includes(v);
}

export async function PUT(req: Request) {
  await dbConnect();

  // Mantengo sesión obligatoria (capa 2 protegida)
  await requireSession();

  const body = (await req.json().catch(() => ({}))) as {
    variantKey?: string;
    slug?: string;
  };

  const variantKeyRaw = String(body.variantKey || "").trim();
  const slugRaw = String(body.slug || "").trim().toLowerCase();

  if (!isVariantKey(variantKeyRaw)) {
    return NextResponse.json({ ok: false, error: "variantKey inválido" }, { status: 400 });
  }

  if (!slugRaw) {
    return NextResponse.json({ ok: false, error: "Falta slug" }, { status: 400 });
  }

  const updated = await Business.findOneAndUpdate(
    { slug: slugRaw },
    { $set: { activeHeroVariantKey: variantKeyRaw } },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Business no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    business: {
      name: updated.name,
      slug: updated.slug,
      activeHeroVariantKey: updated.activeHeroVariantKey || "default",
    },
  });
}  