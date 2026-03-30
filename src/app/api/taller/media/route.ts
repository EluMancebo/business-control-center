import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { dbConnect } from "@/lib/db";
import { getSessionFromToken } from "@/lib/auth/session";
import {
  createSystemAssetRepository,
  deleteSystemAssetRepository,
  findSystemAssetByIdRepository,
  listSystemAssetsRepository,
  updateSystemAssetMetadataRepository,
} from "@/lib/taller/media/repository";
import {
  buildSystemAssetStorageKey,
  buildSystemMediaListQuery,
  normalizeAssetItem,
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
  const items = (await listSystemAssetsRepository(query)).map((item) => normalizeAssetItem(item));
  return NextResponse.json({ ok: true, items });
}

function getBlobReadWriteToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN environment variable. Set it in .env.local (or in Vercel env vars) to upload files to Vercel Blob."
    );
  }
  return token;
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
      token: getBlobReadWriteToken(),
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

    return NextResponse.json({ ok: true, item: normalizeAssetItem(created) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}  

function readAssetIdFromRequest(req: NextRequest): string {
  const { searchParams } = new URL(req.url);
  return (searchParams.get("id") || "").trim();
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const assetId = readAssetIdFromRequest(req);
  if (!assetId) {
    return NextResponse.json({ ok: false, error: "Missing asset id" }, { status: 400 });
  }

  await dbConnect();

  try {
    const payload = (await req.json().catch(() => null)) as
      | {
          label?: unknown;
          tags?: unknown;
          allowedIn?: unknown;
        }
      | null;

    const label = String(payload?.label || "").trim();
    if (!label) {
      return NextResponse.json({ ok: false, error: "Label is required" }, { status: 400 });
    }

    const tags = splitMediaListValue(payload?.tags);
    const allowedIn = splitMediaListValue(payload?.allowedIn);

    const updated = await updateSystemAssetMetadataRepository(assetId, {
      label,
      tags,
      allowedIn,
    });

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: normalizeAssetItem(updated) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const assetId = readAssetIdFromRequest(req);
  if (!assetId) {
    return NextResponse.json({ ok: false, error: "Missing asset id" }, { status: 400 });
  }

  await dbConnect();

  try {
    const existing = await findSystemAssetByIdRepository(assetId);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
    }

    const blobUrl = String(existing.url || "").trim();
    if (blobUrl) {
      await del(blobUrl, { token: getBlobReadWriteToken() });
    }

    const deleted = await deleteSystemAssetRepository(assetId);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: normalizeAssetItem(deleted) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
