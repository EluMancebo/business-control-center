 import { NextResponse, NextRequest } from "next/server";
import { getSessionFromToken } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get(process.env.COOKIE_NAME || "token")?.value || null;

  const session = getSessionFromToken(token);

  return NextResponse.json({ user: session ?? null });
}
   
