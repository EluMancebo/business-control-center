import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { getSessionFromToken } from "@/lib/auth/session";
import { normalizeAssetItem, parseAssetPipelineStatusParam, parseAssetVariantKeyParam } from "@/lib/taller/media/service";
import type { AssetPipelineStatus, AssetVariantKey } from "@/lib/taller/media/types";

type AssetQuery = {
  scope: "system" | "tenant";
  status: "active" | "archived";
  tags?: string;
  allowedIn?: string;
  pipelineStatus?: AssetPipelineStatus;
  variantKey?: AssetVariantKey;
};

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
  const tag = (searchParams.get("tag") || "").trim();
  const allowedIn = (searchParams.get("allowedIn") || "").trim();
  const pipelineStatus = parseAssetPipelineStatusParam(
    (searchParams.get("pipelineStatus") || "").trim()
  );
  const variantKey = parseAssetVariantKeyParam((searchParams.get("variantKey") || "").trim());

  const query: AssetQuery = { scope: "system", status: "active" };
  if (tag) query.tags = tag;
  if (allowedIn) query.allowedIn = allowedIn;
  if (pipelineStatus) query.pipelineStatus = pipelineStatus;
  if (variantKey) query.variantKey = variantKey;

  const items = (await Asset.find(query).sort({ createdAt: -1 }).limit(200).lean()).map((item) =>
    normalizeAssetItem(item)
  );

  return NextResponse.json({ ok: true, items });
}

