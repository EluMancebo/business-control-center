//src/app/api/taller/presets/hero/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSessionFromToken } from "@/lib/auth/session";
import {
  createHeroPresetRepository,
  listHeroPresetsRepository,
} from "@/lib/taller/presets/hero/repository";
import {
  buildHeroPresetListQuery,
  mapHeroPresetCreateError,
  parseCreateHeroPresetBody,
} from "@/lib/taller/presets/hero/service";

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

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const statusParam = (searchParams.get("status") || "active").trim();
  const tag = (searchParams.get("tag") || "").trim();

  const query = buildHeroPresetListQuery(statusParam, tag);
  const items = await listHeroPresetsRepository(query);
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
    const parsed = parseCreateHeroPresetBody(raw);
    if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

    const created = await createHeroPresetRepository(parsed.data);

    return NextResponse.json({ ok: true, item: created });
  } catch (err: unknown) {
    const mapped = mapHeroPresetCreateError(err);
    return NextResponse.json({ ok: false, error: mapped.error }, { status: mapped.status });
  }
}    
