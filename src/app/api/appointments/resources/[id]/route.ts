import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { AppointmentResource } from "@/models/AppointmentResource";
import { AppointmentResourceUpdateSchema } from "@/validators/appointments";

const BUSINESS_ID_DEV = process.env.BUSINESS_ID_DEV;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const resource = await AppointmentResource.findOne({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!resource) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ resource });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const json = await req.json();
  const parsed = AppointmentResourceUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const resource = await AppointmentResource.findOneAndUpdate(
    { _id: id, businessId: BUSINESS_ID_DEV },
    parsed.data,
    { new: true }
  ).lean();

  if (!resource) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ resource });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  if (!BUSINESS_ID_DEV) {
    return NextResponse.json({ error: "Falta BUSINESS_ID_DEV" }, { status: 500 });
  }

  const { id } = await params;

  const deleted = await AppointmentResource.findOneAndDelete({
    _id: id,
    businessId: BUSINESS_ID_DEV,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
