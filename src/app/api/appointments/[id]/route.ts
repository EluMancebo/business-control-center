import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment } from "@/models/Appointment";
import { AppointmentUpdateSchema } from "@/validators/appointments";

const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const appointment = await Appointment.findOne({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  })
    .populate("serviceId", "name durationMinutes")
    .populate("resourceId", "name color type")
    .lean();

  if (!appointment) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ appointment });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const json = await req.json();
  const parsed = AppointmentUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, businessId: BUSINESS_ID_DEV },
    parsed.data,
    { new: true }
  ).lean();

  if (!appointment) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ appointment });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const deleted = await Appointment.findOneAndDelete({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
