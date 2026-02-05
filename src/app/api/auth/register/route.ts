import { NextResponse } from "next/server";
import { dbConnect } from "@/src/lib/db";
import { Business } from "@/src/models/Business";
import { User } from "@/src/models/User";
import { RegisterSchema } from "@/src/validators/auth";
import { hashPassword } from "@/src/lib/auth/password";
import { signToken } from "@/src/lib/auth/jwt";
export async function POST(req: Request) {
  await dbConnect();
  const json = await req.json();
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { businessName, businessSlug, name, email, password } = parsed.data;

  // 1) Comprobar si ya existe el email
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return NextResponse.json(
      { error: "El email ya está registrado" },
      { status: 409 }
    );
  }
  // 2) Comprobar si ya existe el slug del negocio
  const existingBusiness = await Business.findOne({ slug: businessSlug }).lean();
  if (existingBusiness) {
    return NextResponse.json(
      { error: "El slug del negocio ya existe" },
      { status: 409 }
    );
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
    email,
    passwordHash,
    role: "owner",
  });
  // 5) Crear token
  const token = signToken({
    id: String(user._id),
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
  res.cookies.set(process.env.COOKIE_NAME || "token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res;
}
