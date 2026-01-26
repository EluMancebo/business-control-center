import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: true, message: "login route placeholder" },
    { status: 200 }
  );
}
