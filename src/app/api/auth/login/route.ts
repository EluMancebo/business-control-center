 import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

const COOKIE_NAME: string = process.env.COOKIE_NAME || "token";
const JWT_EXPIRES: string = process.env.JWT_EXPIRES || "7d";

// ✅ Validación estricta de variables de entorno
if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");
if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET in .env.local");

// ✅ “Congelamos” tipos para TypeScript (ya validados arriba)
const MONGODB_URI: string = process.env.MONGODB_URI;
const JWT_SECRET: string = process.env.JWT_SECRET;

// ✅ ExpiresIn tipado correcto (evita error TS)
type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;
const EXPIRES_IN: ExpiresIn = JWT_EXPIRES as ExpiresIn;

declare global {
  // Cache global para no abrir muchas conexiones en desarrollo
  
  var _mongooseLoginConn: Promise<typeof mongoose> | null;
}

async function connectDB() {
  if (!global._mongooseLoginConn) {
    global._mongooseLoginConn = mongoose.connect(MONGODB_URI, {
      dbName: "business_control_center",
    });
  }
  return global._mongooseLoginConn;
}

// Modelo mínimo local (no rompe nada). Luego lo refactorizamos si ya tienes modelo real.
const UserSchema =
  mongoose.models.User?.schema ||
  new mongoose.Schema(
    {
      name: { type: String },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      role: { type: String, default: "owner" },
      businessId: { type: String },
    },
    { timestamps: true }
  );

const User = mongoose.models.User || mongoose.model("User", UserSchema);

type LeanUser = {
  _id: mongoose.Types.ObjectId;
  passwordHash: string;
  role?: string;
  businessId?: string;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const email = String(body?.email || "").toLowerCase().trim();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email }).lean<LeanUser | null>();
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const payload = {
    sub: String(user._id),
    role: String(user.role || "owner"),
    businessId: user.businessId ? String(user.businessId) : undefined,
  };

  const options: SignOptions = { expiresIn: EXPIRES_IN };
  const token = jwt.sign(payload, JWT_SECRET as Secret, options);

  const res = NextResponse.json({ ok: true }, { status: 200 });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}
 
