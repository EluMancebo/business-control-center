import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { getSessionFromToken } from "@/lib/auth/session";
import {
  applyMediaListCanonicalFilters,
  buildSystemMediaListQuery,
  normalizeAssetItem,
} from "@/lib/taller/media/service";

function getToken(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  return req.cookies.get(cookieName)?.value || null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const session = getSessionFromToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();
  const allowedIn = (searchParams.get("allowedIn") || "").trim();
  const statusParam = (searchParams.get("status") || "active").trim();
  const assetRole = (searchParams.get("assetRole") || "").trim();
  const formatKind = (searchParams.get("formatKind") || "").trim();
  const allowedComponent = (searchParams.get("allowedComponent") || "").trim();
  const reviewStatus = (searchParams.get("reviewStatus") || "").trim();
  const preferredUsage = (searchParams.get("preferredUsage") || "").trim();
  const orientation = (searchParams.get("orientation") || "").trim();
  const pipelineStatus = (searchParams.get("pipelineStatus") || "").trim();
  const variantKey = (searchParams.get("variantKey") || "").trim();

  const query = buildSystemMediaListQuery({
    statusParam,
    tag,
    allowedIn,
    pipelineStatus,
    variantKey,
  });

  const normalizedItems = (await Asset.find(query).sort({ createdAt: -1 }).limit(200).lean()).map(
    (item) => normalizeAssetItem(item)
  );
  const items = applyMediaListCanonicalFilters(normalizedItems, {
    search,
    scope: "system",
    status: statusParam,
    assetRole,
    formatKind,
    allowedComponent,
    reviewStatus,
    preferredUsage,
    orientation,
  });

  return NextResponse.json({ ok: true, items });
}

