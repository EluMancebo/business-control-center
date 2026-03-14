import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { dbConnect } from "@/lib/db";
import { getSessionFromToken } from "@/lib/auth/session";
import {
  createSystemAssetRepository,
  listSystemAssetsRepository,
} from "@/lib/taller/media/repository";
import {
  buildSystemAssetStorageKey,
  buildSystemMediaListQuery,
  resolveAssetKindFromMime,
  splitMediaListValue,
} from "@/lib/taller/media/service";

export const dynamic = "force-dynamic";

function getToken(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  return req.cookies.get(cookieName)?.value || null;
}

async function getSession(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  // ✅ compatible con función sync o async
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
  const tag = (searchParams.get("tag") || "").trim();
  const statusParam = (searchParams.get("status") || "active").trim();

  const query = buildSystemMediaListQuery(statusParam, tag);
  const items = await listSystemAssetsRepository(query);
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const form = await req.formData();
    const file = form.get("file");

    const label = String(form.get("label") || "").trim() || "Asset";
    const tags = splitMediaListValue(form.get("tag"));
    const allowedIn = splitMediaListValue(form.get("allowedIn"));

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const storageKey = buildSystemAssetStorageKey(label, file.name, Date.now());

    const blob = await put(storageKey, file, {
      access: "public",
      contentType: file.type || undefined,
    });

    const kind = resolveAssetKindFromMime(file.type);

    const created = await createSystemAssetRepository({
      businessId: null,
      scope: "system",
      kind,
      bucket: "vercel-blob",
      key: blob.pathname, // pathname del blob
      url: blob.url,
      label,
      tags,
      allowedIn,
      mime: file.type || "",
      bytes: file.size || 0,
      status: "active",
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}  
