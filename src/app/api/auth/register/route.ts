// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import { User } from "@/models/User";
import { RegisterSchema } from "@/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";

function isLocalhostRequest(req: Request) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  return host.includes("localhost") || host.includes("127.0.0.1");
}

export async function POST(req: Request) {
  await dbConnect();

  const json = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { businessName, businessSlug, name, email, password } = parsed.data;

  // 1) Comprobar si ya existe el email
  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
  if (existingUser) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
  }

  // 2) Comprobar si ya existe el slug del negocio
  const existingBusiness = await Business.findOne({ slug: businessSlug }).lean();
  if (existingBusiness) {
    return NextResponse.json({ error: "El slug del negocio ya existe" }, { status: 409 });
  }

  // 3) Crear Business
  const business = await Business.create({
    name: businessName,
    slug: businessSlug,
  });

  // 4) Crear User owner
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    businessId: business._id,
    name,
    email: String(email).toLowerCase().trim(),
    passwordHash,
    role: "owner",
  });

  // 5) Crear token
  // ⚠️ IMPORTANTÍSIMO: tu app usa requireSession() que lee payload.sub
  // Por eso firmamos con "sub" (igual que login).
  const token = signToken({
    sub: String(user._id),
    businessId: String(business._id),
    role: user.role,
    email: user.email,
  });

  // 6) Set cookie (en la respuesta)
  const res = NextResponse.json(
    {
      ok: true,
      business: { id: String(business._id), name: business.name, slug: business.slug },
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    },
    { status: 201 }
  );

  const isLocal = isLocalhostRequest(req);

  res.cookies.set(process.env.COOKIE_NAME || "token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !isLocal, // ✅ en localhost: false
    path: "/",
  });

  return res;
}  
