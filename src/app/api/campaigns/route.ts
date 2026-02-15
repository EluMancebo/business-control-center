import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Campaign } from "@/models/Campaign";
import { CampaignCreateSchema } from "@/validators/campaign";

// ⚠️ MVP: businessId fijo (luego lo sacamos del token)
const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

export async function GET() {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json(
      { error: "Falta BUSINESS_ID_DEV en .env.local (temporal para el MVP)" },
      { status: 500 }
    );
  }

  const campaigns = await Campaign.find({ businessId: BUSINESS_ID_DEV })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json(
      { error: "Falta BUSINESS_ID_DEV en .env.local (temporal para el MVP)" },
      { status: 500 }
    );
  }

  const json = await req.json();
  const parsed = CampaignCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, objective, channels, status, startAt, endAt } = parsed.data;

  const campaign = await Campaign.create({
    businessId: BUSINESS_ID_DEV,
    name,
    objective,
    channels: channels ?? ["web"],
    status: status ?? "draft",
    startAt: new Date(startAt),
    endAt: new Date(endAt),
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
