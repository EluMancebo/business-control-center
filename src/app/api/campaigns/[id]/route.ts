import { NextResponse } from "next/server";
import { dbConnect } from "@/src/lib/db";
import { Campaign } from "@/src/models/Campaign";

import { CampaignUpdateSchema } from "@/src/validators/campaign";


const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  await dbConnect();
  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const campaign = await Campaign.findOne({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!campaign) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function PUT(req: Request, { params }: RouteContext) {
  await dbConnect();
  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const json = await req.json();
  const parsed = CampaignUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const update = { ...parsed.data } as Record<string, unknown>;

  if (typeof update.startAt === "string") update.startAt = new Date(update.startAt);
  if (typeof update.endAt === "string") update.endAt = new Date(update.endAt);

  const campaign = await Campaign.findOneAndUpdate(
    { _id: id, businessId: BUSINESS_ID_DEV },
    update,
    { new: true }
  ).lean();

  if (!campaign) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  await dbConnect();
  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const deleted = await Campaign.findOneAndDelete({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
 