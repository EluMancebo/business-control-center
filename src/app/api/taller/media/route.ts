import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { dbConnect } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { getSessionFromToken } from "@/lib/auth/session";

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

function splitList(value: unknown): string[] {
  const raw = String(value || "").trim();
  if (!raw) return [];
  // soporta "a,b,c" o "a b c"
  return raw
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
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

  // ✅ Taller (Capa -1): SOLO system
  const scope = "system";
  const status: "active" | "archived" = statusParam === "archived" ? "archived" : "active";

  const query: {
    businessId: null;
    scope: "system";
    status: "active" | "archived";
    tags?: string;
  } = {
    businessId: null,
    scope,
    status,
  };

  if (tag) query.tags = tag; // matches arrays containing tag

  const items = await Asset.find(query).sort({ createdAt: -1 }).limit(200).lean();
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
    const tags = splitList(form.get("tag"));
    const allowedIn = splitList(form.get("allowedIn"));

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const safeLabel =
      label.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 60) || "asset";
    const storageKey = `system/${Date.now()}-${safeLabel}.${ext}`;

    const blob = await put(storageKey, file, {
      access: "public",
      contentType: file.type || undefined,
    });

    const kind = file.type.includes("svg")
      ? "svg"
      : file.type.startsWith("video/")
      ? "video"
      : "image";

    const created = await Asset.create({
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