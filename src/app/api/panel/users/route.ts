// src/app/api/panel/users/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireCapability } from "@/lib/auth/serverSession";
import { hashPassword } from "@/lib/auth/password";
import { CreateUserSchema } from "@/validators/users";

export async function GET() {
  try {
    const session = await requireCapability("CAN_MANAGE_USERS");
    if (!session.businessId) {
      return NextResponse.json({ error: "NO_BUSINESS_IN_SESSION" }, { status: 400 });
    }

    await dbConnect();

    const users = await User.find({ businessId: session.businessId })
      .select("_id name email role createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        ok: true,
        users: users.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    const status = msg === "NO_TOKEN" || msg === "INVALID_TOKEN" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireCapability("CAN_MANAGE_USERS");
    if (!session.businessId) {
      return NextResponse.json({ error: "NO_BUSINESS_IN_SESSION" }, { status: 400 });
    }

    await dbConnect();

    const json = await req.json().catch(() => null);
    const parsed = CreateUserSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = String(parsed.data.email).toLowerCase().trim();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await User.create({
      businessId: session.businessId,
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role, // marketing | staff
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    const status = msg === "NO_TOKEN" || msg === "INVALID_TOKEN" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status });
  }
}
    