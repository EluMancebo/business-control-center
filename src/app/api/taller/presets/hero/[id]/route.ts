//src/app/api/taller/presets/hero/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSessionFromToken } from "@/lib/auth/session";
import {
  archiveHeroPresetByIdRepository,
  getHeroPresetByIdRepository,
  updateHeroPresetByIdRepository,
} from "@/lib/taller/presets/hero/repository";
import { parseUpdateHeroPresetBody } from "@/lib/taller/presets/hero/service";

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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { id } = await ctx.params;
  const item = await getHeroPresetByIdRepository(id);

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
    const parsed = parseUpdateHeroPresetBody(raw);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const saved = await updateHeroPresetByIdRepository(id, parsed.data);
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
  const saved = await archiveHeroPresetByIdRepository(id);

  if (!saved) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, item: saved });
}    
