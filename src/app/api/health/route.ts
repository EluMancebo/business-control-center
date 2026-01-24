import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    project: "Business Control Center",
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
}
