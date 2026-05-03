import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment } from "@/models/Appointment";
import { AppointmentSchema } from "@/validators/appointments";

const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

export async function GET(req: NextRequest) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json(
      { error: "Falta BUSINESS_ID_DEV en .env.local (temporal para el MVP)" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const query: Record<string, unknown> = { businessId: BUSINESS_ID_DEV };
  if (date) query.date = date;

  const appointments = await Appointment.find(query)
    .populate("serviceId", "name durationMinutes color")
    .populate("resourceId", "name color type")
    .sort({ date: 1, startTime: 1 })
    .lean();

  return NextResponse.json({ appointments });
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
  const parsed = AppointmentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const appointment = await Appointment.create({
    businessId: BUSINESS_ID_DEV,
    ...parsed.data,
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
