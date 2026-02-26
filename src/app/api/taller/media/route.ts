import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { dbConnect } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { getSessionFromToken } from "@/lib/auth/session";

function getToken(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  return req.cookies.get(cookieName)?.value || null;
}

function isAdmin(req: NextRequest) {
  const token = getToken(req);
  const session = getSessionFromToken(token);
  return Boolean(session && session.role === "admin");
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const tag = (searchParams.get("tag") || "").trim();
  const scopeParam = (searchParams.get("scope") || "system").trim();
  const statusParam = (searchParams.get("status") || "active").trim();

  const scope = scopeParam === "tenant" ? "tenant" : "system";
  const status = statusParam === "archived" ? "archived" : "active";

  const query: {
    scope: "system" | "tenant";
    status: "active" | "archived";
    tags?: string;
  } = { scope, status };

  if (tag) query.tags = tag;

  const items = await Asset.find(query).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const form = await req.formData();
  const file = form.get("file");

  const label = String(form.get("label") || "").trim() || "Asset";
  const tag = String(form.get("tag") || "").trim();
  const allowedIn = String(form.get("allowedIn") || "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 60) || "asset";
  const storageKey = `system/${Date.now()}-${safeLabel}.${ext}`;

  const blob = await put(storageKey, file, { access: "public" });

  const created = await Asset.create({
    businessId: null,
    scope: "system",
    kind: file.type.includes("svg")
      ? "svg"
      : file.type.startsWith("video/")
      ? "video"
      : "image",
    bucket: "vercel-blob",
    key: blob.pathname,
    url: blob.url,
    label,
    tags: tag ? [tag] : [],
    allowedIn: allowedIn ? [allowedIn] : [],
    mime: file.type || "",
    bytes: file.size || 0,
    status: "active",
  });

  return NextResponse.json({ ok: true, item: created });
}    