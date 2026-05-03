import { NextRequest, NextResponse } from "next/server";
import { getSessionFromToken } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db";
import { findSystemAssetByIdRepository } from "@/lib/taller/media/repository";
import { processAssetVariant } from "@/lib/taller/media/pipeline";
import { normalizeAssetItem } from "@/lib/taller/media/service";

const ALLOWED_MANUAL_VARIANTS = ["thumbnail", "optimized", "vectorized-svg", "animated-svg"] as const;

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

function isAllowedVariantKey(value: string): value is (typeof ALLOWED_MANUAL_VARIANTS)[number] {
  return ALLOWED_MANUAL_VARIANTS.includes(value as (typeof ALLOWED_MANUAL_VARIANTS)[number]);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as
    | {
        sourceAssetId?: unknown;
        variantKey?: unknown;
        force?: unknown;
      }
    | null;

  const sourceAssetId = String(payload?.sourceAssetId || "").trim();
  const variantKey = String(payload?.variantKey || "").trim();
  const force = payload?.force === true;

  if (!sourceAssetId) {
    return NextResponse.json({ ok: false, error: "Missing sourceAssetId" }, { status: 400 });
  }

  if (!isAllowedVariantKey(variantKey)) {
    return NextResponse.json({ ok: false, error: "Invalid variantKey" }, { status: 400 });
  }

  await dbConnect();

  const sourceRaw = await findSystemAssetByIdRepository(sourceAssetId);
  if (!sourceRaw) {
    return NextResponse.json({ ok: false, error: "Source asset not found" }, { status: 404 });
  }

  const source = normalizeAssetItem(sourceRaw);
  const hasParent = Boolean(String(source.sourceAssetId || "").trim());
  const isDerivedAsset =
    source.variantKey === "thumbnail" ||
    source.variantKey === "optimized" ||
    source.variantKey === "vectorized-svg" ||
    source.variantKey === "animated-svg";

  if (hasParent || isDerivedAsset) {
    return NextResponse.json(
      { ok: false, error: "Solo se puede generar desde un asset raíz/original" },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await processAssetVariant(source, variantKey, { force });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo completar la generación de la variante solicitada." },
      { status: 500 }
    );
  }

  if (result.pipelineStatus === "failed") {
    return NextResponse.json(
      { ok: false, error: "No se pudo completar la generación de la variante solicitada." },
      { status: 500 }
    );
  }

  if (result.pipelineStatus === "skipped" && !result.generatedVariantKeys.includes(variantKey)) {
    if (variantKey === "vectorized-svg") {
      return NextResponse.json(
        {
          ok: false,
          reason: "not-vectorizable",
          message: "La imagen no cumple criterios para vectorización SVG",
        },
        { status: 422 }
      );
    }

    if (variantKey === "animated-svg") {
      return NextResponse.json(
        {
          ok: false,
          reason: "not-animatable",
          message: result.pipelineError || "El SVG no cumple criterios para animación",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: result.pipelineError || "No se pudo generar la variante solicitada.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: `Variante ${variantKey} generada correctamente.`,
      ...(result.svgAnalysis ? { svgAnalysis: result.svgAnalysis } : {}),
      ...(result.svgAnimation ? { svgAnimation: result.svgAnimation } : {}),
      ...(result.appliedAnimation ? { appliedAnimation: result.appliedAnimation } : {}),
    },
    { status: 200 }
  );
}
