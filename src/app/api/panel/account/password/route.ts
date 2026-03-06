// src/app/api/panel/account/password/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireSession } from "@/lib/auth/serverSession";
import { ChangePasswordSchema } from "@/validators/account";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

type LeanUser = {
  _id: unknown;
  passwordHash: string;
};

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();

    if (!session.sub) {
      return NextResponse.json({ error: "NO_SUB_IN_SESSION" }, { status: 401 });
    }

    await dbConnect();

    const json = await req.json().catch(() => null);
    const parsed = ChangePasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await User.findById(session.sub).select("passwordHash").lean<LeanUser | null>();
    if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

    const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "INVALID_CURRENT_PASSWORD" }, { status: 401 });

    const nextHash = await hashPassword(parsed.data.newPassword);
    await User.updateOne({ _id: session.sub }, { $set: { passwordHash: nextHash } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    const status = msg === "NO_TOKEN" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}    
