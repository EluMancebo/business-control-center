import { NextResponse, NextRequest } from "next/server";
import { getSessionFromToken } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "token";
  const token = req.cookies.get(cookieName)?.value;

  // ✅ Si no hay token, NO llamamos a nada: respuesta inmediata
  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const session = getSessionFromToken(token);
    return NextResponse.json({ user: session ?? null });
  } catch {
    // ✅ Si el token está mal / expirado / rompe verify, no bloqueamos la app
    return NextResponse.json({ user: null });
  }
}
   
