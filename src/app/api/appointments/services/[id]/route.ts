import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { AppointmentService } from "@/models/AppointmentService";
import { AppointmentServiceUpdateSchema } from "@/validators/appointments";

const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const service = await AppointmentService.findOne({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!service) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ service });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const json = await req.json();
  const parsed = AppointmentServiceUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = await AppointmentService.findOneAndUpdate(
    { _id: id, businessId: BUSINESS_ID_DEV },
    parsed.data,
    { new: true }
  ).lean();

  if (!service) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ service });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const deleted = await AppointmentService.findOneAndDelete({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
