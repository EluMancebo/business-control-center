import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.COOKIE_NAME || "token";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });

  // Borra la cookie de sesión/token
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}
