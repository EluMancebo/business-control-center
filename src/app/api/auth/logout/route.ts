import { NextResponse } from "next/server";

export async function POST() {
  // Aquí luego borraremos cookie/token de sesión
  return NextResponse.json({ ok: true, message: "logout route placeholder" });
}
