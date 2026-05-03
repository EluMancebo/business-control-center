import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { AppointmentService } from "@/models/AppointmentService";
import { AppointmentServiceSchema } from "@/validators/appointments";

const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

export async function GET() {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json(
      { error: "Falta BUSINESS_ID_DEV en .env.local (temporal para el MVP)" },
      { status: 500 }
    );
  }

  const services = await AppointmentService.find({ businessId: BUSINESS_ID_DEV })
    .sort({ name: 1 })
    .lean();

  return NextResponse.json({ services });
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
  const parsed = AppointmentServiceSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = await AppointmentService.create({
    businessId: BUSINESS_ID_DEV,
    ...parsed.data,
  });

  return NextResponse.json({ service }, { status: 201 });
}
