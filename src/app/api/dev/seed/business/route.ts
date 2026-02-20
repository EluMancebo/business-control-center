import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";

export async function POST(req: Request) {
  // NUNCA en producción
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "Caballeros Barbería").trim();
  const slug = String(body.slug || "caballeros-barberia").trim().toLowerCase();

  const doc = await Business.findOneAndUpdate(
    { slug },
    { $set: { name, slug } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true, business: doc });
}
