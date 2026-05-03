import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { AppointmentResource } from "@/models/AppointmentResource";
import { AppointmentResourceSchema } from "@/validators/appointments";

const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

export async function GET() {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json(
      { error: "Falta BUSINESS_ID_DEV en .env.local (temporal para el MVP)" },
      { status: 500 }
    );
  }

  const resources = await AppointmentResource.find({
    businessId: BUSINESS_ID_DEV,
    active: true,
  })
    .sort({ name: 1 })
    .lean();

  return NextResponse.json({ resources });
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
  const parsed = AppointmentResourceSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const resource = await AppointmentResource.create({
    businessId: BUSINESS_ID_DEV,
    ...parsed.data,
  });

  return NextResponse.json({ resource }, { status: 201 });
}
